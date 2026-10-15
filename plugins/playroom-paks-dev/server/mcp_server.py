#!/usr/bin/env python3
"""Read-only MCP tools; long-running checks use the explicit local CLI."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
import playroom
from mcp.server.fastmcp import FastMCP
from mcp.types import ToolAnnotations

read=ToolAnnotations(readOnlyHint=True,destructiveHint=False,idempotentHint=True,openWorldHint=False)
mcp=FastMCP(playroom.CONFIG['name'],instructions='Inspect explicitly selected PlayRoom checkouts, plan scoped local verification, and validate public artifacts. These tools do not run tests, push, merge, publish, delete branches or change services. Use the bundled CLI for authorized local checks and project release scripts for publication.',log_level='WARNING')

@mcp.tool(annotations=read)
def inspect_project(repo: str, companion: str='') -> dict:
    """Return local branch, SHA, dirty state and optional companion provenance."""
    return playroom.inspect_project(repo,companion)

@mcp.tool(annotations=read)
def plan_validation(repo: str, area: str, companion: str='', checks: str | None=None) -> dict:
    """Plan selected local checks; release requires explicit checks or none. Includes model/appearance/localization/table areas; never executes tests."""
    return playroom.plan_validation(repo,area,companion,checks)

@mcp.tool(annotations=read)
def inspect_pack(repo: str, pack_id: str) -> dict:
    """Inspect one pack manifest and its local/shared asset inventory."""
    return playroom.inspect_pack(repo,pack_id)

@mcp.tool(annotations=read)
def verify_release(directory: str) -> dict:
    """Verify SHA256SUMS and public ZIP integrity; reject private wrapper files."""
    return playroom.verify_release(directory)

if __name__=='__main__': mcp.run(transport='stdio')
