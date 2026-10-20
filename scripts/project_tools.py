"""Compatibility entrypoint for project operations owned by playroom-utils."""
import os
from pathlib import Path


def source(name, group):
    root = Path(__file__).resolve().parents[1]
    candidates = [Path(os.environ['PLAYROOM_UTILS_ROOT'])] if os.environ.get('PLAYROOM_UTILS_ROOT') else [root/'.playroom-utils', root.parent/'.playroom-utils', root.parent/'boardgame-playroom-utils']
    for candidate in candidates:
        script = candidate/'tools'/group/name
        if script.is_file():
            if group == 'app':
                os.environ['PLAYROOM_APP_ROOT'] = str(root)
            return script.resolve()
    raise RuntimeError('Project tools moved to boardgame-playroom-utils. Set PLAYROOM_UTILS_ROOT to that checkout; no implicit download.')
