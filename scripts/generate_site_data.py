#!/usr/bin/env python3
"""Build a conservative, reproducible catalog. Never execute repository code."""
import argparse
import ast
import hashlib
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import quote

EXCLUDED = {'.git', '.agents', '.codex', '.venv', 'venv', 'node_modules', '__pycache__', 'website', 'scripts', 'tests'}


def build(root, output):
    files = sorted(p for p in root.rglob('*') if p.is_file() and not p.is_symlink()
                   and not any(x in EXCLUDED for x in p.relative_to(root).parts))
    def rel(p):
        return p.relative_to(root).as_posix()
    try:
        remote = subprocess.check_output(['git', '-C', str(root), 'remote', 'get-url', 'origin'], text=True).strip()
        remote = remote.replace('git@github.com:', 'https://github.com/').removesuffix('.git')
        revision = subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'], text=True).strip()
    except subprocess.CalledProcessError:
        remote, revision = '', 'main'
    if not remote.startswith('https://github.com/'):
        remote = ''
    def url(p):
        return f'{remote}/blob/{revision}/{quote(rel(p))}' if remote else ''
    inventory = {'python': [], 'notebooks': [], 'images': [], 'data': [], 'configuration': [], 'documentation': [], 'other': []}
    todos, groups, warnings = [], {}, []
    for p in files:
        suffix = p.suffix.lower()
        kind = ('python' if suffix == '.py' else 'notebooks' if suffix == '.ipynb' else
                'images' if suffix in {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'} else
                'data' if suffix in {'.csv', '.tsv', '.parquet', '.npy', '.npz', '.h5'} else
                'documentation' if suffix in {'.md', '.rst', '.txt'} and not p.name.startswith('requirements') else
                'configuration' if suffix in {'.json', '.yaml', '.yml', '.toml', '.ini', '.cfg'} or p.name.startswith(('requirements', 'Dockerfile')) else 'other')
        inventory[kind].append({'path': rel(p), 'url': url(p)})
        if suffix in {'.py', '.md', '.rst', '.txt', '.ipynb'}:
            source = p.read_text(encoding='utf-8', errors='replace')
            for line, text in enumerate(source.splitlines(), 1):
                if re.search(r'\b(TODO|FIXME|NotImplementedError)\b', text):
                    todos.append({'path': rel(p), 'line': line, 'text': text.strip()[:240], 'url': url(p) + f'#L{line}'})
        if suffix != '.py':
            continue
        try:
            tree = ast.parse(source)
        except SyntaxError as exc:
            warnings.append(f'{rel(p)}: could not parse Python ({exc.msg})')
            continue
        imports = [n for n in ast.walk(tree) if isinstance(n, (ast.Import, ast.ImportFrom))]
        tensorflow = any((isinstance(n, ast.Import) and any(a.name.split('.')[0] == 'tensorflow' for a in n.names)) or
                         (isinstance(n, ast.ImportFrom) and (n.module or '').split('.')[0] == 'tensorflow') for n in imports)
        if tensorflow:
            groups.setdefault(p.parent, []).append((p, tree))
    output.mkdir(parents=True, exist_ok=True)
    records = []
    for directory, modules in sorted(groups.items()):
        path = rel(directory)
        slug = re.sub(r'[^a-z0-9]+', '-', path.lower()).strip('-') or 'root'
        ident = slug + '-' + hashlib.sha256(path.encode()).hexdigest()[:8]
        docs = sorted(p for p in directory.iterdir() if p.is_file() and p.name.lower().startswith('readme'))
        first_doc = ast.get_docstring(modules[0][1]) or ''
        record = {'id': ident, 'name': directory.name if directory != root else modules[0][0].stem,
                  'category': directory.relative_to(root).parts[0] if directory != root else 'Repository root',
                  'description': first_doc.split('\n\n')[0][:400] or 'TensorFlow source discovered in this directory. Consult the source and documentation for its purpose.',
                  'status': 'Source present · unverified', 'framework': 'TensorFlow', 'path': path,
                  'tags': [], 'files': [], 'documentation': [{'path': rel(p), 'url': url(p)} for p in docs]}
        sources = []
        for p in sorted(directory.glob('*.py')):
            content = p.read_text(encoding='utf-8', errors='replace')
            sources.append({'path': rel(p), 'code': content, 'url': url(p)})
            record['files'].append(rel(p))
        for concept in ['tf.function', 'GradientTape', 'matmul', 'reduce_mean', 'jit_compile', 'Dataset', 'MirroredStrategy']:
            if any(concept in s['code'] for s in sources):
                record['tags'].append(concept)
        detail = {**record, 'sources': sources, 'readmes': [{'path': rel(p), 'text': p.read_text(encoding='utf-8', errors='replace'), 'url': url(p)} for p in docs]}
        (output / f'{ident}.json').write_text(json.dumps(detail, indent=2) + '\n')
        records.append(record)
    readme = root / 'README.md'
    readme_text = readme.read_text() if readme.exists() else ''
    highlights = []
    block = readme_text.split('## 🚀 Project highlights')[-1].split('\n---')[0] if '## 🚀 Project highlights' in readme_text else ''
    for title, body in re.findall(r'### ([^\n]+)\n(.*?)(?=\n### |\Z)', block, re.S):
        project_links = re.findall(r'\]\((https://github\.com/[^)]+)\)', body)
        highlights.append({'name': title, 'description': body.strip().split('\n')[0],
                           'tags': re.findall(r'`([^`]+)`', body),
                           'details': re.findall(r'^- (.+)$', body, re.M),
                           'project_url': project_links[0] if project_links else '', 'url': url(readme)})
    result = {'repository': remote, 'revision': revision, 'algorithms': records, 'inventory': inventory,
              'todos': todos, 'warnings': warnings, 'highlights': highlights,
              'stats': {'modules': len(records), 'categories': len({r['category'] for r in records}),
                        'python': len(inventory['python']), 'notebooks': len(inventory['notebooks']), 'documents': len(inventory['documentation'])},
              'methodology': 'Recursive file inventory excludes website tooling, tests, hidden environment folders and symlinks. Catalog entries group Python files by directories containing a direct TensorFlow import. Source presence is not proof of completeness, correctness, or an algorithm count. Notebook-only and indirect imports are inventoried but not automatically cataloged.'}
    (output / 'algorithms.json').write_text(json.dumps(result, indent=2) + '\n')
    print(f'Catalog: {len(records)} TensorFlow source groups; {len(files)} project files; {len(todos)} TODO markers.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    build(args.root.resolve(), args.output or args.root / 'website' / 'data')
