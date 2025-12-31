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
The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes the `dist` folder to GitHub Pages on every push to `main` (or manual `Run workflow`). This keeps Pages from serving the dev `index.html` that references `/src/main.jsx`.

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
- The app first tries to send Cypher queries directly to Neo4j using the environment variables `VITE_NEO4J_ENDPOINT`, `VITE_NEO4J_USERNAME`, `VITE_NEO4J_PASSWORD`, and optional `VITE_NEO4J_DATABASE`. If these are missing or the request fails, it falls back to the Cloudflare Worker URL in `VITE_NEO4J_WORKER_URL` (defaulting to the bundled worker). The worker call automatically tries both the provided URL and a sibling with/without a trailing `/run` path to avoid 404s and uses short timeouts so the UI quickly falls back to mock data instead of hanging.
