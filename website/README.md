# Research laboratory website

Static HTML, CSS and vanilla JavaScript; no frontend build dependencies or runtime CDN requests.

## Preview

From the repository root:

```sh
python scripts/generate_site_data.py
python scripts/check_site.py
python -m http.server 8000 --directory website
```

Open http://localhost:8000. Use HTTP, not `file://`, because the explorer loads static JSON.

## Pages and content

- `index.html`: laboratory, explorer, profile research highlights, conceptual hardware diagram, artifact inventory, repository map, and about section.
- `algorithm.html?id=...`: shared detail page with original README text, operation markers, source-file selection, Python highlighting, line numbers, and copy control.
- `data/algorithms.json`: generated index and inventory; individual JSON files contain exact source snapshots loaded only on demand.

The inspected project originally contained **only the profile README**. There are no local algorithms, datasets, notebooks, plots, benchmarks, or environment files. Profile project mentions are not local algorithm entries. The website explicitly shows an empty catalog and does not invent details, equations, or results.

Research/about copy is a concise editorial adaptation of the root README. Project highlight cards are extracted from its “Project highlights” section. Review the editorial copy if the profile changes. The root and nested READMEs remain authoritative.

## Updating the catalog

Add real implementation directories to this repository and run the generator again. It uses Python's AST to detect direct TensorFlow imports and groups neighboring source files by directory. It never runs implementation code or needs TensorFlow installed. Discovered entries say **Source present · unverified**; directory groups are not claimed to be distinct algorithms.

The generator inventories Python, notebooks, documentation, images, common dataset extensions, configuration, TODO/FIXME markers, and other project files. It excludes website tooling, scripts, tests, environment directories, and symlinks. Notebook-only implementations and indirect imports need manual review; they are inventoried but not automatically cataloged. A dependency manifest alone is insufficient evidence of an implementation.

Automatic source discovery cannot responsibly supply mathematical explanations, equation-to-code mappings, complexity, difficulty, dataset semantics, implementation completeness, GPU support, or measured results. Those sections need evidence and editorial review when actual implementations arrive. Existing README content is displayed as escaped plain text, not executed HTML or rendered LaTeX. Images are linked as discovered artifacts rather than assumed to be experiment plots. No placeholder algorithms or synthetic benchmark graphics are shipped.

Source links are pinned to the checkout revision. Changes should be committed before deployment so GitHub source URLs resolve to the same content. The workflow regenerates the catalog at the pushed commit.

## GitHub Pages

In repository **Settings → Pages**, choose **GitHub Actions** as the source. Commit/push to `main`, or run “Deploy research laboratory” manually. The workflow generates and checks the catalog, uploads only `website/`, and deploys it through the Pages environment. No deployment has been performed by creating these files.

All internal paths are relative and work at `/` or a project prefix such as `/TheUnsolvedDev/`. The expected project URL is https://theunsolveddev.github.io/TheUnsolvedDev/ unless the account configures a different Pages domain.

See [GitHub's custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Accessibility and performance

Semantic sections, skip links, visible focus styles, labeled search, live result counts, keyboard-operable stage controls, mobile navigation, reduced-motion support, and responsive grids are included. Press `/` to focus search. Lab mode adjusts decorative animation and makes no hardware claims. All decoration is CSS/SVG. No service worker is installed; offline navigation is not guaranteed. Copy uses the browser Clipboard API on HTTPS or localhost and displays a manual-copy message if permission is unavailable.

## Checks

`scripts/check_site.py` verifies local assets, navigation anchors, catalog counts, real source paths, and exact source snapshots. `scripts/browser_audit.mjs` exercises Chromium through its debugging interface when a local server and debug browser are running; see its header for usage. Test fixtures used by the browser audit are deliberately outside the shipped site.
