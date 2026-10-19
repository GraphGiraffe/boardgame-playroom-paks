#!/usr/bin/env python3
"""Publish verified pack files to R2, then switch one catalog pointer."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile

WRANGLER = "wrangler@4.149.0"
IDS = {"spider", "klondike", "uno", "domino", "durak", "checkers", "snakes", "tictactoe", "battleship", "pexeso", "ludo", "yatzy", "gofish", "oldmaid"}
SEMVER = re.compile(r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?")
HEX = re.compile(r"[a-f0-9]{64}")


def channel_prefix(channel):
    if not channel:
        return ""
    if not re.fullmatch(r"[a-z0-9][a-z0-9.-]{0,63}",channel):
        raise ValueError("Invalid catalog channel")
    return f"channels/{channel}/"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode()


def wrangler(bucket, command, key, path):
    args = ["npx", "--yes", WRANGLER, "r2", "object", command, f"{bucket}/{key}", "--remote", "--file", str(path)]
    if command == "put":
        args += ["--content-type", "application/json"]
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(f"R2 {command} failed for {key}: {result.stderr.strip()[:240]}")


def download(bucket, key, folder):
    path = folder / "download"
    wrangler(bucket, "get", key, path)
    return path.read_bytes()


def upload_checked(bucket, key, data, folder):
    source = folder / "upload"
    source.write_bytes(data)
    wrangler(bucket, "put", key, source)
    if download(bucket, key, folder) != data:
        raise RuntimeError(f"R2 verification failed for {key}")


def checked_assets(folder, only=None):
    sums = {}
    for line in (folder / "SHA256SUMS").read_text(encoding="ascii").splitlines():
        match = re.fullmatch(r"([a-f0-9]{64})  \*?([^/\\]+)", line)
        if not match or match[2] in sums:
            raise ValueError("Invalid SHA256SUMS")
        sums[match[2]] = match[1]
    selected = {}
    for path in sorted(folder.glob("*.playroom-pack.json")):
        if path.name not in sums:
            continue
        if digest(path.read_bytes()) != sums[path.name]:
            raise ValueError("Pack asset checksum mismatch: " + path.name)
        data = json.loads(path.read_bytes())
        manifest = data.get("manifest", {})
        ident, version = manifest.get("id"), manifest.get("version")
        if ident not in IDS or not isinstance(version, str) or not SEMVER.fullmatch(version) or path.name != f"{ident}-{version}.playroom-pack.json":
            raise ValueError("Invalid pack asset: " + path.name)
        if ident in selected:
            raise ValueError("Duplicate pack ID")
        if only is None or ident == only:
            selected[ident] = (path, manifest, sums[path.name])
    if not selected or only and only not in selected:
        raise ValueError("Selected pack asset is missing")
    return selected


def current(bucket, folder, bootstrap=False, prefix=""):
    try:
        pointer = download(bucket, prefix + "catalog/current.json", folder)
    except RuntimeError as error:
        if bootstrap and re.search(r"(?:not found|404|does not exist|no such key)", str(error), re.I):
            return None, None
        raise
    info = json.loads(pointer)
    if info.get("version") != 1 or not HEX.fullmatch(info.get("sha256", "")) or info.get("key") != f"{prefix}catalog/snapshots/{info['sha256']}.json":
        raise ValueError("Invalid current catalog pointer")
    body = download(bucket, info["key"], folder)
    if digest(body) != info["sha256"]:
        raise ValueError("Current catalog checksum mismatch")
    catalog = json.loads(body)
    if catalog.get("format") != "playroom-catalog" or catalog.get("version") != 1:
        raise ValueError("Invalid current catalog")
    return pointer, catalog


def publish(args):
    if not SEMVER.fullmatch(args.collection):
        raise ValueError("Invalid collection version")
    prefix = channel_prefix(getattr(args,"channel",""))
    assets = checked_assets(args.assets, args.only)
    with tempfile.TemporaryDirectory(prefix="playroom-packs-") as temporary:
        folder = Path(temporary)
        if args.dry_run:
            pointer = None
            if args.base_catalog:
                prior = json.loads(args.base_catalog.read_text())
            elif args.only and not args.bootstrap:
                prior = current(args.bucket, folder, prefix=prefix)[1]
            else:
                prior = None
        else:
            pointer, prior = current(args.bucket, folder, args.bootstrap, prefix)
            if pointer is not None:
                print("Previous catalog snapshot:", json.loads(pointer)["sha256"], flush=True)
        entries = {item["id"]: item for item in prior.get("packs", [])} if prior else {}
        for ident, (path, manifest, sha) in assets.items():
            version = manifest["version"]
            key = f"files/{ident}/{version}/{sha}.playroom-pack.json"
            entries[ident] = {"id": ident, "version": version, "stateVersion": manifest["stateVersion"], "engineApi": manifest["engineApi"], "viewApi": manifest["viewApi"], "sha256": sha, "url": "/api/packs/" + key}
            if not args.dry_run:
                upload_checked(args.bucket, key, path.read_bytes(), folder)
        if set(entries) != IDS:
            raise ValueError("Catalog must contain all twelve games")
        catalog = {"format": "playroom-catalog", "version": 1, "collection": args.collection, "packs": [entries[key] for key in sorted(entries)]}
        body = canonical(catalog)
        sha = digest(body)
        if args.dry_run:
            print(body.decode(), end="")
            print("Snapshot SHA256:", sha)
            return
        if pointer is not None and download(args.bucket, prefix + "catalog/current.json", folder) != pointer:
            raise RuntimeError("Catalog pointer changed during publication")
        key = f"{prefix}catalog/snapshots/{sha}.json"
        upload_checked(args.bucket, key, body, folder)
        next_pointer = canonical({"version": 1, "key": key, "sha256": sha})
        upload_checked(args.bucket, prefix + "catalog/current.json", next_pointer, folder)
        print(f"Published collection {args.collection}; catalog snapshot {sha}; changed packs: {', '.join(sorted(assets))}")


def rollback(args):
    prefix = channel_prefix(getattr(args,"channel",""))
    if not HEX.fullmatch(args.rollback):
        raise ValueError("Invalid snapshot SHA256")
    with tempfile.TemporaryDirectory(prefix="playroom-packs-") as temporary:
        folder = Path(temporary)
        key = f"{prefix}catalog/snapshots/{args.rollback}.json"
        body = download(args.bucket, key, folder)
        if digest(body) != args.rollback:
            raise ValueError("Snapshot checksum mismatch")
        catalog = json.loads(body)
        if catalog.get("format") != "playroom-catalog" or set(item.get("id") for item in catalog.get("packs", [])) != IDS:
            raise ValueError("Invalid rollback catalog")
        for item in catalog["packs"]:
            remote = download(args.bucket, item["url"].removeprefix("/api/packs/"), folder)
            if digest(remote) != item["sha256"]:
                raise ValueError("Rollback pack checksum mismatch: " + item["id"])
        upload_checked(args.bucket, prefix + "catalog/current.json", canonical({"version": 1, "key": key, "sha256": args.rollback}), folder)
        print("Rolled back catalog to", args.rollback)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bucket", required=True)
    parser.add_argument("--channel", default="", help="Isolated catalog channel; empty selects production")
    parser.add_argument("--assets", type=Path)
    parser.add_argument("--collection")
    parser.add_argument("--only", choices=sorted(IDS))
    parser.add_argument("--bootstrap", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--base-catalog", type=Path)
    parser.add_argument("--rollback")
    args = parser.parse_args()
    if args.rollback:
        if args.assets or args.collection or args.only or args.bootstrap or args.dry_run:
            parser.error("Rollback accepts only --bucket and --rollback")
        rollback(args)
    else:
        if not args.assets or not args.collection:
            parser.error("Publication requires --assets and --collection")
        publish(args)
