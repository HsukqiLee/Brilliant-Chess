# Brilliant Chess

中文说明请看 [README.zh.md](README.zh.md).

![screenshot](images/screenshot.png)

[**Brilliant Chess**](https://wdeloo.github.io/Brilliant-Chess) is a **free** **open source** app to analyze chess games in a similar way **Chess.com** does.

## Analysis Metrics

- The Summary panel now includes **Average CPL (centipawn loss)** for both players.
- CPL is computed from Stockfish evaluations per move and ignores mate evaluations.
- A CLI validator is available:

```
node scripts/validate-cpl.mjs scripts/sample.pgn
```

Optional depth override (default is 10 in the script):

```
$env:STOCKFISH_DEPTH=18
node scripts/validate-cpl.mjs scripts/sample.pgn
```

## Self Hosting

This project has two deployment styles:

- Docker deployment, where the repo builds the containers for you
- Non-Docker deployment, where you build the frontend once and let Nginx, Caddy, or Cloudflare Worker/Pages serve it

### What Runs Where

The default production layout is:

- frontend on `3000`
- backend on `9080`
- public traffic on `80/443`

The browser should always send page traffic to the frontend and API requests to `/api/`. Do not point the browser directly at the backend host unless you really know what you are doing.

### Environment Variables

These are the important frontend build variables:

- `NEXT_PUBLIC_BACKEND_URL`: API base URL used by the frontend, usually `/api` or `http://localhost:9080/api`
- `NEXT_PUBLIC_BASE_PATH`: only set this if the app is hosted under a subpath such as `/chess`

Backend auth also needs:

- `JWT_SECRET`: required, used to sign the login session cookie
- `CORS_ORIGINS`: optional, comma-separated list of development origins such as `http://localhost:3000`

Examples:

```bash
# root path deployment
NEXT_PUBLIC_BASE_PATH=

# app hosted at https://example.com/chess
NEXT_PUBLIC_BASE_PATH=/chess
```

## Docker Deployment

If you want the simplest server setup, use Docker.

1. Clone the repository.

```bash
git clone https://github.com/wdeloo/Brilliant-Chess.git
cd Brilliant-Chess
```

2. Create a `.env` file for backend secrets and optional database settings.

```bash
echo "NEXT_PUBLIC_BASE_PATH=" > .env
```

Add your own backend values if needed:

```bash
JWT_SECRET=replace-with-a-long-random-string
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
GEMINI_API_KEY=your-key-here
DB_TYPE=sqlite
DB_DSN=data/chess.db
```

3. Start the stack.

```bash
docker compose up -d --build
```

4. Open the app.

- frontend: `http://your-server:3000`
- backend: `http://your-server:9080`

5. Put your public Nginx, Caddy, or Cloudflare proxy in front of the frontend port `3000`.

The default frontend image is the backend-only production image. If you want the local/offline engine version, switch the Dockerfile to `frontend/Dockerfile.full`.

### Security Model

Authentication is cookie-based:

- login sets an HttpOnly session cookie
- the browser sends that cookie automatically on same-site requests
- the frontend does not store the JWT in localStorage or expose it to JavaScript
- protected routes are still enforced by the backend

The frontend can still be bypassed, but the backend remains the source of truth for authorization.

### Dockerfile Choice

- `frontend/Dockerfile`: backend-only production image, smaller, meant for normal online use
- `frontend/Dockerfile.full`: wasm engine image, meant for offline or local-engine use

## Nginx / Caddy Reverse Proxy

If your frontend and backend are already running on the same server, put a reverse proxy in front of them like this:

- `/` goes to the frontend
- `/api/` goes to the backend

### Nginx Proxy To Frontend And Backend

Use this when the frontend is on port `3000` and the backend is on port `9080`.

```nginx
server {
	listen 80;
	server_name chess.example.com;

	location /api/ {
		proxy_pass http://127.0.0.1:9080;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
	}

	location / {
		proxy_pass http://127.0.0.1:3000;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
	}
}
```

### Nginx Static Frontend

If you build the frontend to static files and serve them from disk, use `root` and `try_files`:

```nginx
server {
	listen 80;
	server_name chess.example.com;
	root /var/www/brilliant-chess;
	index index.html;

	location /api/ {
		proxy_pass http://127.0.0.1:9080;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}

	location / {
		try_files $uri $uri/ /index.html;
	}
}
```

### Caddy Proxy To Frontend And Backend

If the frontend is running on port `3000`:

```caddy
chess.example.com {
	handle /api/* {
		reverse_proxy 127.0.0.1:9080
	}

	handle {
		reverse_proxy 127.0.0.1:3000
	}
}
```

If the frontend is a static export on disk:

```caddy
chess.example.com {
	@api path /api/*
	handle @api {
		reverse_proxy 127.0.0.1:9080
	}

	root * /var/www/brilliant-chess
	try_files {path} /index.html
	file_server
}
```

## Non-Docker Frontend Deployment

`frontend` is a static export. That means you can build it once, copy `frontend/dist` to any static host, and let Nginx, Caddy, or Cloudflare Worker/Pages serve the files.

### Build The Frontend

For a normal online deployment where the frontend talks to the backend through `/api/`:

```bash
cd frontend
$env:NEXT_PUBLIC_BACKEND_URL="/api"
npm install
npm run build
```

This produces `frontend/dist`.

### Serve The Build Output

Copy `frontend/dist` to your web root, for example:

```bash
/var/www/brilliant-chess
```

Then configure your proxy so that:

- the frontend root serves the static files
- `/api/` forwards to the backend

If you want the local-engine version instead of backend-connected mode, build without `NEXT_PUBLIC_BACKEND_URL` and serve `frontend/dist` directly.

### Cloudflare Worker / Pages

Both Cloudflare Workers and Cloudflare Pages now support building and deploying static assets directly. If you want to host your frontend on Cloudflare Worker/Pages and proxy API requests, you can use one of the following setups:

#### Option 1: Serve Frontend via Workers Assets and Proxy API (Recommended)

Enable Assets hosting in your Worker (e.g., using Workers Assets) and forward `/api/` requests to your backend origin:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Forward API requests to the backend
    if (url.pathname.startsWith("/api/")) {
      const targetOrigin = new URL(env.BACKEND_ORIGIN);
      const targetUrl = new URL(request.url);
      targetUrl.protocol = targetOrigin.protocol;
      targetUrl.hostname = targetOrigin.hostname;
      targetUrl.port = targetOrigin.port;

      return fetch(new Request(targetUrl, request));
    }

    // Serve static frontend assets for everything else
    return env.ASSETS.fetch(request);
  },
};
```

##### Environment Variables

- `BACKEND_ORIGIN`: your backend host, such as `https://api.example.com`

