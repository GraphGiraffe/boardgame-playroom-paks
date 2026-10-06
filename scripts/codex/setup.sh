#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
app_dir=""
install_system_deps=false

usage() {
  cat <<'HELP'
Usage: scripts/codex/setup.sh [--app-dir PATH] [--install-system-deps]

Check Node.js 22+ and Python 3.9+, then build the game packs locally.
--app-dir PATH          Also prepare an existing application checkout.
--install-system-deps   Forward the explicit system-dependency opt-in to
                        the application setup; requires --app-dir.
No repositories are cloned and no credentials are requested.
HELP
}

fail() { printf 'Error: %s\n' "$*" >&2; exit 2; }

while (($#)); do
  case "$1" in
    --app-dir)
      (($# >= 2)) && [[ -n "$2" && "$2" != --* ]] || fail '--app-dir requires a path'
      [[ -z "$app_dir" ]] || fail '--app-dir was specified twice'
      app_dir="$2"; shift 2 ;;
    --install-system-deps) install_system_deps=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) fail "Unknown argument: $1" ;;
  esac
done

if [[ "$install_system_deps" == true && -z "$app_dir" ]]; then
  fail '--install-system-deps requires --app-dir; the standalone pack setup has no system packages to install'
fi
if [[ -n "$app_dir" ]]; then
  [[ -d "$app_dir" ]] || fail "Application checkout does not exist: $app_dir"
  app_dir="$(cd -- "$app_dir" && pwd)"
  [[ -f "$app_dir/scripts/codex/setup.sh" ]] || fail "Application setup is missing: $app_dir/scripts/codex/setup.sh"
fi

command -v node >/dev/null 2>&1 || fail 'Node.js 22+ is required; select the version in .nvmrc'
command -v python3 >/dev/null 2>&1 || fail 'Python 3.9+ is required'
node -e 'if (Number(process.versions.node.split(".")[0]) < 22) { console.error("Node.js 22+ is required"); process.exit(1); }'
python3 -c 'import sys; sys.exit("Python 3.9+ is required") if sys.version_info < (3, 9) else None'

bash "$repo_dir/build.sh"
if [[ -n "$app_dir" ]]; then
  app_args=(--packs-dir "$repo_dir/packs")
  if [[ "$install_system_deps" == true ]]; then app_args+=(--install-system-deps); fi
  bash "$app_dir/scripts/codex/setup.sh" "${app_args[@]}"
  printf 'Ready: packs and application setup completed.\n'
else
  printf 'Ready: standalone pack setup completed.\n'
fi
