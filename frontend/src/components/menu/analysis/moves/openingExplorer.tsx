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
      <div className="w-[85%] flex flex-col gap-2 bg-backgroundBoxDarker rounded-borderRoundness px-3 py-2">
        <div className="text-xs text-foregroundGrey">Loading settings...</div>
      </div>
    );
  }

  const isUnauthorized = error === "unauthorized" || !pat;

  return (
    <div className="w-[85%] flex flex-col gap-2 bg-backgroundBoxDarker rounded-borderRoundness px-3 py-2">
      <div className="flex flex-row items-center justify-between">
        <div className="font-extrabold text-foregroundGrey flex items-center gap-1.5">
          <span>Opening Explorer</span>
          {pat && (
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              title="API Token Settings"
              className="text-[10px] text-foregroundGrey hover:text-foreground opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              ⚙️
            </button>
          )}
        </div>
        {!isUnauthorized && (
          <div className="flex flex-row gap-2">
            <button
              type="button"
              onClick={() => setSource("lichess")}
              className={`text-xs font-bold px-2 py-1 rounded-borderRoundness transition-colors ${source === "lichess" ? "bg-backgroundBoxBox text-foreground" : "text-foregroundGrey hover:bg-backgroundBoxBox"}`}
            >
              Lichess
            </button>
            <button
              type="button"
              onClick={() => setSource("masters")}
              className={`text-xs font-bold px-2 py-1 rounded-borderRoundness transition-colors ${source === "masters" ? "bg-backgroundBoxBox text-foreground" : "text-foregroundGrey hover:bg-backgroundBoxBox"}`}
            >
              Masters
            </button>
          </div>
        )}
      </div>

      {/* Token Settings Expandable Panel */}
      {showSettings && pat && (
        <div className="flex flex-col gap-1.5 p-2 bg-backgroundBoxBox/40 rounded-borderRoundness border border-neutral-750 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-foregroundGrey">
              Lichess API Token:
            </span>
            <button
              type="button"
              onClick={handleClearToken}
              className="text-[10px] text-highlightMistake hover:underline font-bold cursor-pointer"
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
              className="flex-grow text-xs bg-backgroundBoxBox border border-neutral-700 rounded-borderRoundness px-2 py-1 text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500"
            />
            <button
              type="submit"
              className="text-xs font-bold px-3 py-1 rounded-borderRoundness bg-highlightGreat text-white hover:bg-highlightGreat/95 transition-colors cursor-pointer"
            >
              Save
            </button>
          </form>
        </div>
      )}

      {/* Unauthorized UI */}
      {isUnauthorized ? (
        <div className="flex flex-col gap-2.5 py-1 text-xs">
          <p className="text-foregroundGrey leading-relaxed text-[11px]">
            Lichess now requires a Personal Access Token (PAT) to view Opening
            Explorer stats. It is free and quick to create.
          </p>
          <a
            href="https://lichess.org/account/oauth/token"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-highlightGreat hover:underline font-bold self-start cursor-pointer"
          >
            Generate a free token on Lichess.org &rarr;
          </a>
          <form onSubmit={handleSaveToken} className="flex flex-row gap-2 mt-1">
            <input
              type="password"
              placeholder="Paste token here (lip_...)"
              value={tempToken}
              onChange={(e) => setTempToken(e.target.value)}
              className="flex-grow text-xs bg-backgroundBoxBox border border-neutral-700 rounded-borderRoundness px-2 py-1 text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500"
            />
            <button
              type="submit"
              className="text-xs font-bold px-3 py-1 rounded-borderRoundness bg-highlightGreat text-white hover:bg-highlightGreat/95 transition-colors cursor-pointer"
            >
              Save
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Filters UI - Only for Lichess source */}
          {source === "lichess" && !showSettings && (
            <div className="flex flex-col gap-1.5 text-[10px] text-foregroundGrey bg-backgroundBoxBox/25 p-1.5 rounded-borderRoundness border border-neutral-800/40">
              <div className="flex flex-row items-center gap-1.5 flex-wrap">
                <span className="font-semibold opacity-70">Speed:</span>
                {["bullet", "blitz", "rapid", "classical"].map((s) => {
                  const active = selectedSpeeds.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpeed(s)}
                      className={`px-1.5 py-0.5 rounded-borderRoundness font-medium transition-colors cursor-pointer ${
                        active
                          ? "bg-highlightGreat/25 text-highlightGreat border border-highlightGreat/40"
                          : "bg-backgroundBoxBox/50 hover:bg-backgroundBoxBox border border-transparent"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-row items-center gap-1.5 flex-wrap">
                <span className="font-semibold opacity-70">Rating:</span>
                {[1600, 1800, 2000, 2200, 2500].map((r) => {
                  const active = selectedRatings.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRating(r)}
                      className={`px-1.5 py-0.5 rounded-borderRoundness font-medium transition-colors cursor-pointer ${
                        active
                          ? "bg-highlightGreat/25 text-highlightGreat border border-highlightGreat/40"
                          : "bg-backgroundBoxBox/50 hover:bg-backgroundBoxBox border border-transparent"
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
            <div className="text-xs text-foregroundGrey mt-1">
              No position loaded.
            </div>
          ) : null}
          {loading ? (
            <div className="text-xs text-foregroundGrey mt-1">
              Loading opening stats...
            </div>
          ) : null}
          {error && error !== "unauthorized" ? (
            <div className="text-xs text-highlightMistake mt-1">{error}</div>
          ) : null}

          {data && !loading ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center justify-between text-xs text-foregroundGrey">
                <span>White: {percent(data.white)}</span>
                <span>Draw: {percent(data.draws)}</span>
                <span>Black: {percent(data.black)}</span>
                <span>Total: {totals}</span>
              </div>
              {topMoves.length ? (
                <ul className="flex flex-col gap-1">
                  {topMoves.map((move) => {
                    const total = move.white + move.black + move.draws;
                    const width = totals
                      ? Math.round((total / totals) * 100)
                      : 0;

                    return (
                      <li key={move.uci} className="flex flex-col gap-1">
                        <div className="flex flex-row justify-between text-xs">
                          <span className="font-extrabold text-foreground">
                            {move.san}
                          </span>
                          <span className="text-foregroundGrey">{total}</span>
                        </div>
                        <div className="h-2 rounded-borderRoundness bg-backgroundBoxBox">
                          <div
                            className="h-2 rounded-borderRoundness bg-highlightGreat"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <div className="flex flex-row justify-between text-[10px] text-foregroundGrey">
                          <span>
                            W {Math.round((move.white / total) * 100)}%
                          </span>
                          <span>
                            D {Math.round((move.draws / total) * 100)}%
                          </span>
                          <span>
                            B {Math.round((move.black / total) * 100)}%
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-xs text-foregroundGrey">
                  No opening moves found.
                </div>
              )}

              {/* Top Games List */}
              {data.topGames && data.topGames.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2 border-t border-neutral-700/40 pt-2">
                  <div className="text-[10px] font-bold text-foregroundGrey uppercase tracking-wider">
                    Top Games
                  </div>
                  <ul className="flex flex-col gap-1">
                    {data.topGames.slice(0, 4).map((game) => {
                      const resultLabel =
                        game.winner === "white"
                          ? "1-0"
                          : game.winner === "black"
                            ? "0-1"
                            : "½-½";
                      const resultColor =
                        game.winner === "white"
                          ? "text-neutral-200 bg-neutral-800/80 border border-neutral-700/30"
                          : game.winner === "black"
                            ? "text-neutral-900 bg-neutral-100"
                            : "text-foregroundGrey bg-neutral-750/30";

                      return (
                        <li key={game.id}>
                          <a
                            href={`https://lichess.org/${game.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-row justify-between items-center text-[11px] px-2 py-1.5 rounded-borderRoundness bg-backgroundBoxBox/40 hover:bg-backgroundBoxBox/80 transition-colors border border-neutral-800/20"
                          >
                            <div className="flex flex-col truncate pr-2">
                              <span className="text-foreground truncate font-medium">
                                {game.white.name} ({game.white.rating})
                              </span>
                              <span className="text-foregroundGrey truncate text-[10px]">
                                vs {game.black.name} ({game.black.rating})
                              </span>
                            </div>
                            <div className="flex flex-row items-center gap-1.5 shrink-0">
                              <span className="text-[10px] text-foregroundGrey opacity-80">
                                {game.year}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-borderRoundness ${resultColor}`}
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
