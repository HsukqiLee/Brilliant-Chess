import { AnalyzeContext, ReviewState } from "@/context/analyze";
import { useContext, useState, useEffect } from "react";
import Image from "next/image";

export default function MistakesReview() {
  const analyzeContext = useContext(AnalyzeContext);
  const [game] = analyzeContext.game;
  const [reviewState, setReviewState] = analyzeContext.reviewState;
  const [players] = analyzeContext.players;
  const [tab, setTab] = analyzeContext.tab;

  const [mistakesList, setMistakesList] = useState<number[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Calculate mistakes for each player
  const getMistakes = (color: "w" | "b") => {
    const list: number[] = [];
    for (let i = 1; i < game.length; i++) {
      const move = game[i];
      const playerColor = move.color === "w" ? "b" : "w";
      if (
        playerColor === color &&
        ["blunder", "mistake", "miss"].includes(move.moveRating ?? "")
      ) {
        list.push(i);
      }
    }
    return list;
  };

  const whiteMistakes = getMistakes("w");
  const blackMistakes = getMistakes("b");

  function startReview(indices: number[]) {
    if (indices.length === 0) return;

    setMistakesList(indices);
    setCurrentReviewIndex(0);

    // Set the board position to the FEN before the first mistake
    const firstMistakeIndex = indices[0];
    setReviewState({
      active: true,
      mistakeIndex: firstMistakeIndex,
      solved: false,
      wrong: false,
      playedMove: null,
      theme: "",
      explanation: "",
      loadingExplanation: false,
    });
  }

  function exitReview() {
    setReviewState({
      active: false,
      mistakeIndex: -1,
      solved: false,
      wrong: false,
      playedMove: null,
      theme: "",
      explanation: "",
      loadingExplanation: false,
    });
    setMistakesList([]);
    setTab("summary");
  }

  function nextMistake() {
    const nextIndex = currentReviewIndex + 1;
    if (nextIndex >= mistakesList.length) {
      // Finished!
      exitReview();
      return;
    }

    setCurrentReviewIndex(nextIndex);
    const nextMistakeIndex = mistakesList[nextIndex];
    setReviewState({
      active: true,
      mistakeIndex: nextMistakeIndex,
      solved: false,
      wrong: false,
      playedMove: null,
      theme: "",
      explanation: "",
      loadingExplanation: false,
    });
  }

  function showSolution() {
    const mistakeIndex = reviewState.mistakeIndex;
    if (mistakeIndex === -1) return;

    const correctMove = game[mistakeIndex - 1].bestMove;
    if (!correctMove) return;

    // Set the playedMove state to correctMove to show it on board
    setReviewState((prev) => ({
      ...prev,
      playedMove: correctMove,
    }));
  }

  if (!reviewState.active) {
    return (
      <div className="flex flex-col gap-6 p-4 items-center justify-center text-center">
        <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-backgroundBoxBox select-none">
          <Image
            draggable={false}
            alt="review"
            src={`${(process.env.NEXT_PUBLIC_BASE_PATH || "")}/images/type.svg`}
            width={45}
            height={45}
          />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">
            Mistakes Review
          </h2>
          <p className="text-foregroundGrey text-sm max-w-[320px]">
            Review the critical blunders, mistakes, or missed tactical ideas in
            your game and find the optimal moves.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 max-w-[360px]">
          <button
            onClick={() => startReview(whiteMistakes)}
            disabled={whiteMistakes.length === 0}
            className={`w-full py-4 rounded-borderExtraRoundness text-xl font-bold flex flex-row items-center justify-between px-6 transition-all ${whiteMistakes.length > 0 ? "bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover hover:shadow-shadowBoxBoxHighlighted text-foreground cursor-pointer" : "bg-backgroundBoxBoxDisabled text-foregroundGrey cursor-not-allowed"}`}
          >
            <span>Review White ({players[0].name})</span>
            <span className="bg-black/25 px-3 py-1 rounded-full text-sm">
              {whiteMistakes.length} mistakes
            </span>
          </button>

          <button
            onClick={() => startReview(blackMistakes)}
            disabled={blackMistakes.length === 0}
            className={`w-full py-4 rounded-borderExtraRoundness text-xl font-bold flex flex-row items-center justify-between px-6 transition-all ${blackMistakes.length > 0 ? "bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover hover:shadow-shadowBoxBoxHighlighted text-foreground cursor-pointer" : "bg-backgroundBoxBoxDisabled text-foregroundGrey cursor-not-allowed"}`}
          >
            <span>Review Black ({players[1].name})</span>
            <span className="bg-black/25 px-3 py-1 rounded-full text-sm">
              {blackMistakes.length} mistakes
            </span>
          </button>
        </div>
      </div>
    );
  }

  const currentMistakeIndex = mistakesList[currentReviewIndex];
  const currentMove = game[currentMistakeIndex];
  const ratingName = currentMove.moveRating ?? "Mistake";
  const uppercaseRating =
    ratingName.charAt(0).toUpperCase() + ratingName.slice(1);
  const originalMoveSan = currentMove.san ?? "";

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      <div className="flex flex-row justify-between items-center bg-backgroundBoxBox p-3 rounded-borderRoundness border border-border">
        <div className="flex flex-col">
          <span className="text-foregroundGrey text-xs font-bold uppercase tracking-wider">
            Mistakes Review
          </span>
          <span className="text-foreground font-extrabold text-lg">
            Mistake {currentReviewIndex + 1} of {mistakesList.length}
          </span>
        </div>
        <button
          onClick={exitReview}
          className="px-3 py-1.5 rounded-borderRoundness text-sm font-semibold bg-backgroundBoxBoxDarker hover:bg-backgroundBoxBoxHover hover:text-foregroundHighlighted transition-colors"
        >
          Exit
        </button>
      </div>

      <div className="flex flex-col gap-3 bg-backgroundBoxBox p-4 rounded-borderRoundness border border-border">
        <div>
          <span className="text-foregroundGrey text-sm">Move Played:</span>
          <span className="ml-2 px-2 py-0.5 bg-red-950/40 text-red-400 border border-red-900/50 rounded text-sm font-bold">
            {originalMoveSan} ({uppercaseRating})
          </span>
        </div>
        <div className="text-foreground font-bold text-md mt-1">
          🎯 What is the best move in this position?
        </div>
      </div>

      {reviewState.solved && (
        <div className="flex flex-col gap-3 bg-green-950/30 text-green-300 border border-green-800/40 p-4 rounded-borderRoundness animate-fade-in">
          <div className="flex flex-row items-center gap-2 font-extrabold text-lg">
            <span>Correct! 🎉</span>
            {reviewState.theme && (
              <span className="px-2 py-0.5 bg-green-900/50 text-green-200 border border-green-700/50 rounded text-xs">
                主题: {reviewState.theme}
              </span>
            )}
          </div>

          {reviewState.loadingExplanation ? (
            <div className="text-sm text-green-400/80 italic flex flex-row items-center gap-2">
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              AI Coach is analyzing tactical theme...
            </div>
          ) : (
            reviewState.explanation && (
              <p className="text-sm text-green-200/90 leading-relaxed font-semibold">
                {reviewState.explanation}
              </p>
            )
          )}

          <button
            onClick={nextMistake}
            className="mt-2 w-full py-3 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white rounded-borderRoundness font-extrabold transition-colors shadow-lg shadow-green-950/20"
          >
            {currentReviewIndex + 1 < mistakesList.length
              ? "Next Mistake"
              : "Finish Review"}
          </button>
        </div>
      )}

      {reviewState.wrong && (
        <div className="flex flex-col gap-3 bg-red-950/20 text-red-300 border border-red-900/30 p-4 rounded-borderRoundness animate-shake">
          <div className="font-extrabold text-md">
            That is not the best move! ❌
          </div>
          <div className="text-sm text-red-300/80">
            Try to look for a better tactical response or position improvement.
          </div>
          <div className="flex flex-row gap-2 mt-1">
            <button
              onClick={() =>
                setReviewState((prev) => ({
                  ...prev,
                  wrong: false,
                  playedMove: null,
                }))
              }
              className="flex-1 py-2 bg-red-900/50 hover:bg-red-800/60 text-red-200 rounded border border-red-800/40 text-sm font-bold transition-colors"
            >
              Retry
            </button>
            <button
              onClick={showSolution}
              className="flex-1 py-2 bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover text-foreground rounded text-sm font-bold transition-colors"
            >
              Show Solution
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
