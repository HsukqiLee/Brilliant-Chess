"use client";

import { useContext, useEffect, useState } from "react";
import { AnalyzeContext } from "@/context/analyze";
import { useAuth } from "@/context/auth";
import { apiUrl, getApiBaseUrl } from "@/lib/api";

interface GameMeta {
  id: number;
  event: string;
  date: string;
  result: string;
  whiteName: string;
  blackName: string;
  whiteElo: number;
  blackElo: number;
  whiteAccuracy: number;
  blackAccuracy: number;
  whiteCpl: number;
  blackCpl: number;
  createdAt: string;
}

interface AccuracyTrendPoint {
  date: string;
  whiteAccuracy: number;
  blackAccuracy: number;
}

interface Stats {
  totalGames: number;
  averageAccuracy: number;
  averageCpl: number;
  gamesByResult: Record<string, number>;
  accuracyTrend: AccuracyTrendPoint[];
}

export default function Library() {
  const analyzeContext = useContext(AnalyzeContext);
  const [, setData] = analyzeContext.data;
  const [, setPageState] = analyzeContext.pageState;
  const [, setTab] = analyzeContext.tab;

  const { user, loadingUser } = useAuth();

  const [games, setGames] = useState<GameMeta[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const backendUrl = getApiBaseUrl();

  const fetchData = async () => {
    if (!user || !backendUrl) return;
    try {
      setLoading(true);
      setError(null);
      const [gamesRes, statsRes] = await Promise.all([
        fetch(apiUrl("/games"), { credentials: "include" }),
        fetch(apiUrl("/stats"), { credentials: "include" }),
      ]);

      if (!gamesRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch library data from server");
      }

      const gamesData = await gamesRes.json();
      const statsData = await statsRes.json();

      setGames(gamesData);
      setStats(statsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading your library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLoadGame = async (id: number) => {
    if (!user || !backendUrl) return;
    try {
      setPageState("loading");
      const res = await fetch(apiUrl(`/games/${id}`), {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch game details");
      }
      const data = await res.json();
      if (data.pgn) {
        setData({ format: "pgn", string: data.pgn });
      } else {
        throw new Error("No PGN found for this game");
      }
    } catch (err: any) {
      console.error(err);
      setPageState("default");
      alert("Error loading game: " + err.message);
    }
  };

  const handleDeleteGame = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !backendUrl) return;
    if (
      !confirm("Are you sure you want to delete this game from your library?")
    ) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(apiUrl(`/games/${id}`), {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete game");
      }

      // Optimistically update games list and trigger refetch of stats
      setGames((prev) => prev.filter((g) => g.id !== id));

      // Refetch stats to keep everything updated
      const statsRes = await fetch(apiUrl("/stats"), {
        credentials: "include",
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete game: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Render beautiful SVG Sparkline/Trend Chart
  const renderTrendChart = () => {
    if (!stats || !stats.accuracyTrend || stats.accuracyTrend.length < 2) {
      return (
        <div className="h-28 flex items-center justify-center text-xs text-foregroundGrey/50 border border-dashed border-white/5 rounded-borderRoundness bg-backgroundBoxBox/20 italic font-medium">
          Analyze and save more games to see accuracy trend
        </div>
      );
    }

    const width = 380;
    const height = 110;
    const paddingLeft = 25;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 20;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const trend = stats.accuracyTrend;
    const maxIndex = trend.length - 1;

    // Helper to map index and value to SVG coordinates
    const getCoordinates = (index: number, accuracy: number) => {
      const x = paddingLeft + (index / maxIndex) * chartWidth;
      // Accuracy ranges from 0 to 100
      const y = paddingTop + (1 - accuracy / 100) * chartHeight;
      return { x, y };
    };

    let whitePath = "";
    let blackPath = "";

    trend.forEach((pt, idx) => {
      const whiteCoords = getCoordinates(idx, pt.whiteAccuracy);
      const blackCoords = getCoordinates(idx, pt.blackAccuracy);

      if (idx === 0) {
        whitePath = `M ${whiteCoords.x} ${whiteCoords.y}`;
        blackPath = `M ${blackCoords.x} ${blackCoords.y}`;
      } else {
        whitePath += ` L ${whiteCoords.x} ${whiteCoords.y}`;
        blackPath += ` L ${blackCoords.x} ${blackCoords.y}`;
      }
    });

    return (
      <div className="w-full bg-backgroundBoxBox/45 border border-white/5 backdrop-blur-md p-3 rounded-borderRoundness shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-extrabold text-foregroundGrey/90 uppercase tracking-wider">
            Accuracy Trend (Last {trend.length} games)
          </span>
          <div className="flex gap-3 text-[9px] font-bold text-foregroundGrey/70 select-none">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-highlightBrilliant inline-block"></span>{" "}
              White
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-highlightBest inline-block"></span>{" "}
              Black
            </span>
          </div>
        </div>
        <div className="relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Grid Lines */}
            {[25, 50, 75, 100].map((val) => {
              const y = paddingTop + (1 - val / 100) * chartHeight;
              return (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={paddingLeft - 5}
                    y={y + 3}
                    fill="var(--foregroundGrey)"
                    opacity="0.6"
                    fontSize="7"
                    textAnchor="end"
                    fontWeight="bold"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* White Path */}
            <path
              d={whitePath}
              fill="none"
              stroke="var(--highlightBrilliant)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Black Path */}
            <path
              d={blackPath}
              fill="none"
              stroke="var(--highlightBest)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Dots */}
            {trend.map((pt, idx) => {
              const whiteCoords = getCoordinates(idx, pt.whiteAccuracy);
              const blackCoords = getCoordinates(idx, pt.blackAccuracy);
              return (
                <g key={idx}>
                  <circle
                    cx={whiteCoords.x}
                    cy={whiteCoords.y}
                    r="2.5"
                    fill="var(--highlightBrilliant)"
                    stroke="#171717"
                    strokeWidth="1"
                  />
                  <circle
                    cx={blackCoords.x}
                    cy={blackCoords.y}
                    r="2.5"
                    fill="var(--highlightBest)"
                    stroke="#171717"
                    strokeWidth="1"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Render CTA if not logged in
  if (loadingUser) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-8 text-foregroundGrey/60 gap-2">
        <svg
          className="animate-spin h-8 w-8 text-foregroundGrey/40"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="text-xs font-semibold">Loading session...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-6 text-center text-foregroundGrey/90 gap-4 max-w-[360px] mx-auto select-none animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-backgroundBoxBox/45 border border-white/5 flex items-center justify-center text-foregroundGrey shadow-md select-none animate-pulse-subtle">
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            ></path>
          </svg>
        </div>
        <div>
          <h3 className="font-extrabold text-base text-foregroundHighlighted">
            Sign in to access your Library
          </h3>
          <p className="text-xs text-foregroundGrey/70 mt-2 leading-relaxed font-semibold">
            All your saved chess games, average centipawn loss trends, and
            accuracy summaries will be safely backed up and synced here.
          </p>
        </div>
        <button
          onClick={() => setTab("profile")}
          className="w-full text-xs font-extrabold py-2.5 rounded-borderRoundness bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover text-foreground transition-all duration-200 cursor-pointer text-center border-none shadow-sm hover:shadow-shadowBoxBoxHighlighted active:scale-[0.98]"
        >
          Go to Profile
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-8 text-foregroundGrey/60 gap-2">
        <svg
          className="animate-spin h-8 w-8 text-foregroundGrey/40"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="text-xs font-semibold">Loading personal library...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-8 text-center text-highlightBlunder gap-3">
        <svg
          className="w-12 h-12 text-highlightBlunder/80"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          ></path>
        </svg>
        <div>
          <h3 className="font-extrabold text-base text-foregroundHighlighted">
            Failed to Load Library
          </h3>
          <p className="text-xs text-foregroundGrey/70 mt-1.5 max-w-xs mx-auto font-semibold">
            {error}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-1.5 bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover border border-white/5 text-foregroundGrey hover:text-foregroundHighlighted text-xs font-bold rounded transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const winCount = stats?.gamesByResult["1-0"] || 0;
  const lossCount = stats?.gamesByResult["0-1"] || 0;
  const drawCount = stats?.gamesByResult["1/2-1/2"] || 0;

  return (
    <div className="flex flex-col gap-4 px-4 py-2 overflow-y-auto max-h-[calc(100vh-140px)] w-full animate-fade-in">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <div className="bg-backgroundBoxBox/45 border border-white/5 backdrop-blur-md p-2.5 rounded-borderRoundness flex flex-col justify-center items-center text-center shadow-sm">
          <span className="text-[9px] uppercase font-extrabold text-foregroundGrey/70 tracking-wider">
            Total Games
          </span>
          <span className="text-xl font-black text-foregroundHighlighted mt-1">
            {stats?.totalGames ?? 0}
          </span>
        </div>
        <div className="bg-backgroundBoxBox/45 border border-white/5 backdrop-blur-md p-2.5 rounded-borderRoundness flex flex-col justify-center items-center text-center shadow-sm">
          <span className="text-[9px] uppercase font-extrabold text-foregroundGrey/70 tracking-wider">
            Avg Accuracy
          </span>
          <span className="text-xl font-black text-highlightBest mt-1">
            {stats?.averageAccuracy ? stats.averageAccuracy.toFixed(1) : "0.0"}%
          </span>
        </div>
        <div className="bg-backgroundBoxBox/45 border border-white/5 backdrop-blur-md p-2.5 rounded-borderRoundness flex flex-col justify-center items-center text-center shadow-sm">
          <span className="text-[9px] uppercase font-extrabold text-foregroundGrey/70 tracking-wider">
            Avg CPL
          </span>
          <span className="text-xl font-black text-highlightGreat mt-1">
            {stats?.averageCpl ? stats.averageCpl.toFixed(0) : "0"}
          </span>
        </div>
      </div>

      {/* W/L Record Bar */}
      {games.length > 0 && (
        <div className="bg-backgroundBoxBox/45 border border-white/5 backdrop-blur-md p-3 rounded-borderRoundness flex flex-col gap-2 shadow-sm shrink-0">
          <div className="flex justify-between text-[11px] font-extrabold text-foregroundGrey/90">
            <span>Record (W - D - L)</span>
            <span className="text-foregroundHighlighted">
              {winCount}W - {drawCount}D - {lossCount}L
            </span>
          </div>
          <div className="w-full h-1.5 rounded-borderRoundness overflow-hidden bg-backgroundBoxBox/40 flex shrink-0 border border-white/5">
            <div
              style={{ width: `${(winCount / games.length) * 100}%` }}
              className="bg-highlightBest h-full"
              title={`Wins: ${winCount}`}
            />
            <div
              style={{ width: `${(drawCount / games.length) * 100}%` }}
              className="bg-neutral-500/70 h-full"
              title={`Draws: ${drawCount}`}
            />
            <div
              style={{ width: `${(lossCount / games.length) * 100}%` }}
              className="bg-highlightBlunder h-full border-l border-white/5"
              title={`Losses: ${lossCount}`}
            />
          </div>
        </div>
      )}

      {/* Accuracy Trend SVG Sparkline */}
      {renderTrendChart()}

      {/* Saved Games List */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-extrabold text-foregroundGrey/90 uppercase tracking-wider mb-1 px-0.5">
          Archived Games ({games.length})
        </span>
        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-borderExtraRoundness bg-backgroundBoxBox/20 text-center text-foregroundGrey/50 gap-2">
            <svg
              className="w-8 h-8 text-foregroundGrey/45"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              ></path>
            </svg>
            <span className="text-xs font-semibold">
              No saved games in your database yet.
            </span>
            <p className="text-[10px] text-foregroundGrey/40 max-w-[200px] leading-normal font-semibold">
              Import a PGN or FEN, analyze it, and click &quot;Save to Library&quot; inside the Summary tab.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {games.map((game) => {
              const isWhiteWinner = game.result === "1-0";
              const isBlackWinner = game.result === "0-1";

              return (
                <div
                  key={game.id}
                  onClick={() => handleLoadGame(game.id)}
                  className="group bg-backgroundBoxBox/20 hover:bg-backgroundBoxBox/45 border border-white/5 hover:border-white/10 p-3 rounded-borderRoundness transition-all duration-150 cursor-pointer flex flex-col gap-2 relative overflow-hidden shadow-sm"
                >
                  {/* Top metadata */}
                  <div className="flex justify-between items-center text-[9px] text-foregroundGrey/60 font-semibold px-0.5">
                    <span className="text-foregroundGrey/80 max-w-[180px] truncate font-extrabold">
                      {game.event}
                    </span>
                    <span>{game.date}</span>
                  </div>

                  {/* Player Rows & Stats */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1.5 w-[70%]">
                      {/* White Player */}
                      <div className="flex items-center gap-1.5 select-none">
                        <span className="w-2.5 h-2.5 bg-white border border-neutral-600 rounded-sm shrink-0"></span>
                        <span
                          className={`text-xs font-extrabold truncate max-w-[130px] ${isWhiteWinner ? "text-foregroundHighlighted" : "text-foregroundGrey"}`}
                        >
                          {game.whiteName}
                        </span>
                        {game.whiteElo > 0 && (
                          <span className="text-[9px] text-foregroundGrey/50 font-bold ml-1">
                            ({game.whiteElo})
                          </span>
                        )}
                        {isWhiteWinner && (
                          <span className="text-[8px] px-1 bg-highlightBest/20 text-highlightBest border border-highlightBest/30 rounded font-extrabold scale-90 origin-left ml-1.5 shadow-sm">
                            WIN
                          </span>
                        )}
                      </div>
                      {/* Black Player */}
                      <div className="flex items-center gap-1.5 select-none">
                        <span className="w-2.5 h-2.5 bg-neutral-900 border border-neutral-700 rounded-sm shrink-0"></span>
                        <span
                          className={`text-xs font-extrabold truncate max-w-[130px] ${isBlackWinner ? "text-foregroundHighlighted" : "text-foregroundGrey"}`}
                        >
                          {game.blackName}
                        </span>
                        {game.blackElo > 0 && (
                          <span className="text-[9px] text-foregroundGrey/50 font-bold ml-1">
                            ({game.blackElo})
                          </span>
                        )}
                        {isBlackWinner && (
                          <span className="text-[8px] px-1 bg-highlightBest/20 text-highlightBest border border-highlightBest/30 rounded font-extrabold scale-90 origin-left ml-1.5 shadow-sm">
                            WIN
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Accuracies */}
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end gap-1 select-none">
                        <span className="text-[10px] font-black text-foregroundHighlighted bg-black/20 border border-white/5 px-1.5 py-0.5 rounded">
                          {game.whiteAccuracy.toFixed(1)}%
                        </span>
                        <span className="text-[10px] font-black text-foregroundHighlighted bg-black/20 border border-white/5 px-1.5 py-0.5 rounded">
                          {game.blackAccuracy.toFixed(1)}%
                        </span>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteGame(game.id, e)}
                        disabled={deletingId === game.id}
                        className="p-1.5 text-foregroundGrey/60 hover:text-highlightBlunder hover:bg-white/5 transition-all duration-150 rounded outline-none select-none md:opacity-0 md:group-hover:opacity-100 border border-transparent hover:border-white/5 cursor-pointer shrink-0"
                        title="Delete game from library"
                      >
                        {deletingId === game.id ? (
                          <svg
                            className="animate-spin h-3.5 w-3.5 text-highlightBlunder"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
