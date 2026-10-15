# playroom-paks-dev

Local project plugin: 4 focused skills, four read-only MCP tools, and an explicit local check/build CLI. Reuses canonical project scripts. No automatic Actions, commits, branch cleanup or production deployment.

## Install

From this isolated repository branch:

```bash
codex plugin marketplace add .
codex plugin add playroom-paks-dev@playroom-paks-dev-local
```

Start a new Codex session to load the installed capabilities. Install does not restart running chats/services. Keep the source worktree while a local marketplace points to it. For a Git-backed marketplace use the repository URL with `--ref` pointing to this tooling branch.

## Scope

The caller supplies exact checkout roots. Skills follow current project docs and user authorization. Public release verification does not claim a deployment. The CLI prints selected commands and final source provenance. See references/TOOLS.md and references/VIEWPORTS.md.

## 0.1.1

RC4 catalog/lobby/privacy/layout constraints; pack inspection reports unknown/missing tags and conditional rule fields. Local only; no app deployment.

## 0.2.0

Staged 0.18 layer/feature tracking, public Table roles, themes/locales/shared assets, explicit release selectors or none, and independent app/collection/single-pack publication. This plugin update does not release or deploy PlayRoom. See references/REFACTOR-0.18.md and references/WORKFLOW.md.
