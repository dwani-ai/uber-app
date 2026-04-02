# UberApp

Single portfolio hub for public **web** and **AI** projects from [github.com/sachinsshetty](https://github.com/sachinsshetty), [github.com/slabstech](https://github.com/slabstech), and [github.com/dwani-ai](https://github.com/dwani-ai). Version 1 lists the **union** of qualifying web apps and AI applications (not “must be both”). Infra-only, native-only, and library-only repositories are omitted from the catalog.

The UI loads [`web/public/projects.v1.json`](web/public/projects.v1.json). Each card has **Run in UberApp** (embedded preview at `/run/<project-id>`), **New tab**, and **Document**. Each row includes a **`subdomain`** field equal to **`id`**: use that string as the **Docker Compose service name** and as the **left-hand label** in `Host(<subdomain>.${DOMAIN})` for Traefik.

## One-command automation (this repo)

Everything is wired in **one project**: Node scripts under [`scripts/`](scripts/), a root [`package.json`](package.json), and a [`Makefile`](Makefile).

| Command | What it does |
|--------|----------------|
| `npm run env:copy` | Create `.env` from `.env.example` if missing |
| `npm run install:web` | `npm ci` in `web/` |
| `npm run manifest` | Regenerate `web/public/projects.v1.json` (reads **`DOMAIN`** from `.env`) |
| `npm run validate` | `docker compose config` (includes `docker-compose.apps.yml` if present) |
| `npm run compose:apps` | Regenerate [`docker-compose.apps.yml`](docker-compose.apps.yml) (only [`simple-deploy-repos.mjs`](scripts/lib/simple-deploy-repos.mjs)) |
| `npm run stubs` | Regenerate [`traefik/dynamic/projects-stubs.yml`](traefik/dynamic/projects-stubs.yml) (needs `DOMAIN`; see below) |
| `npm run deploy` | **Full pipeline:** `install:web` → manifest → **`compose:apps`** (simple-deploy list only) → stubs → compose validate → **build** → **`docker compose up -d`** |
| `npm run deploy:build` | Same as deploy but **no** `up` (images only) |
| `npm run ci` | Same checks as GitHub Actions (needs Docker on the machine) |

Equivalent: `make deploy`, `make manifest`, `make ci`, etc.

**Simple deploy vs coming soon:** UberApp `liveUrl` and generated [`docker-compose.apps.yml`](docker-compose.apps.yml) only include repos listed in [`scripts/lib/simple-deploy-repos.mjs`](scripts/lib/simple-deploy-repos.mjs). The image [`runtime/catalog-app`](runtime/catalog-app) runs [`build.sh`](runtime/catalog-app/build.sh): it picks the first `package.json` that has a `build` script (root, then `web/`, `frontend/`, `dashboard/tax_ui/`, etc.), installs with npm/pnpm/yarn, runs `npm run build`, and copies `dist` / `build` / `out` / `_site` into nginx. Repos that are not Node static builds stay **`liveUrl: null`** (Coming soon) until you add them with a custom Dockerfile or extend the builder.

**First-time server deploy:**

```bash
cp .env.example .env
# edit DOMAIN=portfolio.example.com
npm run deploy
```

**Non-interactive / automation:** if `.env` is missing, you can bootstrap in one step (no manual edit):

```bash
DOMAIN=portfolio.example.com node scripts/deploy.mjs
```

**GCP Compute Engine (single bootstrap):**

1. Allow **TCP 80** to the VM (e.g. create a VPC firewall rule, or use the `http-server` network tag with the default rule).
2. Point DNS: **`hub.<DOMAIN>`** and **`*.<DOMAIN>`** (wildcard) at the VM’s external IP.
3. Create the instance with metadata and the startup script (run from a machine that has this repo, or adjust paths):

```bash
gcloud compute instances create uber-app \
  --zone=us-central1-a \
  --machine-type=e2-standard-4 \
  --boot-disk-size=100GB \
  --tags=http-server \
  --metadata-from-file=startup-script=scripts/gcp-startup.sh \
  --metadata=uberapp_domain=portfolio.example.com
```

Optional metadata key **`uberapp_repo_url`** if the install should clone a fork. The script installs Docker and Node 22, clones into `/opt/uber-app`, and runs **`node scripts/deploy.mjs`** with **`DOMAIN`** set. The first run may take a long time if every catalog app image is built. If users always open the site as **HTTPS** (e.g. Cloudflare), add **`UBERAPP_URL_SCHEME=https`** to `/opt/uber-app/.env`, then run **`npm run manifest && node scripts/deploy.mjs --skip-install`** so iframe `liveUrl`s match.

**Existing VM** (Docker + Node 20+ already installed):

```bash
git clone https://github.com/dwani-ai/uber-app.git && cd uber-app
DOMAIN=your.apex.domain node scripts/deploy.mjs
```

Optional flags for [`scripts/deploy.mjs`](scripts/deploy.mjs): `--skip-install`, `--skip-manifest`, `--no-up`.

If you add **`docker-compose.apps.yml`** (copy from [`docker-compose.apps.example.yml`](docker-compose.apps.example.yml)), it is **merged automatically** by all compose-related commands.

## Architecture: Traefik + subdomains

On the VM, **Traefik** is the only public entry (port **80** by default). **UberApp (hub)** and **every project** run as separate containers on the shared Docker network `uberapp_edge`.

| Host | Container |
|------|-----------|
| `hub.${DOMAIN}` | This repo’s `hub` image (static UI) |
| `<project-id>.${DOMAIN}` | Default: **stub** page (`placeholder` service). Optional: your real container via `docker-compose.apps.yml` (same service name as catalog `id`) |

**All catalog projects “running”**

After `npm run deploy` (or `npm run stubs`), Traefik loads **`projects-stubs.yml`**: one `Host(<id>.${DOMAIN})` rule per catalog entry, all pointing at a single **nginx `placeholder`** container that returns a small HTML page (so every subdomain answers — no 502). To run the **real** app for an id, add it to **`docker-compose.apps.yml`** with Traefik labels; that service name is **auto-omitted** from stub generation so routes do not conflict.

Set **`UBERAPP_URL_SCHEME`** / **`UBERAPP_PUBLIC_PORT`** in `.env` when Traefik is not on 443 (**local example:** `http` + `8080`). Regenerate the manifest after changing them.

Stub file is gitignored when generated locally; [`traefik/dynamic/00-bootstrap.yml`](traefik/dynamic/00-bootstrap.yml) keeps the directory valid before the first `npm run stubs`.

**DNS (Cloudflare or any DNS):**

- `A` **hub** → VM IP (or CNAME).
- `A` **\*** (wildcard) → same VM IP so every `<id>.${DOMAIN}` resolves without adding 50+ records (or create individual `A` records if you prefer).

Copy [`.env.example`](.env.example) to `.env` and set **`DOMAIN`**, or run `npm run env:copy` once.

```bash
npm run deploy
```

(Equivalent: `docker compose build && docker compose up -d` after `npm run manifest`, but `deploy` runs the full sequence.)

Traefik listens on **80** on the host. If port 80 is busy locally, set e.g. `TRAEFIK_HTTP_PORT=8080` in `.env` and open `http://hub.${DOMAIN}:8080` only if your DNS/hosts match (usually use plain `:80` on the server).

### Adding project containers

Each catalog **`id`** (e.g. `dwani-ai-discovery`) must match:

1. **Docker Compose `services.<id>`** name (letters, digits, `-`; same as manifest `id`).
2. **Traefik** rule `Host(\`<id>.${DOMAIN}\`)` pointing at that service’s internal port.

See [`docker-compose.apps.example.yml`](docker-compose.apps.example.yml) for a working **whoami** demo and a commented template. Merge when starting:

```bash
docker compose -f docker-compose.yml -f docker-compose.apps.yml up -d --build
```

Build or pull images from each project’s own repository; UberApp does not vendor those Dockerfiles.

### Manifest URLs for this layout

When **`DOMAIN`** or **`UBERAPP_DEPLOY_DOMAIN`** is set, regenerating the manifest assigns every project:

`https://<id>.<DOMAIN>`

so **Run in UberApp** / iframes target your Traefik routes (after those containers exist).

```bash
npm run manifest
# or: cd web && DOMAIN=portfolio.example.com npm run gen:manifest
```

Without **`DOMAIN`**, the generator keeps **GitHub Pages** defaults for web rows and **`liveUrl: null`** for AI-only rows (unless you edit JSON by hand).

**`subdomain`** is always written and matches **`id`** for Traefik/DNS alignment.

## Local Docker (Traefik + subdomains)

To run the **same stack as production** on your machine (Traefik + hub, optional app services):

1. **Pick a hostname that resolves to your laptop without editing `/etc/hosts` for every app:** use [**nip.io**](https://nip.io) with your loopback address, for example **`127.0.0.1.nip.io`**. Then `hub.127.0.0.1.nip.io`, `dwani-ai-discovery.127.0.0.1.nip.io`, etc. all resolve to `127.0.0.1`.

2. Create `.env` (or run `npm run env:copy` and edit):

   ```bash
   DOMAIN=127.0.0.1.nip.io
   TRAEFIK_HTTP_PORT=8080
   ```

   Use **`8080`** (or another free port) if something already uses **80**.

3. From the **repo root** (install Node + Docker):

   ```bash
   npm run manifest    # writes liveUrl = https://<id>.127.0.0.1.nip.io (needs rebuild to bake into hub image)
   npm run deploy
   ```

   The hub image is built after the manifest is generated, so the static UI includes the updated JSON.

4. Open **http://hub.127.0.0.1.nip.io:8080** (include the port if `TRAEFIK_HTTP_PORT=8080`).

**Port mismatch:** `npm run manifest` with `DOMAIN` set produces `liveUrl` values like `https://<id>.127.0.0.1.nip.io` (no port). If Traefik is only on **8080**, those links target **443** and will fail until you either **publish Traefik on 80** locally, or change **`liveUrl`** manually to `http://<id>.127.0.0.1.nip.io:8080` for dev, or put a proxy on 80.

**“All web apps running” in Docker**

- UberApp **does not** include built images for every catalog repo. Traefik can only route to containers you **define**.
- For each app you actually have an image for, add a service to **`docker-compose.apps.yml`** (start from [`docker-compose.apps.example.yml`](docker-compose.apps.example.yml)): **service name** = manifest **`id`**, Traefik **`Host(\`<id>.${DOMAIN}\`)`** → container port.
- Apps **without** a compose service will get **no backend** (Traefik **502**) if the manifest’s `liveUrl` points at that subdomain. To preview **many** sites without running 58 containers, keep the committed manifest **without** setting `DOMAIN` when you run `npm run manifest` so **web** apps keep **GitHub Pages** `liveUrl`s and embed those instead.

**Hub only (no Traefik)**

```bash
docker compose build hub
docker run --rm -p 8080:80 uber-app-hub:local
```

Open `http://localhost:8080`. Use a manifest with `liveUrl`s that already work (e.g. GitHub Pages).

## Local development (frontend)

Requirements: Node.js 20+ (or Docker only).

```bash
cd web
npm ci
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Catalog maintenance

- Edit **`web/public/projects.v1.json`**, or
- Change lists in **`web/scripts/gen-manifest.mjs`** and run `npm run gen:manifest` from `web/`.

Per-repo overrides live in **`liveUrlOverrides`** when not using **`DOMAIN`**-based URLs.

The manifest may include `"$schema": "/projects.v1.schema.json"`. See **`web/public/projects.v1.schema.json`**.

## Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs **`node scripts/ci.mjs`**: `web` install + production build, **`generate-traefik-stubs`**, `docker compose config`, and **`docker compose build`** (hub + placeholder).

## Deploy on a GCP VM with Cloudflare

1. Create a VM with Docker; allow **80** (and **443** if you terminate TLS on the VM later).
2. Clone this repo, configure `.env` with **`DOMAIN`**.
3. Run **`npm run deploy`**. Add project services by creating **`docker-compose.apps.yml`** (see example) and redeploying.
4. In Cloudflare, point **hub** and a **wildcard** `*` (or individual hosts) to the VM IP. Choose an SSL mode that matches whether Traefik serves HTTP only (**Flexible** to origin) or you add TLS on Traefik.

## Layout

| Path | Purpose |
|------|---------|
| `package.json` (root) | npm scripts: `deploy`, `manifest`, `ci`, … |
| `Makefile` | Same as npm scripts for `make` users |
| `scripts/deploy.mjs` | Automated install → manifest → **Traefik stubs** → compose build → up |
| `scripts/generate-traefik-stubs.mjs` | One `Host()` route per catalog id → `placeholder` |
| `traefik/dynamic/00-bootstrap.yml` | Minimal file before `projects-stubs.yml` exists |
| `traefik/dynamic/projects-stubs.yml` | **Generated** (gitignored): all stub routers |
| `placeholder/` | Shared nginx for stub subdomains |
| `scripts/ci.mjs` | CI pipeline entrypoint |
| `scripts/lib/` | Shared `.env` loader + compose file list |
| `web/` | Vite + React + TypeScript hub |
| `web/src/pages/` | Home catalog + `/run/:projectId` embed |
| `web/public/projects.v1.json` | v1 catalog (`subdomain` + `liveUrl`) |
| `web/scripts/gen-manifest.mjs` | Regenerates catalog; respects `DOMAIN` |
| `docker-compose.yml` | Traefik + `hub` + `placeholder` |
| `docker-compose.apps.yml` | Optional — your project services (gitignored if local) |
| `docker-compose.apps.example.yml` | Example merge file |
| `.env.example` | `DOMAIN` and optional port |
| `Dockerfile` | Hub image (nginx static) |
| `nginx.conf` | SPA fallback inside `hub` |


<!--
 curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
 nvm install 24


-->