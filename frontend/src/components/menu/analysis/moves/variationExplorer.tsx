"use client";

import { useContext } from "react";
import { AnalyzeContext } from "@/context/analyze";

function getPlyLabel(ply: number) {
  if (ply <= 0) return "";

  const turn = Math.ceil(ply / 2);
  const isWhite = ply % 2 === 1;

  return isWhite ? `${turn}.` : `${turn}...`;
}

export default function VariationExplorer() {
  const analyzeContext = useContext(AnalyzeContext);

  const [pageState, setPageState] = analyzeContext.pageState;
  const [customLine, setCustomLine] = analyzeContext.customLine;
  const [variations, setVariations] = analyzeContext.variations;
  const [moveNumber, setMoveNumber] = analyzeContext.moveNumber;
  const [mainlineMoves] = analyzeContext.game;
  const [analyzingMove] = analyzeContext.analyzingMove;
  const [, setReturnedToNormalGame] = analyzeContext.returnedToNormalGame;

  const hasLine = customLine.moves.length > 0;
  const sortedVariations = [...variations].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  const baseMoveNumber = hasLine ? customLine.baseMoveNumber : moveNumber;

  const baseMove = mainlineMoves[baseMoveNumber];
  const baseLabel =
    baseMoveNumber === 0
      ? "Start position"
      : `After ${getPlyLabel(baseMoveNumber)} ${baseMove?.san ?? ""}`;

  function createVariationId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  function openLine() {
    if (!hasLine) return;
    setReturnedToNormalGame(null);
    setMoveNumber(baseMoveNumber);
    setPageState("analyzeCustom");
    setCustomLine((prev) => ({
      ...prev,
      moveNumber: Math.max(prev.moveNumber, 0),
    }));
  }

  function clearLine() {
    setReturnedToNormalGame(null);
    setCustomLine({
      baseMoveNumber: moveNumber,
      moveNumber: -1,
      moves: [],
      arrows: {},
    });
    if (pageState === "analyzeCustom") setPageState("analyze");
  }

  function returnToMainline() {
    if (!hasLine) return;
    setReturnedToNormalGame(null);
    setPageState("analyze");
    setCustomLine({
      baseMoveNumber: moveNumber,
      moveNumber: -1,
      moves: [],
      arrows: {},
    });
  }

  function saveVariation() {
    if (!hasLine) return;

    const createdAt = Date.now();
    const newVariation = {
      id: createVariationId(),
      name: `Variation ${variations.length + 1}`,
      baseMoveNumber: customLine.baseMoveNumber,
      moveNumber: customLine.moveNumber,
      moves: [...customLine.moves],
      arrows: { ...customLine.arrows },
      createdAt,
    };

    setVariations((prev) => [...prev, newVariation]);
  }

  function loadVariation(id: string) {
    const variation = variations.find((line) => line.id === id);
    if (!variation) return;

    setReturnedToNormalGame(null);
    setMoveNumber(variation.baseMoveNumber);
    setPageState("analyzeCustom");
    setCustomLine({
      baseMoveNumber: variation.baseMoveNumber,
      moveNumber: variation.moves.length
        ? Math.min(
            Math.max(variation.moveNumber, 0),
            variation.moves.length - 1,
          )
        : -1,
      moves: [...variation.moves],
      arrows: { ...variation.arrows },
    });
  }

  function deleteVariation(id: string) {
    setVariations((prev) => prev.filter((line) => line.id !== id));
  }

  function jumpToMove(index: number) {
    if (!hasLine) return;
    setReturnedToNormalGame(null);
    setPageState("analyzeCustom");
    setCustomLine((prev) => ({ ...prev, moveNumber: index }));
  }

  return (
    <div className="w-[85%] flex flex-col gap-2.5 bg-backgroundBoxBox/45 border border-white/5 backdrop-blur-md rounded-borderRoundness px-3 py-2.5 shadow-sm transition-all duration-300">
      <div className="flex flex-row items-center justify-between">
        <div className="font-extrabold text-foregroundHighlighted text-[11px]">
          Variation Explorer
        </div>
        <div className="flex flex-row gap-1.5 select-none shrink-0">
          {hasLine ? (
            <button
              type="button"
              disabled={analyzingMove}
              onClick={saveVariation}
              className="text-[9px] font-extrabold px-2 py-1 rounded-borderRoundness transition-all duration-200 border cursor-pointer bg-backgroundBoxBox/30 border-white/5 hover:bg-backgroundBoxBox/60 text-foregroundGrey hover:text-foregroundHighlighted disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Save
            </button>
          ) : null}
          {hasLine && pageState !== "analyzeCustom" ? (
            <button
              type="button"
              disabled={analyzingMove}
              onClick={openLine}
              className="text-[9px] font-extrabold px-2 py-1 rounded-borderRoundness transition-all duration-200 border cursor-pointer bg-backgroundBoxBox/30 border-white/5 hover:bg-backgroundBoxBox/60 text-foregroundGrey hover:text-foregroundHighlighted disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Open
            </button>
          ) : null}
          {hasLine && pageState === "analyzeCustom" ? (
            <button
              type="button"
              disabled={analyzingMove}
              onClick={returnToMainline}
              className="text-[9px] font-extrabold px-2 py-1 rounded-borderRoundness transition-all duration-200 border cursor-pointer bg-backgroundBoxBox/30 border-white/5 hover:bg-backgroundBoxBox/60 text-foregroundGrey hover:text-foregroundHighlighted disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Back
            </button>
          ) : null}
          {hasLine ? (
            <button
              type="button"
              disabled={analyzingMove}
              onClick={clearLine}
              className="text-[9px] font-extrabold px-2 py-1 rounded-borderRoundness transition-all duration-200 border cursor-pointer bg-backgroundBoxBox/30 border-white/5 hover:bg-backgroundBoxBox/60 text-foregroundGrey hover:text-foregroundHighlighted disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>
      <div className="text-[10px] text-foregroundGrey/65 font-semibold mt-0.5">{baseLabel}</div>
      {hasLine ? (
        <ul className="flex flex-col gap-1.5">
          {customLine.moves.map((move, index) => {
            const ply = baseMoveNumber + 1 + index;
            const plyLabel = getPlyLabel(ply);
            const isActive = index === customLine.moveNumber;

            return (
              <li
                key={`${move.san}-${index}`}
                className="flex flex-row items-center gap-2"
              >
                <button
                  type="button"
                  disabled={analyzingMove}
                  onClick={() => jumpToMove(index)}
                  className={`text-left w-full px-2.5 py-1 rounded-borderRoundness text-xs transition-all duration-150 cursor-pointer ${isActive ? "bg-backgroundBoxBoxHighlighted/20 border border-highlightBest/25 text-highlightBest font-extrabold" : "text-foregroundGrey/90 hover:text-foregroundHighlighted hover:bg-white/5 border border-transparent font-semibold"}`}
                >
                  <span className="font-bold mr-2 opacity-75">{plyLabel}</span>
                  <span className="font-extrabold">{move.san}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-[10px] text-foregroundGrey/50 italic py-1 mt-0.5 font-medium">
          Make a move on the board to start a variation.
        </div>
      )}
      <div className="border-t border-white/5 pt-2 text-[10px] font-extrabold text-foregroundGrey/70 uppercase tracking-wider mt-1 px-0.5">
        Saved variations
      </div>
      {sortedVariations.length ? (
        <ul className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
          {sortedVariations.map((line) => {
            const lineBaseMove = mainlineMoves[line.baseMoveNumber];
            const lineLabel =
              line.baseMoveNumber === 0
                ? "Start position"
                : `After ${getPlyLabel(line.baseMoveNumber)} ${lineBaseMove?.san ?? ""}`;

            return (
              <li key={line.id} className="flex flex-row items-center gap-2 bg-backgroundBoxBox/20 hover:bg-backgroundBoxBox/35 border border-white/5 hover:border-white/10 px-2.5 py-1.5 rounded-borderRoundness transition-colors duration-150">
                <button
                  type="button"
                  disabled={analyzingMove}
                  onClick={() => loadVariation(line.id)}
                  className="text-left flex-grow text-xs text-foregroundGrey hover:text-foregroundHighlighted bg-transparent border-none p-0 cursor-pointer flex flex-col gap-0.5"
                >
                  <span className="font-extrabold text-foregroundHighlighted text-xs">{line.name}</span>
                  <span className="text-[9px] text-foregroundGrey/70 font-semibold">
                    {lineLabel} • {line.moves.length} moves
                  </span>
                </button>
                <button
                  type="button"
                  disabled={analyzingMove}
                  onClick={() => deleteVariation(line.id)}
                  className="text-[9px] font-extrabold px-2 py-1 rounded-borderRoundness transition-all duration-200 border cursor-pointer bg-red-950/20 border-red-900/35 hover:bg-red-900/40 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-xs text-foregroundGrey/40 italic py-1 px-0.5">
          No saved variations yet.
        </div>
      )}
    </div>
  );
}
