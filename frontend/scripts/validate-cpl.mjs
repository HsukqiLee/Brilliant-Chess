import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline";
import { Chess } from "chess.js";

const depth = Number(process.env.STOCKFISH_DEPTH ?? 10);
const pgnPath = process.argv[2];

if (!pgnPath) {
  console.error("Usage: node scripts/validate-cpl.mjs <pgn-file>");
  process.exit(1);
}

const pgn = fs.readFileSync(pgnPath, "utf8");
const enginePath = path.resolve("public/engine/stockfish.js");

const engine = spawn(process.execPath, [enginePath], {
  stdio: ["pipe", "pipe", "pipe"]
});

engine.stderr.on("data", (data) => {
  const text = data.toString().trim();
  if (text) console.error(text);
});

const rl = readline.createInterface({ input: engine.stdout });

function send(command) {
  engine.stdin.write(`${command}\n`);
}

function waitForLine(predicate) {
  return new Promise((resolve) => {
    const handler = (line) => {
      if (predicate(line)) {
        rl.off("line", handler);
        resolve(line);
      }
    };
    rl.on("line", handler);
  });
}

function parseScore(line) {
  const scoreIndex = line.indexOf("score ");
  if (scoreIndex === -1) return null;

  const parts = line.slice(scoreIndex).trim().split(/\s+/);
  const type = parts[1];
  const value = Number(parts[2]);

  if (!type || Number.isNaN(value)) return null;

  return { type, value };
}

async function analyzeFen(fen) {
  send(`position fen ${fen}`);
  send(`go depth ${depth}`);

  let lastScore = null;

  return new Promise((resolve) => {
    const handler = (line) => {
      if (line.startsWith("info ") && line.includes(" score ")) {
        const score = parseScore(line);
        if (score) lastScore = score;
      }

      if (line.startsWith("bestmove")) {
        rl.off("line", handler);
        resolve(lastScore);
      }
    };

    rl.on("line", handler);
  });
}

async function main() {
  send("uci");
  await waitForLine((line) => line === "uciok");
  send("isready");
  await waitForLine((line) => line === "readyok");

  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch (error) {
    console.error("Failed to parse PGN.");
    console.error(error);
    process.exit(1);
  }

  const history = chess.history({ verbose: true });
  const runner = new Chess();

  const scoreForColor = { w: [], b: [] };

  const startScore = await analyzeFen(runner.fen());
  let prevCp = startScore?.type === "cp" ? startScore.value : null;

  for (const move of history) {
    runner.move(move);
    const score = await analyzeFen(runner.fen());
    const cp = score?.type === "cp" ? score.value : null;

    if (prevCp !== null && cp !== null) {
      const before = move.color === "w" ? prevCp : -prevCp;
      const after = move.color === "w" ? cp : -cp;
      const loss = Math.max(0, before - after);
      scoreForColor[move.color].push(loss);
    }

    prevCp = cp;
  }

  const avg = (arr) => (arr.length ? arr.reduce((sum, n) => sum + n, 0) / arr.length : 0);

  console.log(`Depth: ${depth}`);
  console.log(`White Average CPL: ${avg(scoreForColor.w).toFixed(1)}`);
  console.log(`Black Average CPL: ${avg(scoreForColor.b).toFixed(1)}`);

  send("quit");
  rl.close();
}

main().catch((err) => {
  console.error(err);
  send("quit");
  rl.close();
  process.exit(1);
});