---

#### Option 2: Worker Routing to Separate Pages/Static Host and Backend

If you have deployed the frontend to a separate static domain (e.g. Cloudflare Pages) and want to use a Worker as a simple edge router:

- `/api/*` -> backend origin
- everything else -> frontend origin

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const targetOrigin = url.pathname.startsWith("/api/")
      ? new URL(env.BACKEND_ORIGIN)
      : new URL(env.FRONTEND_ORIGIN);

    const targetUrl = new URL(request.url);
    targetUrl.protocol = targetOrigin.protocol;
    targetUrl.hostname = targetOrigin.hostname;
    targetUrl.port = targetOrigin.port;

    return fetch(new Request(targetUrl, request));
  },
};
```

##### Environment Variables

- `FRONTEND_ORIGIN`: your static frontend host, such as `https://pages.example.com`
- `BACKEND_ORIGIN`: your backend host, such as `https://api.example.com`

---

### Cloudflare Pages Build & Deployment Settings

If you are creating a project directly on Cloudflare Pages by linking your GitHub repository, configure it as follows:

1. **Framework Preset**: `None` (or `Next.js (Static HTML Export)`)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Build Output Directory**: `dist` (Note: the static export directory configured in this project's Next.js settings is `dist`)
5. **Environment Variables**:
   - If you want the frontend to route requests to the backend via a proxy, add the environment variable `NEXT_PUBLIC_BACKEND_URL` with value `/api`.

## Troubleshooting

If the page opens but the engine does not work:

- check that `/api/` really reaches the backend
- check that the frontend was built with the correct `NEXT_PUBLIC_BACKEND_URL`
- if you host under a subpath, set `NEXT_PUBLIC_BASE_PATH` before building
- make sure your reverse proxy preserves WebSocket upgrades

If the page is blank or static assets 404:

- verify the site root points to `frontend/dist`
- verify `basePath` matches your deployment path
- verify `index.html` is the fallback for SPA routes
