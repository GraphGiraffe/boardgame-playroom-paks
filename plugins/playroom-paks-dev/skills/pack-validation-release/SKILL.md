---
name: pack-validation-release
description: Validate, build and release the independent PlayRoom pack collection with exact companion provenance and minimal CI.
---

# Pack validation and releases

Start with the canonical standalone command bash scripts/codex/check.sh when syntax, manifests, assets or packaging changed. It validates JS, builds packs and checks distribution hashes. Gameplay/UI evidence requires the selected companion application, prepared from these exact source packs. Use focused profiles while implementing; full joint gate is required for the final release.

Use plan_validation with explicit repo and companion roots; run through tools/playroom.py only when the selected check is needed. For the complete pair, use bash scripts/codex/check.sh --full --app-dir APP_REPO from the packs root, or the equivalent application command --packs-dir PACKS_REPO/packs. Do not run both full gates for the same pair; they cover the same tests.

Collection and individual pack versions are independent. Never modify a published version in place; retain old bundles for saves/replays. Use python3 build.py --output-dir dist/RELEASE to build individual *.playroom-pack.json, collection ZIP, source ZIP and SHA256SUMS. The release asset allowlist must all come from one build. The helper verify_release checks integrity but not gameplay.

Before tag/release, confirm app workflow pins and source SHA, compare downloaded assets and hashes, and keep the pinned commit reachable. Task PRs target dev; stable releases follow current CONTRIBUTING.md. Plugin development stays in a separate tooling branch. The app plugin owns Cloudflare deployment; do not duplicate its publisher or embed its secrets here.

## Local tools

Read [tools](../../references/TOOLS.md) before using the bundled MCP or CLI. Pass explicit app and pack checkout roots; never guess a sibling path in a worktree. Inspect both repositories and read their current AGENTS.md, CONTRIBUTING.md and relevant design contracts. The repo documentation is authoritative over this plugin. Use repository-workflow for GitHub operations and cleanup. Preserve active services, unrelated edits, published versions and pinned companion SHAs.
