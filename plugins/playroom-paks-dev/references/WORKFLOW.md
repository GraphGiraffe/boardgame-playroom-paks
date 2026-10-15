# Project workflow and verification

Repository AGENTS/CONTRIBUTING and the latest user decision take precedence. Inspect the selected app and packs roots, branches, SHA pair, dirty trees, current docs and relevant PR state. Continue an authorized task branch; keep plugin changes on isolated tooling branches. Do not infer deployed versions from source versions or an old handoff.

## Choose checks explicitly

Use docs/TESTING.md, tests/blocks.cjs and scripts/codex/test.cjs in the selected current app. A block/subblock/case is a choice, not a reason to run every sibling suite. For example core/model, network/table, case/session or ui/appearance. Read affected fixtures before claiming coverage. Prepare the exact companion source packs when the selected scenarios need them; stale installed-packs.js is not evidence.

For every release the check choice must be explicit: comma-separated selectors or literal none. Empty/omitted checks must fail. all/full/* are not shortcuts; to request the entire composition enumerate the current blocks explicitly. none means tests were deliberately skipped, not passed. Build, packaging and SHA256 verification remain required. Do not replace a scoped choice with check.sh --full or npm test. Use a full composition only for its actual acceptance risk or an explicit gate; ordinary icon/text/docs/plugin changes do not require unrelated game/network/layout suites.

Run only selected canonical commands. Setup is for missing dependencies. A plan/list is not execution; an environmental failure is not a pass. Record source pair, selected commands, exit status, skipped checks and material limits. Reuse valid evidence for unchanged inputs. Do not repeat Actions after each commit; draft PRs and local verification are normal. A push/Ready flag is not CI success.

## Publication ownership

App and packs publish independently. Read current workflows and inputs; do not copy an old command contract. App uses the existing protected Pages project; packs use private R2 immutable files and an atomic catalog pointer through the app route. Publishing one pack can use the current packs-publish only input. Do not redeploy the app for a pack-only change or republish a collection for an app-only change.

Use existing authorization; a skill does not add another approval requirement. Stable flow and task PR base follow the repository. Never rewrite released tags/pack bytes. Keep companion provenance reachable after squash. Verify downloaded release assets/SHA, then deployed app version or published pack catalog/file hashes as appropriate. Source edits, tests, GitHub Release and production verification are separate outcomes. No automatic previews; inspect current Pages Git build settings when unexpected previews are reported.

Keep private worker/access wrapper, protected ZIP, credentials and deployment kits out of public release assets. Read-only probes should not print secrets. Active connections/services and user data remain intact. No automatic cleanup, force pushes or broader provider changes are implied by a skill.
