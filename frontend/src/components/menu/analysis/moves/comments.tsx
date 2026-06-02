"use client";

import { useState, useEffect } from "react";
import RatingSVG from "@/components/svg/rating";
import { moveRating } from "@/engine/stockfish";
import { apiUrl, getApiBaseUrl } from "@/lib/api";

const RATING_FORMATS_GUIDE = {
  _isA_Move: "is a _ move",
  _isAn_Move: "is an _ move",
  _is_: "is _",
  _isAn_: "is an _",
  _isA_: "is a _",
};

const RATING_FORMATS = {
  book: RATING_FORMATS_GUIDE._isA_Move,
  forced: RATING_FORMATS_GUIDE._is_,
  brilliant: RATING_FORMATS_GUIDE._is_,
  great: RATING_FORMATS_GUIDE._isA_Move,
  best: RATING_FORMATS_GUIDE._is_,
  excellent: RATING_FORMATS_GUIDE._is_,
  good: RATING_FORMATS_GUIDE._is_,
  inaccuracy: RATING_FORMATS_GUIDE._isAn_,
  mistake: RATING_FORMATS_GUIDE._isA_,
  miss: RATING_FORMATS_GUIDE._isA_,
  blunder: RATING_FORMATS_GUIDE._isA_,
};

export function FormatEval(props: {
  evaluation: string[];
  white: boolean;
  smaller?: boolean;
  best?: boolean;
}) {
  const { evaluation, white, smaller, best } = props;

  const number = (Number(evaluation[1]) / 100) * (white ? 1 : -1);

  let prevChar = "";
  if (number > 0) prevChar = "+";
  if (number < 0) prevChar = "-";

  return (
    <div
      style={{
        fontSize: smaller ? "14px" : "",
        padding: smaller ? "2px" : "",
        width: smaller ? "46px" : "",
        backgroundColor:
          prevChar === "-"
            ? "var(--evaluationBarBlack)"
            : "var(--evaluationBarWhite)",
        color:
          prevChar === "-" ? "var(--foreground)" : "var(--foregroundBlack)",
        filter: prevChar === "-" ? "" : "brightness(0.9)",
      }}
      className="rounded-borderRoundness py-1 font-extrabold w-[61px] text-center shrink-0"
    >
      {(() => {
        if (evaluation[0] === "mate" && evaluation[1]) {
          return (
            prevChar +
            "M" +
            (Math.abs(Number(evaluation[1])) - Number(Boolean(best)))
          );
        } else if (!evaluation[1]) {
          if (white) return "0-1";
          else return "1-0";
        } else {
          return prevChar + Math.abs(number).toFixed(2);
        }
      })()}
    </div>
  );
}

interface CommentsProps {
  comment?: string;
  rating?: moveRating;
  moveSan?: string;
  evaluation: string[];
  white: boolean;
  overallGameComment: string;
  fen?: string;
  bestMove?: string;
  evalBefore?: string[];
  evalAfter?: string[];
}

