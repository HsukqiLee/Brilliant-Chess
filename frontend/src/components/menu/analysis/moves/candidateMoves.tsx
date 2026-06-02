"use client";

import { useContext, useEffect, useState } from "react";
import { AnalyzeContext } from "@/context/analyze";
import { Chess, PieceSymbol } from "chess.js";

export interface CandidateLine {
  multipv: number;
  depth: number;
  score: string[];
  pv: string[];
  sanMove?: string;
  sanPV?: string[];
}

export function uciToSan(uci: string, fen: string): string {
  try {
    const chess = new Chess(fen);
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci[4] as PieceSymbol | undefined;
    const moveObj = chess.move({ from, to, promotion });
    return moveObj.san;
  } catch {
    return uci;
  }
}

export function pvToSanLine(pv: string[], fen: string): string[] {
  const sanMoves: string[] = [];
  try {
    const tempChess = new Chess(fen);
    for (const uci of pv) {
      const from = uci.slice(0, 2);
      const to = uci.slice(2, 4);
      const promotion = uci[4] as PieceSymbol | undefined;
      const moveObj = tempChess.move({ from, to, promotion });
      sanMoves.push(moveObj.san);
    }
  } catch {
    // stop translation if a move fails (due to incomplete search path)
  }
  return sanMoves;
}

export function parseInfoLine(line: string, fen: string): CandidateLine | null {
  const parts = line.split(/\s+/);
  if (parts[0] !== "info") return null;

  const multipvIdx = parts.indexOf("multipv");
  if (multipvIdx === -1) return null;
  const multipv = Number(parts[multipvIdx + 1]);

  const depthIdx = parts.indexOf("depth");
  const depth = depthIdx !== -1 ? Number(parts[depthIdx + 1]) : 0;

  // Score parsing
  const scoreIdx = parts.indexOf("score");
  let score: string[] = ["cp", "0"];
  if (scoreIdx !== -1) {
    const scoreType = parts[scoreIdx + 1]; // "cp" or "mate"
    const scoreVal = parts[scoreIdx + 2];
    score = [scoreType, scoreVal];
  }

  // PV parsing
  const pvIdx = parts.indexOf("pv");
  let pv: string[] = [];
  if (pvIdx !== -1) {
    pv = parts.slice(pvIdx + 1);
  }

  if (pv.length === 0) return null;

  const sanMove = uciToSan(pv[0], fen);
  const sanPV = pvToSanLine(pv, fen);

  return {
    multipv,
    depth,
    score,
    pv,
    sanMove,
    sanPV,
  };
}

