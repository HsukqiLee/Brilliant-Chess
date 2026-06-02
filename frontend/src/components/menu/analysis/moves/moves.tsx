import { CustomLine } from "@/context/analyze";
import { move, moveRating, square } from "@/engine/stockfish";
import { useEffect, useRef, useState } from "react";
import Comments, { FormatEval } from "./comments";
import { WHITE } from "chess.js";
import GameChart from "../gameChart";
import RatingSVG from "@/components/svg/rating";
import { getMoves } from "@/components/game/game";
import VariationExplorer from "./variationExplorer";
import OpeningExplorer from "./openingExplorer";
import CandidateMoves from "./candidateMoves";
import TablebaseExplorer from "./tablebaseExplorer";

export const RATING_TEXT_COLORS = {
  forced: "",
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

function getRating(
  moveNumber: number,
  rating: moveRating | undefined,
  prevRating: moveRating | undefined,
  nextRating: moveRating | undefined,
  lastBookMove: number,
): { rating: moveRating; textClass: string } | undefined {
  if (!rating) return;

  if (moveNumber === lastBookMove)
    return { rating, textClass: RATING_TEXT_COLORS[rating] };

  if (rating === "best" && prevRating === "inaccuracy")
    return { rating, textClass: RATING_TEXT_COLORS[rating] };

  if (
    rating === "blunder" ||
    rating === "mistake" ||
    rating === "miss" ||
    rating === "great" ||
    rating === "brilliant"
  )
    return { rating, textClass: RATING_TEXT_COLORS[rating] };

  return;
}

export function getLastBookMove(moves: move[]) {
  for (let i = moves.length - 1; i >= 0; i--) {
    if (moves[i].moveRating === "book") return i;
  }

  return -1;
}

export default function Moves(props: {
  moves: move[];
  mainlineMoves?: move[];
  mainlineMoveNumber?: number;
  setMainlineMoveNumber?: (moveNumber: number) => void;
  overallGameComment: string;
  container: HTMLElement;
  moveNumber: number;
  setMoveNumber: (moveNumber: number) => void;
  setAnimation: (animation: boolean) => void;
  setForward: (forward: boolean) => void;
  customLine: CustomLine;
  returnedToNormalGame: square[] | null;
  analyzingMove: boolean;
}) {
  const {
    moves,
    mainlineMoves,
    mainlineMoveNumber,
    setMainlineMoveNumber,
    overallGameComment,
    container,
    moveNumber,
    setMoveNumber,
    setAnimation,
    setForward,
    customLine,
    returnedToNormalGame,
    analyzingMove,
  } = props;

  const [movesHeight, setMovesHeight] = useState(0);
  const [activeTab, setActiveTab] = useState<"engine" | "opening" | "tablebase" | "variations">("engine");

  const componentRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const moveListRef = useRef<HTMLUListElement>(null);
  const gameChartRef = useRef<HTMLDivElement>(null);
  const toolTabsRef = useRef<HTMLDivElement>(null);
  const activeToolRef = useRef<HTMLDivElement>(null);
  const bestMoveRef = useRef<HTMLDivElement>(null);

  const firstMoveBlack = moves[1]?.color === WHITE;

  function getTurns() {
    const realMoves = moves.slice(1);

    const turns: [number, string | undefined, string | undefined][] = [];
    let i = 0;

    if (firstMoveBlack) {
      turns.push([1, undefined, realMoves[0].san ?? ""]);
      i += 1;
    }

    for (; i < realMoves.length; i += 2) {
      const turn = realMoves.slice(i, i + 2) as [move, move];
      const turnNumber = Math.ceil((i + 2) / 2);

      if (turn[1]) {
        turns.push([turnNumber, turn[0].san ?? "", turn[1].san ?? ""]);
      } else {
        turns.push([turnNumber, turn[0].san ?? "", undefined]);
      }
    }

    return turns;
  }

  function scrollToCurrentMove() {
    if (!moveListRef.current) return;

    const moveListRow = moveListRef.current.getElementsByTagName("li")[0];
    if (!moveListRow) return;

    const turnHeight = moveListRow.offsetHeight;

    const gap = 4;

    moveListRef.current.scrollTo({
      behavior: moveNumber ? "smooth" : "instant",
      top:
        turnHeight * Math.floor((moveNumber - 1) / 2) +
        gap * Math.floor((moveNumber - 1) / 2),
    });
  }

  useEffect(scrollToCurrentMove, [moveNumber]);

  useEffect(scrollToCurrentMove, []);

  function resizeMoves() {
    if (
      !componentRef.current ||
      !moveListRef.current ||
      !gameChartRef.current
    )
      return;

    const totalHeight = componentRef.current.offsetHeight;

    const commentsHeight = commentsRef.current?.offsetHeight ?? 0;
    const gameChartHeight = gameChartRef.current?.offsetHeight ?? 0;
    const toolTabsHeight = toolTabsRef.current?.offsetHeight ?? 0;
    const activeToolHeight = activeToolRef.current?.offsetHeight ?? 0;
    const bestMoveHeight = bestMoveRef.current?.offsetHeight ?? 0;

    // Calculate remaining height with layout gaps safety margin
    const newMovesHeight = totalHeight - (commentsHeight + gameChartHeight + toolTabsHeight + activeToolHeight + bestMoveHeight + 52);

    const safeMovesHeight = Math.max(newMovesHeight, 100);
    setMovesHeight(safeMovesHeight);
    moveListRef.current.style.height = `${safeMovesHeight}px`;
  }

  useEffect(() => {
    resizeMoves();

    window.addEventListener("resize", resizeMoves);

    return () => window.removeEventListener("resize", resizeMoves);
  }, []);

  useEffect(() => {
    resizeMoves();
  }, [moveNumber, activeTab]);

  function handleMoveClick(number: number) {
    setMoveNumber(number);

    const numberDiff = moveNumber - number;

    if (numberDiff === 1) {
      setAnimation(true);
      setForward(false);
    } else if (numberDiff === -1) {
      setAnimation(true);
      setForward(true);
    }
  }

  const lastBookMove = getLastBookMove(moves);
  const chartMoves = mainlineMoves ?? moves;
  const hasVariation = customLine.moves.length > 0;
  const rawChartMoveNumber = hasVariation
    ? customLine.baseMoveNumber + Math.max(customLine.moveNumber, 0) + 1
    : (mainlineMoveNumber ?? moveNumber);
  const chartMoveNumber = Math.min(rawChartMoveNumber, chartMoves.length - 1);

  const variationSeries =
    hasVariation && mainlineMoves
      ? {
          baseMoveNumber: customLine.baseMoveNumber,
          moves: customLine.moves,
          activeMoveNumber: customLine.moveNumber,
        }
      : undefined;

  function handleChartMoveSelect(nextMoveNumber: number) {
    if (!mainlineMoves) {
      setMoveNumber(nextMoveNumber);
      return;
    }

    if (!hasVariation) {
      setMainlineMoveNumber?.(nextMoveNumber);
      return;
    }

    const variationIndex = nextMoveNumber - customLine.baseMoveNumber - 1;
    if (variationIndex >= 0 && variationIndex < customLine.moves.length) {
      setMoveNumber(variationIndex + 1);
      return;
    }

    setMainlineMoveNumber?.(nextMoveNumber);
  }

  const { previousMove, move } = getMoves(
    moves,
    moveNumber,
    customLine,
    returnedToNormalGame,
  );

  return (
    <div ref={componentRef} className="flex flex-col gap-3 items-center h-full w-full">
      <div ref={commentsRef} className="w-full flex flex-col items-center">
        <Comments
          comment={analyzingMove ? previousMove?.comment : move?.comment}
          rating={analyzingMove ? previousMove?.moveRating : move?.moveRating}
          moveSan={analyzingMove ? previousMove?.san : move?.san}
          evaluation={
            analyzingMove
              ? (previousMove?.previousStaticEvals?.[0] ?? ["cp", "0"])
              : (move?.previousStaticEvals?.[0] ?? ["cp", "0"])
          }
          white={
            analyzingMove
              ? previousMove?.color === WHITE
              : move?.color === WHITE
          }
          overallGameComment={overallGameComment}
          fen={analyzingMove ? previousMove?.fen : move?.fen}
          bestMove={
            analyzingMove ? previousMove?.bestMoveSan : move?.bestMoveSan
          }
          evalBefore={
            analyzingMove
              ? previousMove?.previousStaticEvals?.[1]
              : move?.previousStaticEvals?.[1]
          }
          evalAfter={
            analyzingMove
              ? previousMove?.previousStaticEvals?.[0]
              : move?.previousStaticEvals?.[0]
          }
        />
      </div>

      {/* Explorer / Analysis Tab Selector */}
      <div ref={toolTabsRef} className="w-[85%] bg-backgroundBoxDarker/30 p-0.5 rounded-borderRoundness flex flex-row border border-white/5 select-none shrink-0">
        {(["engine", "opening", "tablebase", "variations"] as const).map((tabId) => {
          const isActive = activeTab === tabId;
          const labels = {
            engine: "🤖 Engine",
            opening: "📖 Opening",
            tablebase: "🗂️ Tablebase",
            variations: "🌿 Variations",
          };
          return (
            <button
              key={tabId}
              type="button"
              onClick={() => setActiveTab(tabId)}
              className={`flex-grow py-1.5 text-[10px] font-extrabold rounded-borderRoundness transition-all duration-200 text-center cursor-pointer ${
                isActive
                  ? "bg-backgroundBoxBoxHighlighted text-foreground shadow-md scale-102"
                  : "text-foregroundGrey hover:text-foregroundHighlighted hover:bg-white/5"
              }`}
            >
              {labels[tabId]}
            </button>
          );
        })}
      </div>

      {/* Active Explorer Content */}
      <div ref={activeToolRef} className="w-full shrink-0 flex flex-col items-center animate-fade-in" key={activeTab}>
        {activeTab === "engine" && <CandidateMoves fen={move?.fen} />}
        {activeTab === "opening" && <OpeningExplorer fen={move?.fen} />}
        {activeTab === "tablebase" && <TablebaseExplorer fen={move?.fen} />}
        {activeTab === "variations" && <VariationExplorer />}
      </div>

      <div
        ref={bestMoveRef}
        style={{ display: previousMove ? "" : "none" }}
        className="bg-backgroundBoxDarker w-full shrink-0"
      >
        <div className="w-[85%] font-extrabold text-highlightBest mx-auto flex flex-row items-center gap-2 py-2">
          <FormatEval
            best
            smaller
            evaluation={previousMove?.previousStaticEvals?.[0] ?? ["cp", "0"]}
            white={(previousMove?.color ?? WHITE) === WHITE}
          />
          <RatingSVG rating="best" size={22} />
          {previousMove?.bestMoveSan} is best
        </div>
      </div>
      <ul
        style={{ height: movesHeight || "100%" }}
        ref={moveListRef}
        className="gap-y-1 overflow-y-auto overflow-x-hidden w-[85%] select-none flex flex-col"
      >
        {getTurns().map((turn, i) => (
          <li
            key={i}
            className="flex flex-row text-foregroundGrey items-center w-full"
          >
            <span className="font-bold w-[33px]">{turn[0]}.</span>
            <div className="flex flex-row text-lg font-extrabold flex-grow">
              {turn.slice(1).map((move, j) => {
                if (!move) return <div key={`${i}-${j}`} className="w-1/2" />;

                const currentMoveNumber = i * 2 + j + (firstMoveBlack ? 0 : 1);

                const isSelected = moveNumber === currentMoveNumber;

                const rating = moves[currentMoveNumber].moveRating;

                const prevRating = moves[currentMoveNumber - 1]?.moveRating;
                const nextRating = moves[currentMoveNumber + 1]?.moveRating;

                const shownRating = getRating(
                  currentMoveNumber,
                  rating,
                  prevRating,
                  nextRating,
                  lastBookMove,
                );

                const fgColorClass = shownRating
                  ? shownRating.textClass
                  : isSelected
                    ? "text-foregroundHighlighted"
                    : "";

                return (
                  <div
                    key={`${i}-${j}`}
                    className="w-1/2 flex flex-row gap-1 items-center"
                  >
                    <button
                      type="button"
                      onClick={() => handleMoveClick(currentMoveNumber)}
                      className="w-[22px] outline-none"
                    >
                      {shownRating ? (
                        <RatingSVG
                          draggable
                          rating={shownRating.rating}
                          size={22}
                        />
                      ) : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveClick(currentMoveNumber)}
                      className={`rounded-borderRoundness outline-none border-b-2 text-left px-2 w-fit ${isSelected ? "bg-backgroundBoxBox border-backgroundBoxBoxHover" : "border-transparent"} ${fgColorClass}`}
                    >
                      {move}
                    </button>
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
      <div ref={gameChartRef}>
        <GameChart
          container={container}
          moves={chartMoves}
          moveNumber={chartMoveNumber}
          setMoveNumber={handleChartMoveSelect}
          setAnimation={setAnimation}
          setForward={setForward}
          variation={variationSeries}
        />
      </div>
    </div>
  );
}
