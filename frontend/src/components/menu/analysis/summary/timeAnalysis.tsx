"use client";

import { useContext, useEffect, useState, useRef } from "react";
import { AnalyzeContext } from "@/context/analyze";
import { move } from "@/engine/stockfish";

interface HistoryPoint {
  ply: number;
  san: string;
  clk: number;
  spent: number;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${seconds.toFixed(1)}s`;
}

export default function TimeAnalysis(props: { moves: move[] }) {
  const { moves } = props;
  const analyzeContext = useContext(AnalyzeContext);
  const [data] = analyzeContext.data;

  const [chartMode, setChartMode] = useState<"remaining" | "spent">(
    "remaining",
  );
  const [hoveredPoint, setHoveredPoint] = useState<{
    white?: HistoryPoint;
    black?: HistoryPoint;
    ply: number;
  } | null>(null);
  const [width, setWidth] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle container resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(Math.max(entry.contentRect.width, 280));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 1. Check if we have clock information
  const movesWithClk = moves.filter(
    (m) => m.clk !== undefined && m.clk !== null,
  );
  if (movesWithClk.length < 2) {
    return null; // Hide component if no clock comments are present
  }

  // 2. Parse TimeControl header to get base time and increment
  let baseTime = 300;
  let increment = 0;
  if (data.format === "pgn" && data.string) {
    const tcMatch = data.string.match(/\[TimeControl\s+"([^"]+)"\]/);
    if (tcMatch) {
      const tcParts = tcMatch[1].split("+");
      const parsedBase = parseInt(tcParts[0], 10);
      if (!isNaN(parsedBase)) {
        baseTime = parsedBase;
      }
      if (tcParts.length > 1) {
        const parsedInc = parseInt(tcParts[1], 10);
        if (!isNaN(parsedInc)) {
          increment = parsedInc;
        }
      }
    }
  }

  // If baseTime seems unrealistic or missing, estimate from the initial moves
  const firstWhiteMove = moves.find(
    (m) => m.color === "b" && m.clk !== undefined && m.clk !== null,
  ); // White's move has color 'b' (next turn is Black)
  const firstBlackMove = moves.find(
    (m) => m.color === "w" && m.clk !== undefined && m.clk !== null,
  ); // Black's move has color 'w'
  if (firstWhiteMove?.clk && firstWhiteMove.clk > baseTime) {
    baseTime = Math.ceil(firstWhiteMove.clk / 60) * 60;
  }

  // 3. Process clock history and spent time
  const whiteHistory: HistoryPoint[] = [];
  const blackHistory: HistoryPoint[] = [];
  let lastWhiteClk = baseTime;
  let lastBlackClk = baseTime;

  for (let i = 1; i < moves.length; i++) {
    const m = moves[i];
    if (m.clk === undefined || m.clk === null) continue;

    // In the moves list, m.color represents who played the move
    // color === 'b' means White played the move (and now it is Black's turn)
    // color === 'w' means Black played the move
    if (m.color === "b") {
      const spent = Math.max(0, lastWhiteClk - m.clk + increment);
      whiteHistory.push({
        ply: i,
        san: m.san ?? "",
        clk: m.clk,
        spent,
      });
      lastWhiteClk = m.clk;
    } else {
      const spent = Math.max(0, lastBlackClk - m.clk + increment);
      blackHistory.push({
        ply: i,
        san: m.san ?? "",
        clk: m.clk,
        spent,
      });
      lastBlackClk = m.clk;
    }
  }

  if (whiteHistory.length === 0 && blackHistory.length === 0) {
    return null;
  }

  // 4. Calculate Stats
  const whiteSpentTimes = whiteHistory.map((h) => h.spent);
  const blackSpentTimes = blackHistory.map((h) => h.spent);

  const whiteAvg = whiteSpentTimes.length
    ? whiteSpentTimes.reduce((a, b) => a + b, 0) / whiteSpentTimes.length
    : 0;
  const blackAvg = blackSpentTimes.length
    ? blackSpentTimes.reduce((a, b) => a + b, 0) / blackSpentTimes.length
    : 0;

  let whitePeak: HistoryPoint | null = null;
  let blackPeak: HistoryPoint | null = null;
  whiteHistory.forEach((h) => {
    if (!whitePeak || h.spent > whitePeak.spent) whitePeak = h;
  });
  blackHistory.forEach((h) => {
    if (!blackPeak || h.spent > blackPeak.spent) blackPeak = h;
  });

  const whiteTimeTrouble = whiteHistory.filter((h) => h.clk < 30).length;
  const blackTimeTrouble = blackHistory.filter((h) => h.clk < 30).length;

  // 5. Chart dimensions & mapping
  const height = 120;
  const paddingX = 15;
  const paddingY = 10;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const maxPly = moves.length - 1;

  // Clock remaining bounds
  const maxClkVal = Math.max(
    baseTime,
    ...whiteHistory.map((h) => h.clk),
    ...blackHistory.map((h) => h.clk),
  );
  const minClkVal = Math.min(
    ...whiteHistory.map((h) => h.clk),
    ...blackHistory.map((h) => h.clk),
    0,
  );
  const clkRange = maxClkVal - minClkVal || 1;

  // Time spent bounds
  const maxSpentVal = Math.max(...whiteSpentTimes, ...blackSpentTimes, 5);
  const spentRange = maxSpentVal || 1;

  // Mapping helpers
  const getX = (ply: number) => {
    return paddingX + (ply / maxPly) * chartW;
  };

  const getYRemaining = (clk: number) => {
    return paddingY + chartH - ((clk - minClkVal) / clkRange) * chartH;
  };

  const getYSpent = (spent: number) => {
    return paddingY + chartH - (spent / spentRange) * chartH;
  };

  // Build SVG paths
  const buildRemainingPath = (history: HistoryPoint[]) => {
    if (history.length === 0) return "";
    let d = `M ${getX(history[0].ply)} ${getYRemaining(history[0].clk)}`;
    for (let i = 1; i < history.length; i++) {
      d += ` L ${getX(history[i].ply)} ${getYRemaining(history[i].clk)}`;
    }
    return d;
  };

  const buildSpentPath = (history: HistoryPoint[]) => {
    if (history.length === 0) return "";
    let d = `M ${getX(history[0].ply)} ${getYSpent(history[0].spent)}`;
    for (let i = 1; i < history.length; i++) {
      d += ` L ${getX(history[i].ply)} ${getYSpent(history[i].spent)}`;
    }
    return d;
  };

  const whitePath =
    chartMode === "remaining"
      ? buildRemainingPath(whiteHistory)
      : buildSpentPath(whiteHistory);
  const blackPath =
    chartMode === "remaining"
      ? buildRemainingPath(blackHistory)
      : buildSpentPath(blackHistory);

  // Handle mouse move on SVG for tooltips
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left - paddingX;
    const pct = Math.min(Math.max(mouseX / chartW, 0), 1);
    const targetPly = Math.round(pct * maxPly);

    // Find closest points
    let closestWhite: HistoryPoint | undefined;
    let closestBlack: HistoryPoint | undefined;

    whiteHistory.forEach((h) => {
      if (
        !closestWhite ||
        Math.abs(h.ply - targetPly) < Math.abs(closestWhite.ply - targetPly)
      ) {
        closestWhite = h;
      }
    });

    blackHistory.forEach((h) => {
      if (
        !closestBlack ||
        Math.abs(h.ply - targetPly) < Math.abs(closestBlack.ply - targetPly)
      ) {
        closestBlack = h;
      }
    });

    const activePly =
      closestWhite && closestBlack
        ? Math.abs(closestWhite.ply - targetPly) <
          Math.abs(closestBlack.ply - targetPly)
          ? closestWhite.ply
          : closestBlack.ply
        : (closestWhite?.ply ?? closestBlack?.ply ?? 0);

    setHoveredPoint({
      white: whiteHistory.find((h) => h.ply === activePly),
      black: blackHistory.find((h) => h.ply === activePly),
      ply: activePly,
    });
  };

  // Grid lines for remaining time (ticks every 1 min or 5 mins)
  const yGridLines = () => {
    const lines = [];
    const step = clkRange > 600 ? 300 : clkRange > 300 ? 120 : 60; // 5min, 2min, or 1min
    const start = Math.ceil(minClkVal / step) * step;
    for (let v = start; v <= maxClkVal; v += step) {
      lines.push(v);
    }
    return lines;
  };

  return (
    <div
      ref={containerRef}
      className="w-[85%] flex flex-col gap-3 bg-backgroundBoxDarker rounded-borderRoundness px-3 py-2 border border-neutral-750"
    >
      <div className="flex flex-row items-center justify-between text-xs font-bold text-foregroundGrey">
        <span className="flex items-center gap-1.5 font-extrabold text-foreground">
          ⏱️ Time Management
        </span>
        <div className="flex bg-backgroundBoxBox rounded-borderRoundness p-0.5 border border-neutral-800">
          <button
            type="button"
            onClick={() => setChartMode("remaining")}
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-borderRoundness transition-colors cursor-pointer ${chartMode === "remaining" ? "bg-neutral-200 text-neutral-900" : "text-foregroundGrey hover:text-foreground"}`}
          >
            Clock
          </button>
          <button
            type="button"
            onClick={() => setChartMode("spent")}
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-borderRoundness transition-colors cursor-pointer ${chartMode === "spent" ? "bg-neutral-200 text-neutral-900" : "text-foregroundGrey hover:text-foreground"}`}
          >
            Spent
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative select-none">
        <svg
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
          className="overflow-visible"
        >
          {/* Background Grid */}
          {chartMode === "remaining"
            ? yGridLines().map((clk) => {
                const y = getYRemaining(clk);
                return (
                  <g key={clk} className="opacity-10">
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="white"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingX - 4}
                      y={y + 3}
                      fill="white"
                      fontSize={7}
                      textAnchor="end"
                    >
                      {Math.floor(clk / 60)}m
                    </text>
                  </g>
                );
              })
            : [0, maxSpentVal / 2, maxSpentVal].map((spent, idx) => {
                const y = getYSpent(spent);
                return (
                  <g key={idx} className="opacity-10">
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="white"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingX - 4}
                      y={y + 3}
                      fill="white"
                      fontSize={7}
                      textAnchor="end"
                    >
                      {spent.toFixed(0)}s
                    </text>
                  </g>
                );
              })}

          {/* Left/Right Axis Borders */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={paddingX}
            y2={height - paddingY}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
          <line
            x1={width - paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />

          {/* Chart lines */}
          {whitePath && (
            <path
              d={whitePath}
              fill="none"
              stroke="var(--foregroundProfileWhite)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {blackPath && (
            <path
              d={blackPath}
              fill="none"
              stroke="#22c55e"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover vertical line and tooltips */}
          {hoveredPoint && (
            <>
              <line
                x1={getX(hoveredPoint.ply)}
                y1={paddingY}
                x2={getX(hoveredPoint.ply)}
                y2={height - paddingY}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
              {hoveredPoint.white && (
                <circle
                  cx={getX(hoveredPoint.white.ply)}
                  cy={
                    chartMode === "remaining"
                      ? getYRemaining(hoveredPoint.white.clk)
                      : getYSpent(hoveredPoint.white.spent)
                  }
                  r={4}
                  fill="var(--foregroundProfileWhite)"
                  stroke="black"
                  strokeWidth={1}
                />
              )}
              {hoveredPoint.black && (
                <circle
                  cx={getX(hoveredPoint.black.ply)}
                  cy={
                    chartMode === "remaining"
                      ? getYRemaining(hoveredPoint.black.clk)
                      : getYSpent(hoveredPoint.black.spent)
                  }
                  r={4}
                  fill="#22c55e"
                  stroke="black"
                  strokeWidth={1}
                />
              )}
            </>
          )}
        </svg>

        {/* Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-1 right-2 bg-neutral-900/95 border border-neutral-750 rounded-borderRoundness p-1.5 text-[9px] leading-tight flex flex-col gap-0.5 shadow-lg pointer-events-none z-10 text-foreground">
            <div className="font-bold border-b border-neutral-800 pb-0.5 mb-0.5 text-center">
              Move {Math.ceil(hoveredPoint.ply / 2)}
            </div>
            {hoveredPoint.white && (
              <div className="flex gap-2 items-center justify-between text-neutral-300">
                <span>⚪ White ({hoveredPoint.white.san})</span>
                <span className="font-mono">
                  {chartMode === "remaining"
                    ? formatDuration(hoveredPoint.white.clk)
                    : `+${hoveredPoint.white.spent.toFixed(1)}s`}
                </span>
              </div>
            )}
            {hoveredPoint.black && (
              <div className="flex gap-2 items-center justify-between text-neutral-300">
                <span>🟢 Black ({hoveredPoint.black.san})</span>
                <span className="font-mono text-green-400">
                  {chartMode === "remaining"
                    ? formatDuration(hoveredPoint.black.clk)
                    : `+${hoveredPoint.black.spent.toFixed(1)}s`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2 mt-1 border-t border-neutral-750 pt-2.5">
        {/* Average Move Time */}
        <div className="flex flex-col items-center text-center p-1 bg-backgroundBoxBox/20 rounded-borderRoundness border border-neutral-800/40">
          <span className="text-[8px] text-foregroundGrey uppercase tracking-wider font-extrabold">
            Avg Move
          </span>
          <div className="flex flex-col gap-0.5 mt-1 font-mono text-[10px] font-bold">
            <span className="text-neutral-200">⚪ {whiteAvg.toFixed(1)}s</span>
            <span className="text-green-400">🟢 {blackAvg.toFixed(1)}s</span>
          </div>
        </div>

        {/* Peak Thought Time */}
        <div className="flex flex-col items-center text-center p-1 bg-backgroundBoxBox/20 rounded-borderRoundness border border-neutral-800/40">
          <span className="text-[8px] text-foregroundGrey uppercase tracking-wider font-extrabold">
            Peak Think
          </span>
          <div className="flex flex-col gap-0.5 mt-1 text-[9px] font-bold">
            <span className="text-neutral-200 truncate max-w-[70px]">
              ⚪{" "}
              {whitePeak
                ? `${(whitePeak as HistoryPoint).spent.toFixed(0)}s`
                : "-"}
            </span>
            <span className="text-green-400 truncate max-w-[70px]">
              🟢{" "}
              {blackPeak
                ? `${(blackPeak as HistoryPoint).spent.toFixed(0)}s`
                : "-"}
            </span>
          </div>
        </div>

        {/* Time Trouble Moves */}
        <div className="flex flex-col items-center text-center p-1 bg-backgroundBoxBox/20 rounded-borderRoundness border border-neutral-800/40">
          <span className="text-[8px] text-foregroundGrey uppercase tracking-wider font-extrabold">
            Time Trouble
          </span>
          <div className="flex flex-col gap-0.5 mt-1 font-mono text-[10px] font-bold">
            <span className="text-neutral-200">⚪ {whiteTimeTrouble}</span>
            <span className="text-green-400">🟢 {blackTimeTrouble}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
