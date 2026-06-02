"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ExplorerMove = {
  uci: string;
  san: string;
  white: number;
  black: number;
  draws: number;
  averageRating?: number;
};

type ExplorerGame = {
  id: string;
  winner: "white" | "black" | null;
  white: {
    name: string;
    rating: number;
  };
  black: {
    name: string;
    rating: number;
  };
  year: number;
};

type ExplorerResponse = {
  white: number;
  black: number;
  draws: number;
  moves: ExplorerMove[];
  topGames?: ExplorerGame[];
};

type Source = "lichess" | "masters";

const DEFAULT_SOURCE: Source = "lichess";

export default function OpeningExplorer(props: { fen?: string }) {
  const { fen } = props;

  const [source, setSource] = useState<Source>(DEFAULT_SOURCE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExplorerResponse | null>(null);

  // Personal Access Token State
  const [pat, setPat] = useState("");
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Filter States (only applicable when source is "lichess")
  const [selectedSpeeds, setSelectedSpeeds] = useState<string[]>([
    "bullet",
    "blitz",
    "rapid",
    "classical",
  ]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([
    1600, 1800, 2000, 2200, 2500,
  ]);

  const cacheRef = useRef<Map<string, ExplorerResponse>>(new Map());

  // Load token from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lichess_pat") || "";
      setPat(saved);
      setIsTokenLoaded(true);
    }
  }, []);

  function handleSaveToken(e: React.FormEvent) {
    e.preventDefault();
    const cleanToken = tempToken.trim();
    if (cleanToken) {
      localStorage.setItem("lichess_pat", cleanToken);
      setPat(cleanToken);
      setTempToken("");
      setShowSettings(false);
      if (error === "unauthorized") {
        setError(null);
      }
    }
  }

  function handleClearToken() {
    localStorage.removeItem("lichess_pat");
    setPat("");
    setTempToken("");
    setShowSettings(false);
    setData(null);
  }

  function toggleSpeed(speed: string) {
    setSelectedSpeeds((prev) => {
      const next = prev.includes(speed)
        ? prev.filter((s) => s !== speed)
        : [...prev, speed];
      return next.length > 0 ? next : prev;
    });
  }

  function toggleRating(rating: number) {
    setSelectedRatings((prev) => {
      const next = prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating];
      return next.length > 0 ? next : prev;
    });
  }

  const cacheKey = useMemo(() => {
    if (!fen || !isTokenLoaded) return null;
    const speedStr =
      source === "lichess" ? selectedSpeeds.slice().sort().join(",") : "";
    const ratingStr =
      source === "lichess" ? selectedRatings.slice().sort().join(",") : "";
    return `${source}:${speedStr}:${ratingStr}:${pat}:${fen}`;
  }, [source, selectedSpeeds, selectedRatings, pat, fen, isTokenLoaded]);

  useEffect(() => {
    if (!fen || !cacheKey || !isTokenLoaded) {
      setData(null);
      setError(null);
      return;
    }

    // If no token is configured, we immediately set the unauthorized error
    if (!pat) {
      setError("unauthorized");
      setData(null);
      return;
    }

    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setData(cached);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const headers: HeadersInit = {
          Authorization: `Bearer ${pat}`,
        };

        let url = `https://explorer.lichess.ovh/${source}?fen=${encodeURIComponent(fen || "")}`;
        if (source === "lichess") {
          if (selectedSpeeds.length) {
            url += `&speeds=${selectedSpeeds.join(",")}`;
          }
          if (selectedRatings.length) {
            url += `&ratings=${selectedRatings.join(",")}`;
          }
        }

        const response = await fetch(url, {
          headers,
          signal: controller.signal,
        });

        if (response.status === 401) {
          setError("unauthorized");
          setData(null);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json = (await response.json()) as ExplorerResponse;
        cacheRef.current.set(cacheKey!, json);
        setData(json);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setError("Failed to load opening explorer data.");
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [
    fen,
    cacheKey,
    source,
    pat,
    isTokenLoaded,
    selectedSpeeds,
    selectedRatings,
  ]);

  const totals = data ? data.white + data.black + data.draws : 0;
  const topMoves = data?.moves
    ? [...data.moves]
        .sort(
          (a, b) => b.white + b.black + b.draws - (a.white + a.black + a.draws),
        )
        .slice(0, 8)
    : [];

  function percent(value: number) {
    if (!totals) return "0%";
    return `${Math.round((value / totals) * 100)}%`;
  }

  if (!isTokenLoaded) {
    return (
      <div className="w-[85%] flex flex-col gap-2 bg-backgroundBoxBox/45 border border-white/5 backdrop-blur-md rounded-borderRoundness px-3 py-2">
        <div className="text-xs text-foregroundGrey/60 italic animate-pulse">Loading settings...</div>
      </div>
    );
  }

  const isUnauthorized = error === "unauthorized" || !pat;

  return (
    <div className="w-[85%] flex flex-col gap-2.5 bg-backgroundBoxBox/45 border border-white/5 backdrop-blur-md rounded-borderRoundness px-3 py-2.5 shadow-sm transition-all duration-300">
      <div className="flex flex-row items-center justify-between">
        <div className="font-extrabold text-foregroundHighlighted flex items-center gap-1.5 text-[11px]">
          <span>Opening Explorer</span>
          {pat && (
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              title="API Token Settings"
              className="text-[10px] text-foregroundGrey hover:text-foregroundHighlighted opacity-60 hover:opacity-100 transition-opacity cursor-pointer p-0 bg-transparent border-none"
            >
              ⚙️
            </button>
          )}
        </div>
        {!isUnauthorized && (
          <div className="flex flex-row gap-1.5 select-none shrink-0">
            <button
              type="button"
              onClick={() => setSource("lichess")}
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-borderRoundness transition-all duration-200 border cursor-pointer ${source === "lichess" ? "bg-backgroundBoxBoxHighlighted border-transparent text-foreground shadow-sm" : "bg-backgroundBoxBox/30 border-white/5 hover:bg-backgroundBoxBox/50 text-foregroundGrey hover:text-foregroundHighlighted"}`}
            >
              Lichess
            </button>
            <button
              type="button"
              onClick={() => setSource("masters")}
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-borderRoundness transition-all duration-200 border cursor-pointer ${source === "masters" ? "bg-backgroundBoxBoxHighlighted border-transparent text-foreground shadow-sm" : "bg-backgroundBoxBox/30 border-white/5 hover:bg-backgroundBoxBox/50 text-foregroundGrey hover:text-foregroundHighlighted"}`}
            >
              Masters
            </button>
          </div>
        )}
      </div>

      {/* Token Settings Expandable Panel */}
      {showSettings && pat && (
        <div className="flex flex-col gap-2 p-2.5 bg-black/20 rounded-borderRoundness border border-white/5 text-xs animate-fade-in">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-foregroundGrey/90">
              Lichess API Token:
            </span>
            <button
              type="button"
              onClick={handleClearToken}
              className="text-[9px] text-highlightMistake hover:text-highlightMiss hover:underline font-extrabold cursor-pointer bg-transparent border-none p-0"
            >
              Clear Token
            </button>
          </div>
          <form onSubmit={handleSaveToken} className="flex flex-row gap-2">
            <input
              type="password"
              placeholder="Enter new token (lip_...)"
              value={tempToken}
              onChange={(e) => setTempToken(e.target.value)}
              className="flex-grow text-xs bg-black/30 border border-white/5 hover:border-white/10 focus:border-white/20 rounded-borderRoundness px-2.5 py-1 text-foreground placeholder:text-foregroundGrey/45 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="text-xs font-extrabold px-3 py-1 rounded-borderRoundness bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover text-foreground transition-all duration-200 cursor-pointer border-none shadow-sm hover:shadow-shadowBoxBoxHighlighted"
            >
              Save
            </button>
          </form>
        </div>
      )}

      {/* Unauthorized UI */}
      {isUnauthorized ? (
        <div className="flex flex-col gap-2.5 py-1 text-xs">
          <p className="text-foregroundGrey/80 leading-relaxed text-[10px] font-medium">
            Lichess requires a Personal Access Token (PAT) to view Opening
            Explorer stats. It is free and quick to create.
          </p>
          <a
            href="https://lichess.org/account/oauth/token"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-highlightGreat hover:text-foregroundHighlighted hover:underline font-extrabold self-start cursor-pointer transition-colors"
          >
            Generate a free token on Lichess.org &rarr;
          </a>
          <form onSubmit={handleSaveToken} className="flex flex-row gap-2 mt-1">
            <input
              type="password"
              placeholder="Paste token here (lip_...)"
              value={tempToken}
              onChange={(e) => setTempToken(e.target.value)}
              className="flex-grow text-xs bg-black/30 border border-white/5 hover:border-white/10 focus:border-white/20 rounded-borderRoundness px-2.5 py-1 text-foreground placeholder:text-foregroundGrey/45 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="text-xs font-extrabold px-3 py-1 rounded-borderRoundness bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover text-foreground transition-all duration-200 cursor-pointer border-none shadow-sm hover:shadow-shadowBoxBoxHighlighted"
            >
              Save
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Filters UI - Only for Lichess source */}
          {source === "lichess" && !showSettings && (
            <div className="flex flex-col gap-1.5 text-[9px] text-foregroundGrey bg-black/10 p-2 rounded-borderRoundness border border-white/5 select-none shrink-0">
              <div className="flex flex-row items-center gap-1.5 flex-wrap">
                <span className="font-extrabold opacity-75">Speed:</span>
                {["bullet", "blitz", "rapid", "classical"].map((s) => {
                  const active = selectedSpeeds.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpeed(s)}
                      className={`px-1.5 py-0.5 rounded-borderRoundness font-bold transition-all duration-200 border cursor-pointer ${
                        active
                          ? "bg-highlightGreat/25 border-highlightGreat/30 text-highlightGreat shadow-sm"
                          : "bg-backgroundBoxBox/20 border-white/5 hover:bg-backgroundBoxBox/40 text-foregroundGrey/70 hover:text-foregroundHighlighted"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-row items-center gap-1.5 flex-wrap mt-0.5">
                <span className="font-extrabold opacity-75">Rating:</span>
                {[1600, 1800, 2000, 2200, 2500].map((r) => {
                  const active = selectedRatings.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRating(r)}
                      className={`px-1.5 py-0.5 rounded-borderRoundness font-bold transition-all duration-200 border cursor-pointer ${
                        active
                          ? "bg-highlightGreat/25 border-highlightGreat/30 text-highlightGreat shadow-sm"
                          : "bg-backgroundBoxBox/20 border-white/5 hover:bg-backgroundBoxBox/40 text-foregroundGrey/70 hover:text-foregroundHighlighted"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!fen ? (
            <div className="text-xs text-foregroundGrey/50 italic py-1 mt-1">
              No position loaded.
            </div>
          ) : null}
          {loading ? (
            <div className="text-xs text-foregroundGrey/50 py-2 italic font-medium animate-pulse mt-1">
              Loading opening stats...
            </div>
          ) : null}
          {error && error !== "unauthorized" ? (
            <div className="text-xs text-highlightMistake py-1 mt-1 font-semibold">{error}</div>
          ) : null}

          {data && !loading ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-row items-center justify-between text-[10px] text-foregroundGrey font-semibold px-0.5">
                <span>W: {percent(data.white)}</span>
                <span>D: {percent(data.draws)}</span>
                <span>B: {percent(data.black)}</span>
                <span className="text-foregroundHighlighted font-extrabold">Total: {totals}</span>
              </div>
              {topMoves.length ? (
                <ul className="flex flex-col gap-2">
                  {topMoves.map((move) => {
                    const total = move.white + move.black + move.draws;
                    const wPct = Math.max(1, Math.round((move.white / total) * 100));
                    const dPct = Math.max(1, Math.round((move.draws / total) * 100));
                    const bPct = Math.max(1, Math.round((move.black / total) * 100));

                    return (
                      <li key={move.uci} className="flex flex-col gap-1 hover:bg-white/5 p-1 rounded transition-colors duration-150">
                        <div className="flex flex-row justify-between text-xs items-center px-0.5">
                          <span className="font-extrabold text-foregroundHighlighted">
                            {move.san}
                          </span>
                          <span className="text-[10px] text-foregroundGrey/70 font-semibold">{total} games</span>
                        </div>
                        {/* Lichess/Chess.com standard segmented win rate bar */}
                        <div className="h-1.5 rounded-borderRoundness bg-backgroundBoxBox overflow-hidden flex flex-row shrink-0">
                          <div
                            title={`White Wins: ${wPct}%`}
                            className="h-full bg-white/80"
                            style={{ width: `${wPct}%` }}
                          />
                          <div
                            title={`Draws: ${dPct}%`}
                            className="h-full bg-neutral-500/70"
                            style={{ width: `${dPct}%` }}
                          />
                          <div
                            title={`Black Wins: ${bPct}%`}
                            className="h-full bg-neutral-900/90 border-l border-white/5"
                            style={{ width: `${bPct}%` }}
                          />
                        </div>
                        <div className="flex flex-row justify-between text-[8px] text-foregroundGrey/70 font-bold px-0.5">
                          <span>W {wPct}%</span>
                          <span>D {dPct}%</span>
                          <span>B {bPct}%</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-xs text-foregroundGrey/40 italic py-1">
                  No opening moves found.
                </div>
              )}

              {/* Top Games List */}
              {data.topGames && data.topGames.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-1.5 border-t border-white/5 pt-2">
                  <div className="text-[9px] font-extrabold text-foregroundGrey/70 uppercase tracking-wider px-0.5">
                    Top Games
                  </div>
                  <ul className="flex flex-col gap-1">
                    {data.topGames.slice(0, 3).map((game) => {
                      const resultLabel =
                        game.winner === "white"
                          ? "1-0"
                          : game.winner === "black"
                            ? "0-1"
                            : "½-½";
                      const resultColor =
                        game.winner === "white"
                          ? "text-black bg-white/90"
                          : game.winner === "black"
                            ? "text-white bg-neutral-900 border border-white/10"
                            : "text-foregroundGrey/90 bg-neutral-800/40";

                      return (
                        <li key={game.id}>
                          <a
                            href={`https://lichess.org/${game.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-row justify-between items-center text-[10px] px-2.5 py-1.5 rounded-borderRoundness bg-backgroundBoxBox/25 hover:bg-backgroundBoxBox/60 transition-all duration-150 border border-white/5 hover:border-white/10"
                          >
                            <div className="flex flex-col truncate pr-2">
                              <span className="text-foregroundHighlighted truncate font-bold">
                                {game.white.name} ({game.white.rating})
                              </span>
                              <span className="text-foregroundGrey/80 truncate text-[9px] font-medium mt-0.5">
                                vs {game.black.name} ({game.black.rating})
                              </span>
                            </div>
                            <div className="flex flex-row items-center gap-1.5 shrink-0">
                              <span className="text-[9px] text-foregroundGrey/60 font-semibold">
                                {game.year}
                              </span>
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-borderRoundness w-[32px] text-center ${resultColor}`}
                              >
                                {resultLabel}
                              </span>
                            </div>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
