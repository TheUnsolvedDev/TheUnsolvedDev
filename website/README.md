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

- `index.html`: personal introduction, biography, academic background, six research interests, selected projects, laboratory explorer, hardware diagram, repository map, working philosophy, toolkit, documented setup, and contact/social profiles.
- The single `index.html` contains the portfolio, work map, expandable project details, and interactive lab.
- `data/tensorflowai.json`: curated index of implementation families across the separate TensorflowAI, ReinforcementLearning, and JaxStormer repositories. Entries link to original documentation and source directories when available.
- `data/algorithms.json`: generated inventory for this portfolio repository.

The portfolio repository contains the site and profile content; the implementation catalog points to separate public repositories. The site does not copy source, invent details, or claim numerical results.

Research/about copy is a concise editorial adaptation of the root README. Project highlight cards are extracted from its “Project highlights” section. Review the editorial copy if the profile changes. The root and nested READMEs remain authoritative.

## Updating the catalog

The catalog is curated because its source repositories live outside this deployment repository. Update `data/tensorflowai.json` when an external repository changes, and keep each description tied to its README or source directory.

The generator inventories Python, notebooks, documentation, images, common dataset extensions, configuration, TODO/FIXME markers, and other project files. It excludes website tooling, scripts, tests, environment directories, and symlinks. Notebook-only implementations and indirect imports need manual review; they are inventoried but not automatically cataloged. A dependency manifest alone is insufficient evidence of an implementation.

Automatic source discovery cannot responsibly supply mathematical explanations, equation-to-code mappings, complexity, difficulty, dataset semantics, implementation completeness, GPU support, or measured results. Those sections need evidence and editorial review when actual implementations arrive. Existing README content is displayed as escaped plain text, not executed HTML or rendered LaTeX. Images are linked as discovered artifacts rather than assumed to be experiment plots. No placeholder algorithms or synthetic benchmark graphics are shipped.

External repository links target their public `main` branches and remain outside this deployment. The portfolio does not copy implementation source.

## GitHub Pages

In repository **Settings → Pages**, choose **GitHub Actions** as the source. Commit/push to `main`, or run “Deploy research laboratory” manually. The workflow generates and checks the catalog, uploads only `website/`, and deploys it through the Pages environment. No deployment has been performed by creating these files.

All internal paths are relative and work at `/` or a project prefix such as `/TheUnsolvedDev/`. The expected project URL is https://theunsolveddev.github.io/TheUnsolvedDev/ unless the account configures a different Pages domain.

See [GitHub's custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Accessibility and performance

Semantic sections, skip links, visible focus styles, labeled search, live result counts, keyboard-operable stage controls, mobile navigation, reduced-motion support, and responsive grids are included. Press `/` to focus search. Lab mode adjusts decorative animation and makes no hardware claims. All decoration is CSS/SVG. No service worker is installed; offline navigation is not guaranteed. Copy uses the browser Clipboard API on HTTPS or localhost and displays a manual-copy message if permission is unavailable.

## Checks

`scripts/check_site.py` verifies local assets, navigation anchors, catalog counts, real source paths, and exact source snapshots. Browser validation requires a local server and a browser permitted to run in the environment; static checks alone do not establish responsive rendering or interaction correctness.
