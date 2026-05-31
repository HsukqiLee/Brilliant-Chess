# Brilliant Chess

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

1. Clone the repository:

```
git clone https://github.com/wdeloo/Brilliant-Chess.git
cd Brilliant-Chess
```

2. Create a `.env` file:

```
echo "NEXT_PUBLIC_BASE_PATH=" > .env
```

3. Install dependencies and build the project:

```
npm install
npm run build
```

4. Start the server:

```
npm run start
```

If you deploy with Docker, `frontend/Dockerfile` builds the backend-only production image and `frontend/Dockerfile.full` keeps the local/offline wasm engine assets. The default frontend image proxies `/api` to the backend container, so the browser can reach the API through the same origin.

## Server Deployment

Recommended layout:

- Frontend container on port `3000`
- Backend container on port `9080`
- Reverse proxy on `80/443` that sends all browser traffic to the frontend container

The frontend container already forwards `/api/` to the backend container, so the external proxy only needs to point the public domain to the frontend.

### Nginx Example

```nginx
server {
	listen 80;
	server_name chess.example.com;

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

### Caddy Example

```caddy
chess.example.com {
	reverse_proxy 127.0.0.1:3000
}
```

If you prefer exposing the backend separately, you can point `/api/` to port `9080` instead and keep the frontend on port `3000`.
