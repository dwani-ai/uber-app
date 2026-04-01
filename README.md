# UberApp

Single portfolio hub for public **web** and **AI** projects from [github.com/sachinsshetty](https://github.com/sachinsshetty), [github.com/slabstech](https://github.com/slabstech), and [github.com/dwani-ai](https://github.com/dwani-ai). Version 1 lists the **union** of qualifying web apps and AI applications (not “must be both”). Infra-only, native-only, and library-only repositories are omitted from the catalog.

The UI loads a curated manifest (`web/public/projects.v1.json`). Each card has **Live** (enabled when `liveUrl` is set) and **Document** (GitHub or other docs URL).

## Local development

Requirements: Node.js 20+ (or use Docker only).

```bash
cd web
npm ci
npm run dev
```

Use `npm install` if you do not have `package-lock.json` yet. Committed lockfile enables reproducible installs and matches CI/Docker (`npm ci`).

Open the URL Vite prints (default `http://localhost:5173`).

## Catalog maintenance

- Edit **`web/public/projects.v1.json`** directly, or
- Change the repo lists in **`web/scripts/gen-manifest.mjs`** and run:

```bash
cd web
npm run gen:manifest
```

Then set **`liveUrl`** for entries once a demo is deployed. **`docsUrl`** usually stays `https://github.com/<owner>/<repo>`.

The manifest may include `"$schema": "/projects.v1.schema.json"` for editor validation. See **`web/public/projects.v1.schema.json`** for the JSON Schema.

## Continuous integration

On push/PR to `main` or `master`, [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs `npm ci` + production build in `web/`, then builds the Docker image (no push).

## Production build (Docker)

From the repository root:

```bash
docker compose build
docker compose up -d
```

The hub listens on **port 8080** on the host (`http://localhost:8080`).

## Deploy on a GCP VM with Cloudflare

1. Create a Compute Engine VM with HTTP/HTTPS allowed (or restrict to Cloudflare IP ranges).
2. Install Docker (or copy the built image from CI).
3. Clone this repo on the VM, run `docker compose up -d --build` (adjust `ports` in `docker-compose.yml` to `80:80` if desired).
4. In Cloudflare, point your domain (or subdomain) **A** record to the VM’s public IP. Enable the proxy (orange cloud) if you use Cloudflare features.
5. Set SSL/TLS mode to **Full (strict)** if the origin serves HTTPS with a valid cert; for plain HTTP on the VM behind Cloudflare proxy, use an appropriate Cloudflare mode and understand the tradeoffs.

Later, you can add more Compose services for individual demos and put **Caddy** or **nginx** in front to route subdomains or paths; point each manifest **`liveUrl`** at those routes.

## Layout

| Path | Purpose |
|------|---------|
| `web/` | Vite + React + TypeScript hub |
| `web/public/projects.v1.json` | v1 project catalog |
| `web/public/projects.v1.schema.json` | JSON Schema for the catalog (IDE validation) |
| `web/package-lock.json` | Locked dependencies for `npm ci` / Docker |
| `web/scripts/gen-manifest.mjs` | Regenerates the catalog from curated repo lists |
| `.github/workflows/ci.yml` | CI: web build + Docker image build |
| `Dockerfile` | Multi-stage build → nginx static server |
| `docker-compose.yml` | Runs the hub container |
| `nginx.conf` | SPA-friendly static file serving |
