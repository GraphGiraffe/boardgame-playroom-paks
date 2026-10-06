#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
app_dir=""
full=false

usage() {
  cat <<'HELP'
Usage: scripts/codex/check.sh [--full --app-dir PATH]

Check every pack JavaScript file, rebuild the distribution and verify hashes.
--full --app-dir PATH   Then run the application's full checks using these packs.
Run setup.sh first to prepare any application development dependencies.
HELP
}

fail() { printf 'Error: %s\n' "$*" >&2; exit 2; }

while (($#)); do
  case "$1" in
    --app-dir)
      (($# >= 2)) && [[ -n "$2" && "$2" != --* ]] || fail '--app-dir requires a path'
      [[ -z "$app_dir" ]] || fail '--app-dir was specified twice'
      app_dir="$2"; shift 2 ;;
    --full) full=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) fail "Unknown argument: $1" ;;
  esac
done

if [[ "$full" == true && -z "$app_dir" ]]; then fail '--full requires --app-dir'; fi
if [[ -n "$app_dir" ]]; then
  [[ "$full" == true ]] || fail '--app-dir requires --full'
  [[ -d "$app_dir" ]] || fail "Application checkout does not exist: $app_dir"
  app_dir="$(cd -- "$app_dir" && pwd)"
  [[ -f "$app_dir/scripts/codex/check.sh" ]] || fail "Application checks are missing: $app_dir/scripts/codex/check.sh"
fi

command -v node >/dev/null 2>&1 || fail 'Node.js 22+ is required; select the version in .nvmrc'
command -v python3 >/dev/null 2>&1 || fail 'Python 3.9+ is required'
node -e 'if (Number(process.versions.node.split(".")[0]) < 22) { console.error("Node.js 22+ is required"); process.exit(1); }'
python3 -c 'import sys; sys.exit("Python 3.9+ is required") if sys.version_info < (3, 9) else None'

python3 - "$repo_dir" <<'PY'
from pathlib import Path
import subprocess
import sys

scripts = sorted((Path(sys.argv[1]) / "packs").rglob("*.js"))
if not scripts:
    raise SystemExit("No pack JavaScript files found")
for script in scripts:
    subprocess.run(["node", "--check", str(script)], check=True)
print(f"JavaScript syntax: {len(scripts)} files checked.")
PY

bash "$repo_dir/build.sh"
python3 - "$repo_dir/dist" <<'PY'
from pathlib import Path
import hashlib
import re
import sys

output = Path(sys.argv[1]).resolve()
lines = (output / "SHA256SUMS").read_text(encoding="ascii").splitlines()
if not lines:
    raise SystemExit("SHA256SUMS is empty")
for line in lines:
    match = re.fullmatch(r"([a-f0-9]{64})  ([^/\\\x00]+)", line)
    if not match:
        raise SystemExit("Invalid SHA256SUMS entry")
    digest, name = match.groups()
    artifact = (output / name).resolve()
    if artifact.parent != output or not artifact.is_file():
        raise SystemExit(f"Missing distribution file: {name}")
    if hashlib.sha256(artifact.read_bytes()).hexdigest() != digest:
        raise SystemExit(f"Checksum mismatch: {name}")
print(f"SHA256: {len(lines)} distribution files verified.")
PY

if [[ "$full" == true ]]; then
  bash "$app_dir/scripts/codex/check.sh" --full --packs-dir "$repo_dir/packs"
  printf 'Passed: packs and full application checks.\n'
else
  printf 'Passed: standalone pack syntax, build and checksums.\n'
fi
