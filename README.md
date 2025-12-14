# Quokka Cypher Game

A Vite + React mini-game for practicing Neo4j Cypher through story and practice modes with MCQ/Cypher grading.

## Development
1. Install dependencies
   ```bash
   npm install
   ```
2. Start the dev server
   ```bash
   npm run dev
   ```
3. Run tests and build check
   ```bash
   npm run check
   ```

## Deployment (GitHub Pages)
GitHub Pages must serve the built `dist` output, not the raw `index.html` that points to `/src/main.jsx`. The repo is configured for a project page at `/neo4j-cyper-game/` via Vite's `base` setting.

### Automated (recommended)
The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes the `dist` folder to GitHub Pages on every push to `main` (or manual `Run workflow`).

1. In GitHub: **Settings → Pages**
   - Source: **GitHub Actions**
2. Push to `main` or trigger the workflow. It will build with `npm run build` and deploy the artifact automatically.

### Manual (fallback)
1. Build the project
   ```bash
   npm run build
   ```
2. Publish the `dist` folder to `gh-pages`
   ```bash
   npm run deploy
   ```
   This uses the `gh-pages` CLI to push `dist` to the `gh-pages` branch.
3. In GitHub: **Settings → Pages**
   - Source: *Deploy from a branch*
   - Branch: `gh-pages` / (root)

### Quick validation
After deployment, the generated `index.html` should reference hashed assets, e.g. `./assets/index-xxxxx.js`. If you still see `/src/main.jsx` in the served HTML, Pages is serving the source instead of the build output.

## Notes
- The Vite base path is set to `/neo4j-cyper-game/` for GitHub Pages project hosting.
- For a user/organization root page, adjust `base` in `vite.config.js` accordingly.
