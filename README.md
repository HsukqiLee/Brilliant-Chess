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

If you deploy with Docker, `frontend/Dockerfile` builds the backend-only production image and `frontend/Dockerfile.full` keeps the local/offline wasm engine assets.
