#!/usr/bin/env python3
# Compatibility shim; execute canonical helpers in this module namespace.
import runpy
from pathlib import Path
_source=runpy.run_path(str(Path(__file__).with_name("project_tools.py")))["source"]('publish-packs.py','packs')
__file__=str(_source)
exec(compile(_source.read_text(encoding="utf-8"),__file__,"exec"),globals())
