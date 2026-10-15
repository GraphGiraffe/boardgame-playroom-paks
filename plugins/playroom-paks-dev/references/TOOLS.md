# Local tools and explicit selection

Python 3.11+, Git; Node 22+ and the selected project dependencies for tests. MCP uses the existing pinned mcp==1.30.0 stdio process. Inspect/plan/checksum operations are read-only; setup/build/prepare-dev/run write their normal outputs. No MCP tool runs tests, commits, Actions or deployment.

Four tools: inspect_project (exact roots/SHA/status), plan_validation (validated argv/cwd, optional explicit checks), inspect_pack (manifest/sourceModules/layers/assets), verify_release (SHA256/public ZIP integrity). A returned plan is not a passed test or release. Use long-running native exec for actual checks.

```bash
python3 tools/playroom.py inspect --repo /path/to/repo --companion /path/to/companion
python3 tools/playroom.py plan --repo /path/to/repo --companion /path/to/companion --area model
python3 tools/playroom.py plan --repo /path/to/repo --companion /path/to/companion --area release --checks core/model,case/session
python3 tools/playroom.py plan --repo /path/to/repo --area release --checks none
python3 tools/playroom.py run --repo /path/to/repo --companion /path/to/companion --area table --checks network/table
python3 tools/playroom.py verify-release --directory /path/to/public/artifacts
```

Release without --checks is rejected. all/full/* and mixed none are rejected. Selected test names are checked against the current app runner with --list; it does not execute tests. Focused execution prepares the exact source packs; missing companion roots fail explicitly. none executes only git diff --check and reports tests_skipped=true. It does not imply packaging, gameplay, CI or deployment success; build and hash gates remain separate.

Areas: docs, core, layout, hands, motion, network, pairing, storage, rules, model, appearance, localization, table, standalone, setup, build, release. Non-release test areas have scoped suggestions; --checks overrides them. standalone packs means syntax/build/SHA only; standalone app builds without implicit tests. build creates developer artifacts (app all-games/PWA with an explicit packs companion), not a provider publication. For real releases use current independent workflows and their verified public artifact contracts.

run uses argv without a shell and propagates failures. --capture-dir sets PLAYROOM_CAPTURE_DIR for scenarios that implement it; inspect actual captures. Setup is only for missing prerequisites. Limits and local source roots are explicit; symlink escapes/private worker files are rejected during artifact verification. Read references/WORKFLOW.md for publication ownership and evidence.
