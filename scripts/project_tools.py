"""Compatibility entrypoint for project operations owned by playroom-utils."""
import os
from pathlib import Path
import runpy


def load(name, group, entry_name):
    root = Path(__file__).resolve().parents[1]
    candidates = [Path(os.environ['PLAYROOM_UTILS_ROOT'])] if os.environ.get('PLAYROOM_UTILS_ROOT') else [root/'.playroom-utils', root.parent/'.playroom-utils', root.parent/'boardgame-playroom-utils']
    for candidate in candidates:
        script = candidate/'tools'/group/name
        if script.is_file():
            if group == 'app':
                os.environ['PLAYROOM_APP_ROOT'] = str(root)
            return runpy.run_path(str(script.resolve()), run_name=entry_name)
    raise RuntimeError('Project tools moved to boardgame-playroom-utils. Set PLAYROOM_UTILS_ROOT to that checkout; no implicit download.')
