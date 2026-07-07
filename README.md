# eliancpastor.github.io

Monorepo for every site I publish. The portfolio hub lives at the domain root;
each project is its own self-contained Vite app mounted at a sub-path.

## Live

- **Portfolio** — https://eliancpastor.github.io/
- **RESOLE — The Repair Atelier** — https://eliancpastor.github.io/resole/

## Structure

```
sites/
├── portfolio/   # the hub (base: /)
└── resole/      # SITE·001 (base: /resole/)
```

Each site has its own `package.json`, dev server, and build. The root
`package.json` orchestrates:

```bash
npm run dev:portfolio     # work on the hub
npm run dev:resole        # work on a project
npm run build             # build everything → dist/ (portfolio at root, projects at sub-paths)
npm run deploy            # push dist/ to the gh-pages branch
```

## Adding a new site

1. Scaffold it under `sites/<name>/` with `base: '/<name>/'` in its Vite config.
2. Add `build:<name>` to the root scripts and copy its dist into `dist/<name>` in `assemble`.
3. Add its card to the index in `sites/portfolio/index.html`.
