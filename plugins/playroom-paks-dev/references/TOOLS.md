# Local runtime

Requirements: Python 3.11+, Git; Node 22+ and project dependencies for checks. MCP is pinned to mcp==1.30.0 and launched by uv. CLI inspection/planning/checksum operations use the Python standard library. Paths are supplied explicitly and validated as PlayRoom checkouts; symlink escapes in pack/checksum inputs are rejected.

MCP tools (read-only): inspect_project, plan_validation, inspect_pack, verify_release. Plans return argv arrays and cwd, never shell text. No MCP tool executes tests, pushes commits, deletes refs or deploys. Long-running commands remain visible through the native terminal tool; publication uses existing authorized project scripts.

CLI examples (run from plugin root; replace path placeholders):

```bash
python3 tools/playroom.py inspect --repo /path/to/checkout --companion /path/to/companion
python3 tools/playroom.py plan --repo /path/to/checkout --companion /path/to/companion --area layout
python3 tools/playroom.py run --repo /path/to/checkout --companion /path/to/companion --area layout --capture-dir /path/to/evidence
python3 tools/playroom.py verify-release --directory /path/to/public/release
```

Inspect the plan before execution. `run` invokes allowlisted canonical commands without a shell and preserves their nonzero exit status. setup/build/prepare-dev write normal generated outputs; they are not read-only. The helper does not start or kill a persistent server. Run setup only when missing prerequisites justify it. Public artifact verification rejects private wrapper ZIPs.

MCP SDK: https://github.com/modelcontextprotocol/python-sdk ; stdio transport: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports .
