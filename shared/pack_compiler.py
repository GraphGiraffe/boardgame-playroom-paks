"""Canonical offline pack compiler. No app checkout, network or Web UI dependency."""
import base64
import hashlib
import json
import mimetypes
from pathlib import Path, PurePosixPath
import re

MAX_PACK_BYTES = 4_000_000
TARGET_PACK_BYTES = 500_000
MAX_PACK_FILES = 128
MAX_SAFE_INTEGER = 9007199254740991
TEXT_EXTENSIONS = {".css", ".js", ".json", ".md", ".svg", ".txt"}
ID = re.compile(r"[a-z][a-z0-9_-]{0,63}", re.ASCII)
SEMVER = re.compile(
    r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)"
    r"(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)"
    r"(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?"
    r"(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?", re.ASCII)
DATA_URL = re.compile(
    r"data:(?:(?:image|audio|font)/[\w.+-]+|application/(?:octet-stream|json|font-[\w-]+))"
    r"(?:;[\w=.+-]+)*(?:;base64)?,", re.IGNORECASE | re.ASCII)
PACK_ASSET_URL = re.compile(r"url\(\s*(?:(['\"])(.*?)\1|([^)]*))\s*\)", re.IGNORECASE | re.DOTALL)
ENTRY_POINTS = {"rules": "rules.js", "view": "view.js", "styles": "styles.css"}