export default function Comments(props: CommentsProps) {
  const {
    comment,
    rating,
    moveSan,
    evaluation,
    white,
    overallGameComment,
    fen,
    bestMove,
    evalBefore,
    evalAfter,
  } = props;

  const [aiComment, setAiComment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiCache, setAiCache] = useState<Record<string, string>>({});

  const backendUrl = getApiBaseUrl();
  const isBackendEnabled = Boolean(backendUrl);

  // Reset or load cached AI comment when FEN changes
  useEffect(() => {
    if (fen) {
      if (aiCache[fen]) {
        setAiComment(aiCache[fen]);
      } else {
        setAiComment(null);
      }
      setError(null);
    }
  }, [fen, aiCache]);

  const fetchAiComment = async () => {
    if (!fen || !isBackendEnabled) return;
    setLoading(true);
    setError(null);

    const formatEvalString = (ev: string[] | undefined) => {
      if (!ev || ev.length < 2) return "0.00";
      if (ev[0] === "mate") return `M${ev[1]}`;
      const num = Number(ev[1]) / 100;
      return num >= 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
    };

    try {
      const response = await fetch(apiUrl("/ai/commentary"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fen,
          move: moveSan,
          evalBefore: formatEvalString(evalBefore),
          evalAfter: formatEvalString(evalAfter),
          bestMove: bestMove ?? "None",
          rating: rating ?? "good",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      const text = json.commentary;
      setAiComment(text);
      setAiCache((prev) => ({ ...prev, [fen]: text }));
    } catch (err: any) {
      setError("Failed to fetch AI Coach review. Please try again.");
      console.error("AI Coach error:", err);
    } finally {
      setLoading(false);
    }
  };

  const ratingColors = {
    forced: "text-foregroundGrey",
    brilliant: "text-highlightBrilliant",
    great: "text-highlightGreat",
    best: "text-highlightBest",
    excellent: "text-highlightExcellent",
    good: "text-highlightGood",
    book: "text-highlightBook",
    inaccuracy: "text-highlightInaccuracy",
    mistake: "text-highlightMistake",
    miss: "text-highlightMiss",
    blunder: "text-highlightBlunder",
  };

  const glowClasses = {
    forced: "glow-normal border-white/5",
    brilliant: "glow-brilliant border-highlightBrilliant/30",
    great: "glow-normal border-highlightGreat/30",
    best: "glow-best border-highlightBest/30",
    excellent: "glow-best border-highlightExcellent/30",
    good: "glow-normal border-highlightGood/20",
    book: "glow-normal border-highlightBook/20",
    inaccuracy: "glow-mistake border-highlightInaccuracy/25",
    mistake: "glow-mistake border-highlightMistake/25",
    miss: "glow-miss border-highlightMiss/25",
    blunder: "glow-blunder border-highlightBlunder/25",
  };

  if (!comment || !rating || !moveSan) {
    return (
      <div
        className="bg-backgroundBoxBox/45 border border-white/5 backdrop-blur-md w-[85%] rounded-borderExtraRoundness p-4 font-bold text-[15px] text-foreground/90 transition-all duration-300 shadow-md leading-relaxed"
        dangerouslySetInnerHTML={{ __html: overallGameComment }}
      />
    );
  }

  const glowClass = glowClasses[rating] || "border-white/5";
  const ratingColor = ratingColors[rating] || "text-foreground";

  return (
    <div
      className={`min-h-44 w-[85%] p-4 rounded-borderExtraRoundness text-foreground text-[16px] font-bold flex flex-col gap-3 shadow-md bg-backgroundBoxBox/45 border backdrop-blur-md transition-all duration-300 ${glowClass}`}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2.5 min-w-0">
          <RatingSVG draggable rating={rating} size={30} />
          <span className="truncate tracking-wide text-foregroundHighlighted">
            {moveSan}{" "}
            <span className={`${ratingColor} font-extrabold uppercase text-xs ml-1 bg-black/25 px-2 py-0.5 rounded-borderRoundness`}>
              {rating}
            </span>
          </span>
        </div>
        <FormatEval evaluation={evaluation} white={white} />
      </div>

      <div className="text-xs font-semibold text-foregroundGrey/90 leading-relaxed mb-0.5">
        {comment}
      </div>

      {isBackendEnabled && (
        <div className="border-t border-white/5 pt-2 mt-0.5">
          {aiComment ? (
            <div className="bg-backgroundBoxDarker/50 border border-white/5 p-3 rounded-borderRoundness text-xs font-semibold text-foreground/95 leading-relaxed animate-fade-in">
              <div className="flex items-center justify-between font-bold text-foregroundGrey text-[9px] uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1">✨ AI Coach Commentary</span>
                <button
                  onClick={fetchAiComment}
                  className="text-[9px] text-highlightGreat hover:text-foregroundHighlighted hover:underline bg-transparent border-none cursor-pointer p-0 font-bold transition-colors"
                  disabled={loading}
                >
                  Regenerate
                </button>
              </div>
              <p className="whitespace-pre-wrap">{aiComment}</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-foregroundGrey font-bold animate-pulse">
              <span>✨ AI Coach is reviewing the move...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col gap-1.5 py-1">
              <span className="text-xs text-highlightBlunder font-medium">{error}</span>
              <button
                type="button"
                onClick={fetchAiComment}
                className="text-[10px] text-highlightGreat font-extrabold hover:text-foregroundHighlighted hover:underline self-start bg-transparent border-none cursor-pointer p-0 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={fetchAiComment}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-borderRoundness bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover text-foreground transition-all duration-200 text-xs font-extrabold cursor-pointer border-none shadow-sm hover:shadow-shadowBoxBoxHighlighted"
            >
              <span>✨ AI Coach Review (智能点评)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