export default function CandidateMoves(props: { fen?: string }) {
  const { fen } = props;
  const analyzeContext = useContext(AnalyzeContext);
  const [evalWorker] = analyzeContext.evalWorker;
  const [evalWorker2] = analyzeContext.evalWorker2;

  const [compare, setCompare] = useState(false);

  // Standard / Worker 1 lines
  const [lines, setLines] = useState<CandidateLine[]>([]);
  const [searching, setSearching] = useState(false);
  const [depth1, setDepth1] = useState(0);

  // Worker 2 (Deep Comparison) lines
  const [lines2, setLines2] = useState<CandidateLine[]>([]);
  const [searching2, setSearching2] = useState(false);
  const [depth2, setDepth2] = useState(0);

  useEffect(() => {
    if (!fen || !evalWorker) {
      setLines([]);
      setSearching(false);
      setDepth1(0);
      return;
    }

    // Clean up and restart analysis on evalWorker
    evalWorker.postMessage("stop");
    setLines([]);
    setSearching(true);
    setDepth1(0);

    const timeout = setTimeout(() => {
      evalWorker.postMessage(`position fen ${fen}`);
      if (compare) {
        // In comparison mode, worker 1 evaluates at lower depth (fast)
        evalWorker.postMessage("go depth 12");
      } else {
        // Otherwise, normal infinite search
        evalWorker.postMessage("go infinite");
      }
    }, 30);

    function handleMessage(e: MessageEvent) {
      const line = e.data as string;
      if (typeof line !== "string" || !line.startsWith("info")) {
        if (line.startsWith("bestmove")) {
          setSearching(false);
        }
        return;
      }

      const parsed = parseInfoLine(line, fen!);
      if (parsed) {
        setDepth1((prev) => Math.max(prev, parsed.depth));
        setLines((prev) => {
          const filtered = prev.filter((l) => l.multipv !== parsed.multipv);
          return [...filtered, parsed].sort((a, b) => a.multipv - b.multipv);
        });
      }
    }

    evalWorker.addEventListener("message", handleMessage);

    return () => {
      clearTimeout(timeout);
      evalWorker.removeEventListener("message", handleMessage);
      evalWorker.postMessage("stop");
    };
  }, [fen, evalWorker, compare]);

  // Effect for evalWorker2 (Deep Worker)
  useEffect(() => {
    if (!fen || !evalWorker2 || !compare) {
      setLines2([]);
      setSearching2(false);
      setDepth2(0);
      return;
    }

    // Clean up and restart deep search
    evalWorker2.postMessage("stop");
    setLines2([]);
    setSearching2(true);
    setDepth2(0);

    const timeout = setTimeout(() => {
      evalWorker2.postMessage(`position fen ${fen}`);
      evalWorker2.postMessage("go infinite");
    }, 30);

    function handleMessage2(e: MessageEvent) {
      const line = e.data as string;
      if (typeof line !== "string" || !line.startsWith("info")) {
        if (line.startsWith("bestmove")) {
          setSearching2(false);
        }
        return;
      }

      const parsed = parseInfoLine(line, fen!);
      if (parsed) {
        setDepth2((prev) => Math.max(prev, parsed.depth));
        setLines2((prev) => {
          const filtered = prev.filter((l) => l.multipv !== parsed.multipv);
          return [...filtered, parsed].sort((a, b) => a.multipv - b.multipv);
        });
      }
    }

    evalWorker2.addEventListener("message", handleMessage2);

    return () => {
      clearTimeout(timeout);
      evalWorker2.removeEventListener("message", handleMessage2);
      evalWorker2.postMessage("stop");
    };
  }, [fen, evalWorker2, compare]);

  function formatEval(score: string[]) {
    const type = score[0];
    const val = Number(score[1]);
    if (type === "mate") {
      return `M${val}`;
    }
    const valNum = val / 100;
    const sign = valNum >= 0 ? "+" : "";
    return `${sign}${valNum.toFixed(2)}`;
  }

  if (!fen || !evalWorker) return null;

  return (
    <div className="w-[85%] flex flex-col gap-2.5 bg-backgroundBoxBox/45 border border-white/5 backdrop-blur-md rounded-borderRoundness px-3 py-2.5 shadow-sm transition-all duration-300">
      <div className="flex flex-row items-center justify-between text-[11px] font-bold text-foregroundGrey/90">
        <span className="flex items-center gap-1.5 font-extrabold text-foregroundHighlighted">
          Engine Evaluation
        </span>
        {evalWorker2 && (
          <button
            type="button"
            onClick={() => setCompare(!compare)}
            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-borderRoundness transition-all duration-200 cursor-pointer border ${compare ? "bg-backgroundBoxBoxHighlighted border-transparent text-foreground shadow-sm" : "bg-backgroundBoxBox/30 border-white/5 hover:bg-backgroundBoxBox/50 text-foregroundGrey hover:text-foregroundHighlighted"}`}
          >
            Compare Depths
          </button>
        )}
      </div>

      {!compare ? (
        // Standard mode
        <>
          <div className="text-[9px] text-foregroundGrey/70 font-extrabold uppercase tracking-wider">
            Standard Analysis{" "}
            {searching && depth1 > 0
              ? `(Depth ${depth1})`
              : `(Depth ${depth1} done)`}
          </div>
          {lines.length === 0 ? (
            <div className="text-xs text-foregroundGrey/50 py-2 italic font-medium animate-pulse">
              Analyzing position...
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {lines.slice(0, 3).map((line) => {
                const evalText = formatEval(line.score);
                const isWhiteAdvantage = !evalText.startsWith("-");
                const scoreBg = isWhiteAdvantage
                  ? "bg-white/95 text-black font-extrabold shadow-sm"
                  : "bg-neutral-900/90 text-white font-extrabold border border-white/10 shadow-sm";

                const formattedPV =
                  line.sanPV && line.sanPV.length > 0
                    ? line.sanPV.slice(0, 5).join(" ") +
                      (line.sanPV.length > 5 ? "..." : "")
                    : "";

                return (
                  <li
                    key={line.multipv}
                    className="flex flex-row gap-2.5 items-center text-xs hover:bg-white/5 px-2 py-1 rounded transition-colors duration-150"
                  >
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-borderRoundness w-[42px] text-center shrink-0 ${scoreBg}`}
                    >
                      {evalText}
                    </span>
                    <div className="flex flex-col min-w-0 flex-grow">
                      <span className="font-extrabold text-foregroundHighlighted truncate">
                        {line.sanMove}
                      </span>
                      <span className="text-[10px] text-foregroundGrey/80 truncate font-medium">
                        {formattedPV}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        // Compare mode (Side-by-side)
        <div className="grid grid-cols-2 gap-3 mt-1 border-t border-white/5 pt-2">
          {/* Standard / Fast depth */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="text-[9px] font-extrabold text-foregroundGrey/70 uppercase tracking-wider truncate">
              Fast {depth1 > 0 ? `(D${depth1})` : ""}
            </div>
            {lines.length === 0 ? (
              <div className="text-[10px] text-foregroundGrey/40 italic py-1 animate-pulse">
                Analyzing...
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {lines.slice(0, 3).map((line) => {
                  const evalText = formatEval(line.score);
                  const isWhiteAdvantage = !evalText.startsWith("-");
                  const scoreBg = isWhiteAdvantage
                    ? "bg-white/95 text-black font-bold shadow-sm"
                    : "bg-neutral-900/90 text-white border border-white/10 font-bold shadow-sm";

                  return (
                    <li
                      key={line.multipv}
                      className="flex flex-col gap-0.5 min-w-0 text-[11px] hover:bg-white/5 px-1.5 py-0.5 rounded transition-colors duration-150"
                    >
                      <div className="flex flex-row items-center gap-1.5">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-borderRoundness w-[32px] text-center shrink-0 font-bold ${scoreBg}`}
                        >
                          {evalText}
                        </span>
                        <span className="font-extrabold text-foregroundHighlighted truncate">
                          {line.sanMove}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Deep depth */}
          <div className="flex flex-col gap-1.5 min-w-0 border-l border-white/5 pl-3">
            <div className="text-[9px] font-extrabold text-foregroundGrey/70 uppercase tracking-wider truncate">
              Deep {depth2 > 0 ? `(D${depth2})` : ""}
            </div>
            {lines2.length === 0 ? (
              <div className="text-[10px] text-foregroundGrey/40 italic py-1 animate-pulse">
                Analyzing...
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {lines2.slice(0, 3).map((line) => {
                  const evalText = formatEval(line.score);
                  const isWhiteAdvantage = !evalText.startsWith("-");
                  const scoreBg = isWhiteAdvantage
                    ? "bg-white/95 text-black font-bold shadow-sm"
                    : "bg-neutral-900/90 text-white border border-white/10 font-bold shadow-sm";

                  return (
                    <li
                      key={line.multipv}
                      className="flex flex-col gap-0.5 min-w-0 text-[11px] hover:bg-white/5 px-1.5 py-0.5 rounded transition-colors duration-150"
                    >
                      <div className="flex flex-row items-center gap-1.5">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-borderRoundness w-[32px] text-center shrink-0 font-bold ${scoreBg}`}
                        >
                          {evalText}
                        </span>
                        <span className="font-extrabold text-foregroundHighlighted truncate">
                          {line.sanMove}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
