#!/usr/bin/env python3
"""Inspect PlayRoom and execute only its existing, explicitly selected local commands."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import zipfile

CONFIG = json.loads(Path(__file__).with_name('config.json').read_text())
KIND = CONFIG['kind']
AREAS = ('docs', 'core', 'layout', 'hands', 'motion', 'network', 'pairing', 'storage', 'rules', 'standalone', 'release', 'setup', 'build', 'model', 'appearance', 'localization', 'table')


def checkout(value, kind):
    root = Path(value).expanduser().resolve(strict=True)
    marker = 'app/app.js' if kind == 'app' else 'packs'
    if not (root / marker).exists() or not (root / 'scripts/codex/check.sh').is_file():
        raise ValueError('Expected a PlayRoom '+kind+' checkout: '+str(root))
    return root


def git(root, *args):
    return subprocess.check_output(['git', '-C', str(root), *args], text=True, timeout=15).strip()


def inspect_project(repo, companion=''):
    root = checkout(repo, KIND)
    result = {'kind': KIND, 'root': str(root), 'head': git(root, 'rev-parse', 'HEAD'),
              'tree': git(root, 'rev-parse', 'HEAD^{tree}'), 'branch': git(root, 'branch', '--show-current'),
              'status': git(root, 'status', '--short'), 'network_checked': False}
    if KIND == 'app': result['version'] = json.loads((root / 'package.json').read_text())['version']
    else: result['packs'] = sorted(p.parent.name for p in (root / 'packs').glob('*/manifest.json'))
    if companion:
        other = checkout(companion, 'packs' if KIND == 'app' else 'app')
        result['companion'] = {'root': str(other), 'head': git(other, 'rev-parse', 'HEAD'), 'status': git(other, 'status', '--short')}
    return result


def plan_validation(repo, area, companion='', checks=None):
    if area not in AREAS: raise ValueError('Unknown area; choose '+', '.join(AREAS))
    root = checkout(repo, KIND)
    other = checkout(companion, 'packs' if KIND == 'app' else 'app') if companion else None
    app, packs = (root, other) if KIND == 'app' else (other, root)
    cwd = root
    selected = None
    if checks is not None:
        if not isinstance(checks, str) or not checks.strip(): raise ValueError('checks must name selectors or literal none')
        values = [value.strip() for value in checks.split(',')]
        if len(set(values)) != len(values) or any(not value or value.lower() in ('all','full','*') for value in values):
            raise ValueError('List explicit blocks/subblocks/cases; all/full/* are not allowed')
        if 'none' in values and values != ['none']: raise ValueError('none cannot be mixed with test selectors')
        selected = ','.join(values)
        if area in ('docs','standalone','setup','build'): raise ValueError('checks applies to test areas and release verification')
    if area == 'release' and selected is None:
        raise ValueError('Release checks are required: choose explicit selectors or none; no implicit full suite')
    if area == 'docs': command = ['git', 'diff', '--check']
    elif area == 'standalone': command = ['bash', 'scripts/codex/check.sh'] if KIND == 'packs' else ['python3', 'build.py']
    elif area == 'setup':
        command = ['bash', 'scripts/codex/setup.sh']
        if other: command += ['--packs-dir', str(packs / 'packs')] if KIND == 'app' else ['--app-dir', str(app)]
    elif area == 'build':
        command = ['python3', 'build.py', '--output-dir', str(root / 'dist/plugin-build')]
        if KIND == 'app':
            if not packs: raise ValueError('All-games build needs the packs companion checkout')
            command += ['--all-games', '--pwa', '--packs-dir', str(packs / 'packs')]
    else:
        profiles = {'core':'core/state', 'layout':'games/layout', 'hands':'input/hands', 'motion':'input/motion',
                    'network':'network', 'pairing':'pairing', 'storage':'storage', 'rules':'games/actions',
                    'model':'core/model', 'appearance':'core/appearance,ui/appearance',
                    'localization':'core/localization', 'table':'network/table'}
        selected = selected if selected is not None else profiles[area]
        if selected == 'none':
            command = ['git', 'diff', '--check']
        else:
            if not app or not packs: raise ValueError('Selected tests need explicit app + packs roots to avoid stale source packs')
            cwd = app
            # The repository validates its own selectors without executing tests.
            subprocess.check_output(['node', 'scripts/codex/test.cjs', selected, '--list'], cwd=app, text=True, timeout=15, stderr=subprocess.STDOUT)
            command = ['node', 'scripts/codex/test.cjs', selected]
    preparation = []
    if selected is not None and selected != 'none':
        preparation = [{'cwd':str(app), 'argv':['python3', 'build.py', '--prepare-dev', '--all-games', '--packs-dir', str(packs / 'packs')]}]
    return {'area':area, 'selected_checks':selected, 'tests_skipped':selected == 'none',
            'preparation':preparation, 'cwd':str(cwd), 'argv':command,
            'remote_actions':False, 'executed':False,
            'note':'Only the chosen checks run; none is deliberate omission. Packaging/SHA and publication verification are separate required steps. A plan is not a result.'}


def inspect_pack(repo, pack_id):
    root = checkout(repo, 'packs')
    if not re.fullmatch(r'[a-z][a-z0-9-]*', pack_id): raise ValueError('Invalid pack ID')
    pack = (root / 'packs' / pack_id).resolve(strict=True)
    if pack.parent != root / 'packs': raise ValueError('Pack escapes repository')
    manifest = json.loads((pack / 'manifest.json').read_text())
    registry=root/'shared/tags.json'
    tags=json.loads(registry.read_text())['tags'] if registry.exists() else []
    allowed={item['id']:item for item in tags}
    selected=manifest.get('tags',[])
    tag_issues=[] if 1<=len(selected)<=3 and len(set(selected))==len(selected) and all(t in allowed for t in selected) and any(allowed.get(t,{}).get('kind')=='type' for t in selected) else ['Tags missing or outside the current 1-3 type/mechanic contract']
    return {'id':pack_id, 'manifest':manifest,'tag_issues':tag_issues,'conditional_settings':[f['key'] for f in manifest.get('settings',[]) if f.get('visibleWhen')], 'files':sorted(str(p.relative_to(pack)) for p in pack.rglob('*') if p.is_file()),
            'source_modules':manifest.get('sourceModules'), 'layers':{name:(pack/name).is_dir() for name in ('domain','presentation','locales','ui')},
            'shared_assets':sorted(p.name for p in (root / 'shared/assets').glob('*') if p.is_file())}


def verify_release(directory):
    root = Path(directory).expanduser().resolve(strict=True)
    rows = (root / 'SHA256SUMS').read_text(encoding='ascii').splitlines()
    if not rows: raise ValueError('Empty SHA256SUMS')
    verified=[]
    for row in rows:
        m=re.fullmatch(r'([a-f0-9]{64})  ([^/\\\x00]+)', row)
        if not m: raise ValueError('Invalid checksum entry')
        digest,name=m.groups(); file=root/name
        if file.is_symlink() or file.resolve().parent!=root or not file.is_file(): raise ValueError('Invalid asset path')
        if file.stat().st_size > 128*1024*1024: raise ValueError('Asset exceeds 128 MiB inspection limit')
        if hashlib.sha256(file.read_bytes()).hexdigest()!=digest: raise ValueError('Checksum mismatch: '+name)
        if file.suffix=='.zip':
            with zipfile.ZipFile(file) as z:
                if sum(i.file_size for i in z.infolist()) > 256*1024*1024: raise ValueError('Expanded ZIP exceeds inspection limit')
                for i in z.infolist():
                    path=Path(i.filename)
                    if path.is_absolute() or '..' in path.parts: raise ValueError('Unsafe ZIP path')
                    if path.name in ('_worker.js','_routes.json'): raise ValueError('Private wrapper in public release')
                if z.testzip(): raise ValueError('Corrupt ZIP: '+name)
        verified.append(name)
    return {'verified':verified,'scope':'Checksums and public ZIP integrity; no publication or gameplay claim'}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation',choices=['inspect','plan','run','pack','verify-release'])
    parser.add_argument('--repo');parser.add_argument('--companion',default='')
    parser.add_argument('--area',choices=AREAS,default='docs')
    parser.add_argument('--checks',help='Explicit comma-separated selectors or none; required for release')
    parser.add_argument('--pack-id');parser.add_argument('--directory');parser.add_argument('--capture-dir')
    a=parser.parse_args()
    if a.operation=='verify-release': result=verify_release(a.directory)
    elif a.operation=='inspect': result=inspect_project(a.repo,a.companion)
    elif a.operation=='pack': result=inspect_pack(a.repo,a.pack_id)
    else:
        result=plan_validation(a.repo,a.area,a.companion,a.checks)
        if a.operation=='run':
            print(json.dumps(result,ensure_ascii=False),flush=True)
            env=os.environ.copy()
            if a.capture_dir: env['PLAYROOM_CAPTURE_DIR']=str(Path(a.capture_dir).expanduser().resolve())
            for step in result['preparation']+[result]:
                subprocess.run(step['argv'],cwd=step['cwd'],env=env,check=True)
            result['executed']=True;result['exit_status']=0
            result['evidence']=inspect_project(a.repo,a.companion)
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':
    try: main()
    except (ValueError,OSError,subprocess.SubprocessError,TypeError) as e:
        print(str(e),file=sys.stderr);sys.exit(1)
