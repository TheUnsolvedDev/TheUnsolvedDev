#!/usr/bin/env python3
"""Validate local page links, assets, catalog provenance, and source snapshots."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'website'


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.links, self.ids = path, [], set()
        self.feed(path.read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'Duplicate id in {self.path}: {attrs["id"]}'
            self.ids.add(attrs['id'])
        for key in ('src', 'href'):
            if attrs.get(key):
                self.links.append(attrs[key])


def check():
    pages = {p.resolve(): Page(p) for p in SITE.glob('*.html')}
    for path, page in pages.items():
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            assert target.is_relative_to(SITE), f'Link escapes deployed folder: {link}'
            assert target.exists(), f'Missing local asset: {link}'
            if url.fragment and target in pages:
                assert url.fragment in pages[target].ids, f'Missing anchor: {link}'
    data = json.loads((SITE / 'data/algorithms.json').read_text())
    for items in data['inventory'].values():
        for item in items:
            assert (ROOT / item['path']).is_file(), item['path']
    for algorithm in data['algorithms']:
        detail = json.loads((SITE / 'data' / f'{algorithm["id"]}.json').read_text())
        for source in detail['sources']:
            assert source['code'] == (ROOT / source['path']).read_text(), source['path']
    assert data['stats']['modules'] == len(data['algorithms'])
    print(f'PASS: {len(pages)} HTML pages, local assets/anchors, inventory paths, and source snapshots.')


if __name__ == '__main__':
    check()