def json_text(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n"

def parse_json(text):
    def invalid_constant(value):
        raise ValueError(f"Недопустимое значение JSON: {value}")
    return json.loads(text, parse_constant=invalid_constant)

def path_ok(name):
    return (isinstance(name, str) and len(name) <= 180 and not name.startswith("/") and "\\" not in name
            and all(part not in {"", ".", ".."} and re.fullmatch(r"[A-Za-z0-9_. -]+", part)
                    for part in name.split("/")))

def number_equals(value, expected):
    return type(value) in (int, float) and value == expected

def js_trim(value):
    return value.strip("\u0009\u000a\u000b\u000c\u000d\u0020\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff")

def validate_parameter_previews(manifest, label):
    """Bounded, public presentation hints; never executable rules or HTML."""
    settings = manifest.get("settings", [])
    preset = manifest.get("presetSetting", {})
    if not isinstance(settings, list) or not isinstance(preset, dict):
        raise ValueError(f"Некорректная иллюстрация параметра: {label}")
    sdk = manifest.get("sdkFeatures", [])
    if (not isinstance(sdk, list) or len(sdk) > 16 or any(not isinstance(f, str) or f not in {"local-input-v1", "turn-order-v1", "parameter-previews-v2", "parameter-illustrations-v1", "standard-parameter-ui-v1", "arrival-departures-v1", "concurrent-reactions-v1", "player-status-v1", "isolated-execution-v1"} for f in sdk) or len(set(sdk)) != len(sdk)):
        raise ValueError(f"Неподдерживаемая возможность SDK: {label}")
    if any(isinstance(f, dict) and (f.get("presentation") == "mode" or "inactiveWhen" in f or "inactivePresentation" in f) for f in settings) and "parameter-previews-v2" not in sdk:
        raise ValueError(f"Требуется SDK parameter-previews-v2: {label}")
    fields = {f.get("key"): f for f in settings if isinstance(f, dict) and isinstance(f.get("key"), str)}
    quantities = {"cards", "dice", "health", "lives"}
    symbols = {"undo", "first", "people", "shuffle", "rules", "player", "bot", "trophy", "clock", "eye", "eye-off", "hand", "board", "ship", "cards", "dice", "check", "close", "play", "pause", "history", "stop", "grid", "teams", "shield", "sword", "refresh", "star", "pieces", "solitaire", "lock", "unlock"}
    def invalid():
        raise ValueError(f"Некорректная иллюстрация параметра: {label}")
    def count(value):
        return type(value) in (int, float) and 0 <= value <= 100 and int(value) == value
    def text(value, maximum):
        return isinstance(value, str) and bool(js_trim(value)) and len(value.encode("utf-16-le", "surrogatepass")) // 2 <= maximum
    def common_preview(preview, inherited=None, partial=False):
        resolved = {**(inherited or {}), **preview}
        kind = resolved.get("kind")
        allowed = {"declaration": {"kind", "actor", "label"}, "symbol": {"kind", "icon"}, "illustrations": {"kind", "ids"}}[kind]
        if not set(preview) <= allowed:
            invalid()
        if kind == "declaration":
            if ((not partial or "actor" in resolved) and resolved.get("actor") not in ("human", "bot")
                    or (not partial or "label" in resolved) and not text(resolved.get("label"), 24)):
                invalid()
        elif kind == "illustrations":
            if "parameter-illustrations-v1" not in sdk:
                invalid()
            if not partial or "ids" in resolved:
                ids = resolved.get("ids")
                if (not isinstance(ids, list) or not 1 <= len(ids) <= 4
                        or any(not isinstance(ident, str) or not re.fullmatch(r"[A-Za-z0-9._-]{1,64}", ident) for ident in ids)):
                    invalid()
        elif kind == "symbol":
            if (not partial or "icon" in resolved) and (not isinstance(resolved.get("icon"), str) or resolved["icon"] not in symbols):
                invalid()
    if sum(isinstance(f, dict) and f.get("presentation") == "mode" for f in [preset, *settings]) > 1:
        invalid()
    for field in [preset, *settings]:
        if not isinstance(field, dict):
            invalid()
        if "presentation" in field and field["presentation"] != "mode":
            invalid()
        parent = field.get("preview")
        if "preview" in field:
            if not isinstance(parent, dict) or not isinstance(parent.get("kind"), str):
                invalid()
            if parent["kind"] in ("declaration", "symbol", "illustrations"):
                common_preview(parent, partial=True)
            elif set(parent) != {"kind"} or parent["kind"] not in quantities:
                invalid()
        options = field.get("options", [])
        if not isinstance(options, list) or field.get("presentation") == "mode" and not options:
            invalid()
        if "inactiveWhen" in field or "inactivePresentation" in field:
            condition, inactive = field.get("inactiveWhen"), field.get("inactivePresentation")
            if (not isinstance(condition, dict) or not 1 <= len(condition) <= 16
                    or any(not isinstance(key, str) or key not in fields or not isinstance(value, str)
                        or value not in {str(o.get("value")) for o in fields[key].get("options", []) if isinstance(o, dict)}
                        for key, value in condition.items())
                    or not isinstance(inactive, dict) or set(inactive) != {"preview", "description"}):
                invalid()
            options = [*options, inactive]
        for option in options:
            if not isinstance(option, dict):
                invalid()
            if "description" in option and not text(option["description"], 360):
                invalid()
            preview = option.get("preview")
            if "preview" not in option:
                if field.get("presentation") == "mode" and not parent:
                    invalid()
                if parent and parent["kind"] in ("declaration", "symbol", "illustrations"):
                    common_preview({}, parent)
                continue
            if not isinstance(preview, dict):
                invalid()
            kind = preview.get("kind", (parent or {}).get("kind"))
            if not isinstance(kind, str):
                invalid()
            if kind in {"fleet", "teams"}:
                key = "pieces" if kind == "fleet" else "teamSizes"
                values = preview.get(key)
                if (field.get("presentation") != "mode" or set(preview) != {"kind", key}
                        or not isinstance(values, list) or not 1 <= len(values) <= (16 if kind == "fleet" else 8)
                        or any(not count(n) or not 1 <= n <= (16 if kind == "fleet" else 32) for n in values)
                        or sum(values) > (100 if kind == "fleet" else 32)):
                    invalid()
            elif kind in ("declaration", "symbol", "illustrations"):
                common_preview(preview, parent)
            elif kind in quantities:
                if (not set(preview) <= {"kind", "count", "countFrom"}
                        or "count" in preview and "countFrom" in preview or "count" in preview and not count(preview["count"])):
                    invalid()
                if "countFrom" in preview:
                    source = preview["countFrom"]
                    if not isinstance(source, dict) or set(source) != {"field", "values"} or not isinstance(source["field"], str) or source["field"] not in fields:
                        invalid()
                    values = source["values"]
                    ids = {str(o.get("value")) for o in fields[source["field"]].get("options", []) if isinstance(o, dict)}
                    if not isinstance(values, dict) or not 1 <= len(values) <= 16 or any(k not in ids or not count(n) for k, n in values.items()):
                        invalid()
            else:
                invalid()

def validate_manifest(manifest, label):
    if not isinstance(manifest, dict):
        raise ValueError(f"Нет manifest: {label}")
    if "execution" in manifest and manifest["execution"] != "isolated-v1":
        raise ValueError(f"Unsupported pack execution: {label}")
    if manifest.get("execution") == "isolated-v1" and (not isinstance(manifest.get("sdkFeatures"), list) or "isolated-execution-v1" not in manifest["sdkFeatures"]):
        raise ValueError(f"SDK isolated execution feature required: {label}")
    ident, version = manifest.get("id"), manifest.get("version")
    if not isinstance(ident, str) or not ID.fullmatch(ident) or not isinstance(version, str) or not SEMVER.fullmatch(version):
        raise ValueError(f"Некорректные ID/версия пака: {label}")
    if not number_equals(manifest.get("viewApi"), 3):
        raise ValueError(f"Требуется viewApi 3: {label}")
    if "tileTheme" in manifest and manifest["tileTheme"] not in ("green", "coral", "blue", "gold", "violet"):
        raise ValueError(f"Некорректная тема карточки: {label}")
    registry = parse_json(Path(__file__).with_name("tags.json").read_text(encoding="utf-8"))
    known = {item["id"]: item for item in registry["tags"]}
    tags = manifest.get("tags")
    if "tags" in manifest and (not isinstance(tags, list) or not 1 <= len(tags) <= 3
            or any(not isinstance(tag, str) or tag not in known for tag in tags)
            or len(set(tags)) != len(tags) or not any(known[tag]["kind"] == "type" for tag in tags)):
        raise ValueError(f"Некорректные теги пака: {label}")
    modes = manifest.get("playModes")
    if "playModes" in manifest and (not isinstance(modes, list) or not modes or any(
            not isinstance(mode, dict) or not isinstance(mode.get("id"), str)
            or not isinstance(mode.get("teams"), bool) or not isinstance(mode.get("players"), list)
            or not mode["players"] or any(type(n) is not int or not 1 <= n <= 32 for n in mode["players"])
            or len(set(mode["players"])) != len(mode["players"]) for mode in modes)):
        raise ValueError(f"Некорректные составы игроков: {label}")
    families = manifest.get("skinFamilies", [])
    defaults = manifest.get("defaultSkins", {})
    if (not isinstance(families, list) or len(families) > 32 or
            any(not isinstance(family, str) or not ID.fullmatch(family) for family in families) or
            len(set(families)) != len(families) or not isinstance(defaults, dict) or
            any(family not in families or not isinstance(variant, str) or not ID.fullmatch(variant)
                for family, variant in defaults.items())):
        raise ValueError(f"Некорректные скины пака: {label}")
    state = manifest.get("stateVersion")
    if (type(manifest.get("engineApi")) not in (int, float) or manifest.get("engineApi") != 4 or type(state) not in (int, float)
            or not 1 <= state <= MAX_SAFE_INTEGER or int(state) != state):
        raise ValueError(f"Неподдерживаемый API/состояние пака: {label}")
    name = manifest.get("name")
    if not isinstance(name, str) or not js_trim(name) or len(name.encode("utf-16-le", "surrogatepass")) // 2 > 120:
        raise ValueError(f"Нет названия пака или оно длиннее 120 символов: {label}")
    if "shortName" in manifest:
        short_name = manifest["shortName"]
        if (not isinstance(short_name, str) or not js_trim(short_name)
                or len(short_name.encode("utf-16-le", "surrogatepass")) // 2 > 60):
            raise ValueError(f"Неверное короткое название пака: {label}")
    for key, filename in {**ENTRY_POINTS, "sounds": "sounds.js"}.items():
        if key in manifest and manifest[key] != filename:
            raise ValueError(f"Неподдерживаемая точка входа {key}: {label}")
    modules = manifest.get("sharedDomain", [])
    if (not isinstance(modules, list) or len(modules) > 16
            or any(not isinstance(name, str) or not re.fullmatch(r"[a-z][a-z0-9-]{0,63}", name) for name in modules)
            or len(set(modules)) != len(modules)):
        raise ValueError(f"Некорректные sharedDomain: {label}")
    validate_parameter_previews(manifest, label)
    return manifest

def validate_asset(files, name):
    if not path_ok(name) or name not in files:
        raise ValueError(f"Ресурс отсутствует в паке: {name}")
    value = files[name]
    if re.match(r"data:", value, re.IGNORECASE):
        if not DATA_URL.match(value):
            raise ValueError(f"Неподдерживаемый встроенный ресурс: {name}")
    elif Path(name).suffix.lower() not in TEXT_EXTENSIONS:
        raise ValueError(f"Двоичный ресурс должен быть data URL: {name}")

def validate_bundle(bundle, label, raw=None):
    text = json_text(bundle) if raw is None else raw
    if len(text.encode("utf-8")) > MAX_PACK_BYTES:
        raise ValueError(f"Пак больше 4 MB (4 000 000 байт): {label}")
    if not isinstance(bundle, dict) or bundle.get("format") != "playroom-pack" or not number_equals(bundle.get("formatVersion"), 1):
        raise ValueError(f"Некорректный формат пака: {label}")
    manifest = validate_manifest(bundle.get("manifest"), label)
    files = bundle.get("files")
    if not isinstance(files, dict) or len(files) > MAX_PACK_FILES:
        raise ValueError(f"Нет files или в паке больше 128 файлов: {label}")
    for name, value in files.items():
        if not path_ok(name) or not isinstance(value, str):
            raise ValueError(f"Недопустимый файл пака: {label}")
        if Path(name).suffix.lower() not in TEXT_EXTENSIONS:
            validate_asset(files, name)
    for key, filename in ENTRY_POINTS.items():
        if filename not in files or not js_trim(files[filename]):
            raise ValueError(f"Нет {filename} в паке: {label}")
    if manifest.get("sounds") and not files.get("sounds.js"):
        raise ValueError(f"Нет sounds.js в паке: {label}")
    if manifest.get("execution") == "isolated-v1":
        if any(files.get(name) != marker for name, marker in ISOLATED_MARKERS.items()):
            raise ValueError("SDK_ISOLATED_ENTRYPOINT_INVALID")
        expected = {*ISOLATED_MARKERS, 'sdk/source.json', *(['sounds.js'] if manifest.get('sounds') else [])}
        if set(files) != expected or manifest.get('sounds') and files.get('sounds.js') != ISOLATED_SOUNDS_MARKER:
            raise ValueError('SDK_ISOLATED_ENTRYPOINT_INVALID')
        validate_isolated_payload(parse_json(files.get("sdk/source.json", "null")), manifest)
    css = files["styles.css"]
    if re.search(r"(?:#app\b|\.(?:table-shell|table-header|player-strip|game-layout-slot|app-game-layout|own-hand|hand-track|opponent-hands|scene-actions|piece-count|player-hand|player-panel|player-info|player-details|player-badges|mini-hand|hand-heading|hand-tools|opponent-hand|opponent-label|is-open-hand)(?![-\w]))", re.sub(r"/\*[\s\S]*?\*/", "", css)):
        raise ValueError(f"Компоновка общих элементов принадлежит приложению: {label}")
    uncommented = re.sub(r"/\*[\s\S]*?\*/", "", css)
    if re.search(r"@import\b|expression\s*\(", uncommented, re.IGNORECASE):
        raise ValueError(f"CSS пака не должен загружать внешние стили: {label}")
    for match in PACK_ASSET_URL.finditer(css):
        url = js_trim(match.group(2) if match.group(1) else match.group(3))
        if url.startswith("#"):
            continue
        if re.match(r"data:", url, re.IGNORECASE):
            if not re.match(r"data:(?:image|font|application)/", url, re.IGNORECASE):
                raise ValueError(f"Неподдерживаемый CSS ресурс: {label}")
        else:
            validate_asset(files, url[2:] if url.startswith("./") else url)
    return bundle

def local_file(root, name):
    path = PurePosixPath(name)
    if not path_ok(name):
        raise ValueError(f"Недопустимый путь пака: {name!r}")
    result = root
    for part in path.parts:
        result = result / part
        if result.is_symlink():
            raise ValueError(f"Симлинк в пути пака: {name}")
    if result.is_symlink() or not result.is_file() or not result.resolve().is_relative_to(root.resolve()):
        raise ValueError(f"Нет локального файла пака: {name}")
    return result

def read_manifest(pack):
    manifest = validate_manifest(parse_json(local_file(pack, "manifest.json").read_text(encoding="utf-8")), pack.name)
    if manifest["id"] != pack.name:
        raise ValueError(f"ID и имя папки различаются: {pack.name}")
    for filename in ENTRY_POINTS.values():
        if manifest.get("execution") != "isolated-v1":
            local_file(pack, filename)
    if manifest.get("sounds"):
        local_file(pack, "sounds.js")
    return manifest

def pack_files(pack, manifest):
    files = {local_file(pack, filename) for filename in ENTRY_POINTS.values()}
    if manifest.get("sounds") or (pack / "sounds.js").is_file():
        files.add(local_file(pack, "sounds.js"))
    for folder in ("assets", "config"):
        if (pack / folder).is_dir():
            for path in (pack / folder).rglob("*"):
                if path.is_file() and path.suffix.lower() not in {".md", ".txt"}:
                    files.add(local_file(pack, path.relative_to(pack).as_posix()))
    for path in pack.glob("*.json"):
        if path.name != "manifest.json":
            files.add(local_file(pack, path.name))
    return sorted(files)

def compile_rulebook_markdown(source):
    """Optional authoring input; emit inert structured data, never raw HTML."""
    try:
        import mistune
    except ImportError as error:
        raise ValueError("Markdown rules require mistune 3: python3 -m pip install 'mistune>=3,<4'") from error
    if mistune.__version__.split(".")[0] != "3":
        raise ValueError("Markdown rules require mistune 3")
    if not isinstance(source, str) or len(source.encode("utf-8")) > 128 * 1024:
        raise ValueError("Markdown rulebook is too large")
    def plain(nodes):
        return "".join(node.get("raw", "") if node["type"] in ("text", "codespan") else plain(node.get("children", [])) for node in nodes)
    def inline(nodes):
        result = []
        for node in nodes:
            kind = node["type"]
            if kind == "text":
                result.append(node["raw"])
            elif kind in ("softbreak", "linebreak"):
                result.append("\n")
            elif kind == "codespan":
                result.append({"type": "code", "children": [node["raw"]]})
            elif kind in ("strong", "emphasis"):
                result.append({"type": kind, "children": inline(node["children"])})
            elif kind == "link":
                url = node.get("attrs", {}).get("url", "")
                if not re.match(r"^https?://", url, re.IGNORECASE):
                    raise ValueError("Markdown links require http(s)")
                result.append({"type": "link", "url": url, "children": inline(node["children"])})
            else:
                raise ValueError("Unsupported Markdown inline: " + kind)
        return result
    document = {"sections": []}
    for node in mistune.create_markdown(renderer="ast", plugins=["table"])(source):
        kind = node["type"]
        if kind in ("blank_line", "thematic_break"):
            continue
        if kind == "heading":
            document["sections"].append({"title": plain(node["children"]), "blocks": []})
            continue
        if not document["sections"]:
            raise ValueError("Start Markdown rules with a heading")
        section = document["sections"][-1]
        if kind == "paragraph" and len(node["children"]) == 1 and node["children"][0]["type"] == "image":
            image = node["children"][0]
            identity = image.get("attrs", {}).get("url", "")
            if not re.fullmatch(r"[a-zA-Z0-9_-]{1,64}", identity):
                raise ValueError("Markdown illustrations must reference a local illustration ID")
            section.setdefault("figures", []).append({"id": identity, "caption": plain(image["children"]), "role": "diagram"})
        elif kind == "paragraph":
            section["blocks"].append({"type": "paragraph", "text": inline(node["children"])})
        elif kind == "list":
            items = []
            for item in node["children"]:
                if any(child["type"] not in ("block_text", "paragraph", "blank_line") for child in item["children"]):
                    raise ValueError("Nested Markdown lists are not supported")
                values = []
                for child in item["children"]:
                    if child["type"] != "blank_line":
                        if values: values.append("\n")
                        values.extend(inline(child["children"]))
                items.append(values)
            section["blocks"].append({"type": "list", "ordered": bool(node.get("attrs", {}).get("ordered")), "items": items})
        elif kind == "table":
            head, body = node["children"]
            section["blocks"].append({"type": "table", "headers": [inline(cell["children"]) for cell in head["children"]], "rows": [[inline(cell["children"]) for cell in row["children"]] for row in body["children"]]})
        else:
            raise ValueError("Unsupported Markdown block: " + kind)
    if not document["sections"] or len(document["sections"]) > 64:
        raise ValueError("Markdown rulebook requires 1-64 sections")
    return document


def bundle_source_modules(files, source, read):
    """Compile local layers and data into fixed, autonomous entrypoints."""
    if not isinstance(source, dict) or set(source) - {"rules", "view", "locales", "rulebooks"}:
        raise ValueError("Некорректные sourceModules")
    scripts = {}
    for entry in ("rules", "view"):
        paths = source.get(entry, [])
        if (not isinstance(paths, list) or len(paths) > 32
                or any(not isinstance(path, str) or not path_ok(path)
                       or not re.fullmatch(r"(?:domain|presentation|ui)/[A-Za-z0-9_./-]+\.js", path) for path in paths)
                or len(set(paths)) != len(paths)):
            raise ValueError("Некорректные модули точки входа: " + entry)
        scripts[entry] = paths
    locales = source.get("locales", {})
    if not isinstance(locales, dict) or len(locales) > 32:
        raise ValueError("Некорректные каталоги локализации")
    catalogs = {}
    for locale, paths in locales.items():
        if (not isinstance(locale, str) or not re.fullmatch(r"[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*", locale)
                or not isinstance(paths, list) or not paths or len(paths) > 32
                or any(not isinstance(path, str) or not path_ok(path)
                       or not path.startswith("locales/" + locale + "/") or not path.endswith(".json") for path in paths)
                or len(set(paths)) != len(paths)):
            raise ValueError("Некорректные файлы локали")
        catalog = {}
        for path in paths:
            files[path] = read(path)
            messages = parse_json(files[path])
            if not isinstance(messages, dict) or set(catalog).intersection(messages):
                raise ValueError("Повтор ключей или неверный каталог: " + path)
            catalog.update(messages)
        catalogs[locale] = catalog
    rulebooks = source.get("rulebooks", {})
    if not isinstance(rulebooks, dict) or len(rulebooks) > 32:
        raise ValueError("Invalid Markdown rulebooks")
    compiled_books = {}
    for locale, path in rulebooks.items():
        if (locale not in catalogs or not isinstance(path, str) or not path_ok(path)
                or not path.startswith("locales/" + locale + "/") or not path.endswith(".md")):
            raise ValueError("Invalid Markdown rulebook path or locale")
        compiled_books[locale] = compile_rulebook_markdown(read(path))
    payload = {"locales": catalogs}
    if compiled_books:
        payload["rulebooks"] = compiled_books
    resources = "globalThis.PlayroomPackResources = " + json_text(payload).rstrip() + ";\n"
    for entry, paths in scripts.items():
        for path in paths:
            files[path] = read(path)
        files[entry + ".js"] = "\n;\n".join([resources, *(files[path] for path in paths), files[entry + ".js"]])
    for path in set(scripts["rules"] + scripts["view"] + [p for paths in locales.values() for p in paths]):
        files.pop(path, None)

# The filesystem reader is shared by SDK adopt/compile and collection builds.
# It reads guest text as data and never imports/evaluates authored JavaScript.
ISOLATED_MARKERS = {
    'rules.js': '// PlayRoom isolated-v1: rules execute only in the guest VM.\n',
    'view.js': '// PlayRoom isolated-v1: presentation uses the trusted scene renderer.\n',
    'styles.css': '/* PlayRoom isolated-v1: styles belong to the trusted scene renderer. */\n',
}
ISOLATED_SOUNDS_MARKER = '// PlayRoom isolated-v1: sound metadata executes only in the guest VM.\n'
MAX_SOURCE_BYTES = 12 * 1024 * 1024
MAX_RESOURCE_BYTES = 2_000_000
MAX_RESOURCES = 256


def _sdk_scripts(root, names, prefix='', suffix='.js'):
    if (not isinstance(names, list) or len(names) > 64
            or any(not isinstance(n, str) or not n.endswith(suffix) for n in names) or len(set(names)) != len(names)):
        raise ValueError('SDK_MODULES_INVALID')
    result = []
    for name in names:
        file = local_file(root, name)
        if file.stat().st_size > 4 * 1024 * 1024:
            raise ValueError('SDK_FILE_LIMIT: ' + name)
        result.append({'file': prefix + name, 'source': file.read_text(encoding='utf-8')})
    return result


def validate_animation(value):
    """The SDK animation vocabulary; arbitrary config JSON is a separate port."""
    def number(n):
        return type(n) in (int, float) and -float('inf') < n < float('inf')
    if not isinstance(value, dict) or not number_equals(value.get('contractVersion'), 1) or not isinstance(value.get('frames'), list) or not 1 <= len(value['frames']) <= 1000:
        raise ValueError('SDK_ANIMATION_INVALID')
    previous = -1
    for frame in value['frames']:
        if not isinstance(frame, dict) or not number(frame.get('time')) or not 0 <= frame['time'] <= 10000 or frame['time'] < previous or not isinstance(frame.get('values'), dict):
            raise ValueError('SDK_ANIMATION_INVALID')
        previous = frame['time']
        for key, n in frame['values'].items():
            if key not in {'x', 'y', 'rotation', 'scale', 'opacity'} or not number(n) or abs(n) > 10000 or key == 'opacity' and not 0 <= n <= 1 or key == 'scale' and not 0 <= n <= 20:
                raise ValueError('SDK_ANIMATION_INVALID')


def isolated_source_hash(payload):
    value = {key: payload[key] for key in ('manifest', 'descriptor', 'catalogs')}
    digest = hashlib.sha256(json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode('utf-8'))
    for kind in ('dependencies', 'rules', 'helpers', 'presentation', 'types', 'support'):
        for row in payload['sources'].get(kind, []):
            digest.update((row['file'] + '\0' + row['source']).encode('utf-8'))
    return digest.hexdigest()


def isolated_source_payload(pack, shared=None):
    """Complete source/asset closure. Additional presentation remains inert data."""
    pack = Path(pack).resolve(strict=True)
    shared = Path(shared).resolve(strict=True) if shared else Path(__file__).resolve().parent
    manifest = validate_manifest(parse_json(local_file(pack, 'manifest.json').read_text(encoding='utf-8')), pack.name)
    descriptor = parse_json(local_file(pack, 'sdk/project.json').read_text(encoding='utf-8'))
    if not number_equals(descriptor.get('contractVersion'), 1) or not isinstance(descriptor.get('presentation'), list):
        raise ValueError('SDK_DESCRIPTOR_REQUIRED')
    dependencies = []
    for name in manifest.get('sharedDomain', []):
        dependencies += _sdk_scripts(shared, ['domain/' + name + '.js'], 'shared/')
    sources = {'dependencies': dependencies,
               'rules': _sdk_scripts(pack, descriptor.get('rules')),
               'helpers': _sdk_scripts(pack, descriptor.get('helpers', [])),
               'presentation': _sdk_scripts(pack, descriptor.get('presentation')),
               'types': _sdk_scripts(pack, descriptor.get('types', []), suffix='.d.ts')}
    if (any(not row['file'].startswith('presentation/') for row in sources['presentation'])
            or any(not row['file'].startswith('domain/') for row in sources['helpers'])):
        raise ValueError('SDK_MODULES_INVALID')
    catalogs = {}
    source_modules = manifest.get('sourceModules', {})
    for locale, names in source_modules.get('locales', {}).items():
        if not re.fullmatch(r'[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*', locale) or not isinstance(names, list) or len(names) > 32:
            raise ValueError('SDK_LOCALES_INVALID')
        catalog = {}
        for name in names:
            value = parse_json(local_file(pack, name).read_text(encoding='utf-8'))
            if not isinstance(value, dict) or set(value) & set(catalog) or any(not isinstance(text, str) for text in value.values()):
                raise ValueError('SDK_LOCALES_INVALID')
            catalog.update(value)
        catalogs[locale] = catalog
    loaded = {row['file'] for rows in sources.values() for row in rows}
    support_names = descriptor.get('support')
    if support_names is None:
        support_names = [name for name in source_modules.get('view', []) if name not in loaded]
        if manifest.get('sounds'):
            support_names.append('sounds.js')
    support = []
    for row in _sdk_scripts(pack, support_names):
        name = row['file']
        role = 'tutorial' if name.endswith('/tutorial.js') else 'illustrations' if name.endswith('/rule-illustrations.js') else 'sounds' if name == 'sounds.js' else 'presentation-support'
        support.append({**row, 'role': role})
    sources['support'] = support
    source_bytes = sum(len(row['source'].encode('utf-8')) for rows in sources.values() for row in rows)
    if source_bytes > MAX_SOURCE_BYTES:
        raise ValueError('SDK_SOURCE_LIMIT')
    provenance = parse_json(local_file(pack, 'sdk/assets.json').read_text(encoding='utf-8')) if (pack / 'sdk/assets.json').exists() else {}
    assets, providers, data_files, asset_packs, documentation = [], [], [], [], []
    seen = set()
    def add_resource(root, relative, name):
        if name in seen:
            return
        seen.add(name)
        file = local_file(root, relative)
        content = file.read_bytes()
        suffix = file.suffix.lower()
        if suffix in {'.js', '.css'}:
            providers.append({'file': name, 'source': content.decode('utf-8'), 'role': 'asset-provider' if suffix == '.js' else 'asset-style'})
            return
        if suffix == '.json' and not (root == pack and relative.startswith('assets/')):
            # Catalog/config JSON is data, not the animation-only asset API.
            data_files.append({'file': name, 'value': parse_json(content.decode('utf-8'))})
            return
        if suffix in {'.md', '.txt'}:
            documentation.append(name)
            return  # Authoring documentation and masters stay in the source archive.
        mime = 'audio/wav' if suffix == '.wav' else mimetypes.guess_type(file.name)[0] or 'application/octet-stream'
        maximum = 64_000 if suffix in {'.svg', '.json'} else 128_000 if mime.startswith('audio/') else 512_000
        if not (mime.startswith('image/') or mime.startswith('audio/') or suffix == '.json' and mime == 'application/json') or len(content) > maximum:
            raise ValueError('SDK_ASSET_SIZE_OR_FORMAT: ' + name)
        if provenance.get(relative, {}).get('sha256') not in (None, hashlib.sha256(content).hexdigest()):
            raise ValueError('SDK_ASSET_CHANGED: ' + name)
        if suffix == '.json':
            validate_animation(parse_json(content.decode('utf-8')))
        assets.append({'file': name, 'sha256': hashlib.sha256(content).hexdigest(), 'mime': mime,
                       'data': base64.b64encode(content).decode('ascii'), 'bytes': len(content),
                       'provenance': provenance.get(relative, {'source': 'Existing source resource: ' + relative})})
    for folder in ('assets', 'config'):
        if (pack / folder).is_symlink():
            raise ValueError('SDK_SYMLINK_DENIED')
        if (pack / folder).exists():
            for file in sorted((pack / folder).rglob('*')):
                if file.is_file():
                    name = file.relative_to(pack).as_posix()
                    add_resource(pack, name, name)
    for name in manifest.get('sharedAssets', []):
        add_resource(shared, 'assets/' + name, 'assets/shared/' + name)
    included, visiting = {}, set()
    def include_asset_pack(name, version=None):
        if not isinstance(name, str) or not re.fullmatch(r'[a-z][a-z0-9-]*', name):
            raise ValueError('SDK_ASSET_PACK_INVALID')
        if name in visiting:
            raise ValueError('SDK_ASSET_PACK_CYCLE')
        if name in included:
            if version is not None and included[name] != version:
                raise ValueError('SDK_ASSET_PACK_VERSION')
            return
        root = shared / 'asset-packs' / name
        spec = parse_json(local_file(root, 'manifest.json').read_text(encoding='utf-8'))
        if spec.get('format') != 'playroom-asset-pack' or spec.get('id') != name or spec.get('formatVersion') != 1 or not SEMVER.fullmatch(spec.get('version', '')) or version is not None and spec['version'] != version:
            raise ValueError('SDK_ASSET_PACK_INVALID')
        visiting.add(name)
        for dep in spec.get('dependencies', []):
            include_asset_pack(dep['id'], dep['version'])
        visiting.remove(name)
        included[name] = spec['version']
        asset_packs.append({'manifest': spec, 'prefix': 'assets/shared-packs/' + name + '/'})
        for filename in dict.fromkeys([*spec.get('files', []), *spec.get('scripts', []), *spec.get('styles', []), *(item['file'] for item in spec.get('items', []) if 'file' in item)]):
            add_resource(root, filename, 'assets/shared-packs/' + name + '/' + filename)
    for name in manifest.get('sharedAssetPacks', []):
        include_asset_pack(name)
    if len(assets) > MAX_RESOURCES or sum(item['bytes'] for item in assets) > MAX_RESOURCE_BYTES:
        raise ValueError('SDK_ASSET_TOTAL_LIMIT')
    core_source_bytes = source_bytes
    sources['providers'] = providers
    source_bytes = sum(len(row['source'].encode('utf-8')) for rows in sources.values() for row in rows)
    if source_bytes > MAX_SOURCE_BYTES:
        raise ValueError('SDK_SOURCE_LIMIT')
    closure = {'sourceBytes': source_bytes, 'assetPacks': asset_packs, 'data': data_files, 'documentation': documentation,
               'budget': {'assetBytes': sum(item['bytes'] for item in assets), 'assetCount': len(assets),
                          'maxAssetBytes': MAX_RESOURCE_BYTES, 'maxAssets': MAX_RESOURCES}}
    books = {}
    for locale, name in source_modules.get('rulebooks', {}).items():
        books[locale] = compile_rulebook_markdown(local_file(pack, name).read_text(encoding='utf-8'))
    if books:
        closure['rulebooks'] = books
    result = {'format': 'playroom-sdk-source', 'contractVersion': 1, 'manifest': manifest,
              'descriptor': descriptor, 'catalogs': catalogs, 'sources': sources,
              'assets': assets, 'resourceClosure': closure, 'sourceBytes': core_source_bytes}
    result['sourceHash'] = isolated_source_hash(result)
    return result


def validate_isolated_payload(payload, manifest):
    if (not isinstance(payload, dict) or payload.get('format') != 'playroom-sdk-source'
            or not number_equals(payload.get('contractVersion'), 1) or payload.get('manifest') != manifest):
        raise ValueError('SDK_ISOLATED_PAYLOAD_INVALID')
    descriptor, sources = payload.get('descriptor'), payload.get('sources')
    if not isinstance(descriptor, dict) or not number_equals(descriptor.get('contractVersion'), 1) or not isinstance(sources, dict):
        raise ValueError('SDK_ISOLATED_DESCRIPTOR_INVALID')
    if not {'dependencies', 'rules', 'helpers', 'presentation', 'types'} <= set(sources):
        raise ValueError('SDK_ISOLATED_SOURCES_INVALID')
    if set(sources) - {'dependencies', 'rules', 'helpers', 'presentation', 'types', 'support', 'providers'}:
        raise ValueError('SDK_ISOLATED_SOURCES_INVALID')
    source_bytes = 0
    for kind, rows in sources.items():
        if not isinstance(rows, list) or len(rows) > (256 if kind == 'providers' else 64):
            raise ValueError('SDK_MODULES_INVALID')
        paths = set()
        for row in rows:
            if not isinstance(row, dict) or not path_ok(row.get('file')) or row['file'] in paths or not isinstance(row.get('source'), str):
                raise ValueError('SDK_MODULES_INVALID')
            paths.add(row['file'])
            length = len(row['source'].encode('utf-8'))
            if length > 4 * 1024 * 1024:
                raise ValueError('SDK_FILE_LIMIT')
            source_bytes += length
        if kind in {'rules', 'helpers', 'presentation', 'types', 'support'} and [row['file'] for row in rows] != descriptor.get(kind, []):
            raise ValueError('SDK_DESCRIPTOR_SOURCE_MISMATCH')
    if source_bytes > MAX_SOURCE_BYTES:
        raise ValueError('SDK_SOURCE_LIMIT')
    catalogs = payload.get('catalogs')
    if not isinstance(catalogs, dict) or any(not isinstance(catalog, dict) or any(not isinstance(value, str) for value in catalog.values()) for catalog in catalogs.values()):
        raise ValueError('SDK_LOCALES_INVALID')
    if payload.get('sourceHash') != isolated_source_hash(payload):
        raise ValueError('SDK_ISOLATED_SOURCE_HASH')
    assets = payload.get('assets', [])
    if not isinstance(assets, list) or len(assets) > MAX_RESOURCES:
        raise ValueError('SDK_ASSET_TOTAL_LIMIT')
    total, names = 0, set()
    for item in assets:
        name = item.get('file')
        if not path_ok(name) or name in names or not isinstance(item.get('mime'), str):
            raise ValueError('SDK_ASSET_PATH')
        names.add(name)
        try:
            raw = base64.b64decode(item['data'], validate=True)
        except (ValueError, TypeError) as error:
            raise ValueError('SDK_ASSET_DATA') from error
        if len(raw) != item['bytes'] or hashlib.sha256(raw).hexdigest() != item['sha256']:
            raise ValueError('SDK_ASSET_HASH')
        maximum = 64_000 if name.endswith(('.svg', '.json')) else 128_000 if item['mime'].startswith('audio/') else 512_000
        if len(raw) > maximum or not (item['mime'].startswith('image/') or item['mime'].startswith('audio/') or name.endswith('.json') and item['mime'] == 'application/json'):
            raise ValueError('SDK_ASSET_SIZE_OR_FORMAT')
        if name.endswith('.json'): validate_animation(parse_json(raw.decode('utf-8')))
        total += len(raw)
    if total > MAX_RESOURCE_BYTES:
        raise ValueError('SDK_ASSET_TOTAL_LIMIT')
    return payload


def build_isolated_pack(pack, shared=None):
    payload = isolated_source_payload(pack, shared)
    manifest = payload['manifest']
    files = {**ISOLATED_MARKERS, 'sdk/source.json': json_text(payload)}
    # sounds.js is an inert structural marker. The actual cues stay guest-side.
    if manifest.get('sounds'):
        files['sounds.js'] = ISOLATED_SOUNDS_MARKER
    return validate_bundle({'format': 'playroom-pack', 'formatVersion': 1, 'manifest': manifest, 'files': files}, pack.name)


def build_pack(pack, shared=None):
    pack = Path(pack)
    spec = parse_json(local_file(pack, "manifest.json").read_text(encoding="utf-8"))
    if spec.get("execution") == "isolated-v1":
        return build_isolated_pack(pack, shared)

    shared = Path(shared) if shared else Path(__file__).resolve().parent
    manifest = read_manifest(pack)
    files = {}
    for path in pack_files(pack, manifest):
        if path.suffix.lower() in TEXT_EXTENSIONS:
            value = path.read_text(encoding="utf-8")
        else:
            mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
            value = f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")
        files[path.relative_to(pack).as_posix()] = value
    modules = manifest.get("sharedDomain", [])
    if modules:
        domain = shared / "domain"
        sources = [local_file(domain, name + ".js").read_text(encoding="utf-8") for name in modules]
        files["rules.js"] = "\n".join([*sources, files["rules.js"]])
        files["view.js"] = "\n".join([*sources, files["view.js"]])
    if manifest.get("sharedUi"):
        files["view.js"] = (shared / "components/vector-art.js").read_text(encoding="utf-8") + "\n" + (shared / "components/round-token.js").read_text(encoding="utf-8") + "\n" + (shared / "components/game-components.js").read_text(encoding="utf-8") + "\n" + (shared / "view-kit.js").read_text(encoding="utf-8") + "\n" + files["view.js"]
        files["styles.css"] = (shared / "view-kit.css").read_text(encoding="utf-8") + "\n" + files["styles.css"]
        for name in manifest.get("sharedAssets", []):
            if not re.fullmatch(r"[a-z][a-z0-9-]*\.svg", name):
                raise ValueError(f"Некорректное имя общего ресурса: {name}")
            files[f"assets/shared/{name}"] = local_file(shared, f"assets/{name}").read_text(encoding="utf-8")
    asset_scripts = []
    asset_styles = []
    included = {}
    visiting = set()
    def include_asset_pack(name, version=None):
        if name in visiting:
            raise ValueError("Cyclic asset pack dependency")
        if name in included:
            if version is not None and included[name] != version:
                raise ValueError("Asset pack dependency version mismatch")
            return
        if not re.fullmatch(r"[a-z][a-z0-9-]*", name):
            raise ValueError("Invalid asset pack ID")
        root = shared / "asset-packs" / name
        spec = parse_json(local_file(root, "manifest.json").read_text(encoding="utf-8"))
        if spec.get("format") != "playroom-asset-pack" or spec.get("id") != name:
            raise ValueError("Invalid asset pack manifest")
        if spec.get("formatVersion") != 1 or not SEMVER.fullmatch(spec.get("version", "")):
            raise ValueError("Invalid asset pack version")
        if version is not None and spec["version"] != version:
            raise ValueError("Asset pack dependency version mismatch")
        visiting.add(name)
        for dependency in spec.get("dependencies", []):
            include_asset_pack(dependency["id"], dependency["version"])
        visiting.remove(name)
        included[name] = spec["version"]
        compiled_resources = set(spec.get("scripts", [])) | set(spec.get("styles", []))
        for filename in spec.get("files", []):
            if filename in compiled_resources:
                continue  # The executable copy lives in view.js/styles.css.
            path = local_file(root, filename)
            data = path.read_bytes()
            files["assets/shared-packs/" + name + "/" + filename] = data.decode("utf-8") if path.suffix in TEXT_EXTENSIONS else "data:" + (mimetypes.guess_type(path.name)[0] or "application/octet-stream") + ";base64," + base64.b64encode(data).decode("ascii")
        for script in spec.get("scripts", []):
            asset_scripts.append(local_file(root, script).read_text(encoding="utf-8"))
        for style in spec.get("styles", []):
            asset_styles.append(local_file(root, style).read_text(encoding="utf-8"))
    for asset_pack in manifest.get("sharedAssetPacks", []):
        include_asset_pack(asset_pack)
    if "sourceModules" in manifest:
        source = manifest.pop("sourceModules")
        bundle_source_modules(files, source, lambda path: local_file(pack, path).read_text(encoding="utf-8"))
    if asset_scripts:
        files["view.js"] = "\n".join([*asset_scripts, files["view.js"]])
    if asset_styles:
        files["styles.css"] = "\n".join([*asset_styles, files["styles.css"]])
    return validate_bundle({"format": "playroom-pack", "formatVersion": 1, "manifest": manifest, "files": files}, pack.name)
