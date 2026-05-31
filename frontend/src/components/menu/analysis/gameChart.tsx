import { move, moveRating } from "@/engine/stockfish";
import { useEffect, useState } from "react";
import { getLastBookMove } from "./moves/moves";

function isImportantMove(
  moveNumber: number,
  rating: moveRating | undefined,
  prevRating: moveRating | undefined,
  nextRating: moveRating | undefined,
  lastBookMove: number,
): string | undefined {
  if (!rating) return;

  if (moveNumber === lastBookMove) return "highlightBook";
  if (rating === "best" && prevRating === "inaccuracy") return "highlightBest";
  if (rating === "blunder") return "highlightBlunder";
  if (rating === "mistake") return "highlightMistake";
  if (rating === "miss") return "highlightMiss";
  if (rating === "great") return "highlightGreat";
  if (rating === "brilliant") return "highlightBrilliant";

  return;
}

type VariationSeries = {
  baseMoveNumber: number;
  moves: move[];
  activeMoveNumber: number;
};

export default function GameChart(props: {
  moves: move[];
  container: HTMLElement;
  moveNumber: number;
  setMoveNumber: (moveNumber: number) => void;
  setAnimation: (animation: boolean) => void;
  setForward: (forward: boolean) => void;
  variation?: VariationSeries;
}) {
  const {
    moves,
    container,
    moveNumber,
    setMoveNumber,
    setAnimation,
    setForward,
    variation,
  } = props;

  const [hoveredMove, setHoveredMove] = useState(NaN);
  const [importantMoves, setImportantMoves] = useState<
    { color: string | undefined; move: move }[]
  >([]);
  const [size, setSize] = useState({ width: 400, height: 96 });

  const totalMoves = Math.max(moves.length - 1, 1);
  const hoveredMoveX = getMoveX(hoveredMove, totalMoves) * size.width;
  const moveNumberX = getMoveX(moveNumber, totalMoves) * size.width;

  const lastBookMove = getLastBookMove(moves);

  useEffect(() => {
    function setRealSize() {
      setSize({ width: container.offsetWidth * 0.85, height: 96 });
    }

    setRealSize();

    window.addEventListener("resize", setRealSize);

    return () => window.removeEventListener("resize", setRealSize);
  }, []);

  useEffect(() => {
    const newImportantMoves = moves.map((move, i) => {
      const rating = move.moveRating;
      const previousRating = moves[i - 1]?.moveRating;
      const nextRating = moves[i + 1]?.moveRating;

      return {
        color: isImportantMove(
          i,
          rating,
          previousRating,
          nextRating,
          lastBookMove,
        ),
        move: move,
      };
    });

    setImportantMoves(newImportantMoves);
  }, [moves]);

  function hoverMove(e: React.MouseEvent) {
    const svg = e.currentTarget as SVGAElement;
    const svgPosition = svg.getBoundingClientRect().x;

    const mousePosition = e.clientX;

    const mouseInSvgPosition = mousePosition - svgPosition;

    const moveSize = size.width / totalMoves;
    const move = Math.round(mouseInSvgPosition / moveSize);

    setHoveredMove(move);
  }

  function changeMoveNumber() {
    if (hoveredMove === moveNumber) return;

    if (Math.abs(moveNumber - hoveredMove) === 1) {
      setAnimation(true);
    }
    if (hoveredMove > moveNumber) {
      setForward(true);
    } else {
      setForward(false);
    }
    setMoveNumber(hoveredMove);
  }

  function getMoveY(move: move, moveNumber: number) {
    const OLD_PERCENTS = [-400, 400];
    const NEW_PERCENTS = [0.075, 0.925];

    const advantage = move.previousStaticEvals?.[0] ?? ["cp", "0"];
    const whiteMoving = moveNumber % 2 === 0;

    const advantageAmount = Number(advantage[1]) * (whiteMoving ? 1 : -1);

    const rawPercent =
      ((advantageAmount - OLD_PERCENTS[0]) *
        (NEW_PERCENTS[1] - NEW_PERCENTS[0])) /
        (OLD_PERCENTS[1] - OLD_PERCENTS[0]) +
      NEW_PERCENTS[0];
    let percent;
    if (advantage[0] === "mate") {
      if (advantage[1]) {
        percent = advantageAmount >= 0 ? 1 : 0;
      } else {
        percent = whiteMoving ? 0 : 1;
      }
    } else {
      percent = Math.min(
        Math.max(rawPercent, NEW_PERCENTS[0]),
        NEW_PERCENTS[1],
      );
    }

    return percent;
  }

  function getMoveX(moveNumber: number, maxNumber: number) {
    return moveNumber / maxNumber;
  }

  function getChartPoint(move: move, ply: number) {
    const clampedPly = Math.min(Math.max(ply, 0), totalMoves);
    const xRelation = getMoveX(clampedPly, totalMoves);
    const yRelation = 1 - getMoveY(move, clampedPly);

    return {
      x: size.width * xRelation,
      y: size.height * yRelation,
    };
  }

  const variationPoints = (() => {
    if (!variation || !variation.moves.length) return [];

    const points: { x: number; y: number }[] = [];
    const baseMove = moves[variation.baseMoveNumber];

    if (baseMove) {
      points.push(getChartPoint(baseMove, variation.baseMoveNumber));
    }

    variation.moves.forEach((move, index) => {
      const ply = variation.baseMoveNumber + index + 1;
      points.push(getChartPoint(move, ply));
    });

    return points;
  })();

  const variationPath = variationPoints.length
    ? `M ${variationPoints[0].x} ${variationPoints[0].y} ${variationPoints
        .slice(1)
        .map((point) => `L ${point.x} ${point.y}`)
        .join(" ")}`
    : "";

  const activeVariationMove =
    variation && variation.activeMoveNumber >= 0
      ? variation.moves[variation.activeMoveNumber]
      : undefined;

  const activeVariationPoint =
    activeVariationMove && variation
      ? getChartPoint(
          activeVariationMove,
          variation.baseMoveNumber + variation.activeMoveNumber + 1,
        )
      : null;

  const upperFirstLetter = (str: string) =>
    str[0]?.toUpperCase() + str.substring(1);
  const strokeColor =
    moves[moveNumber].moveRating !== "forced"
      ? `highlight${upperFirstLetter(moves[moveNumber].moveRating ?? "")}`
      : "foregroundGrey";

  return (
    <svg
      onClick={changeMoveNumber}
      onMouseMove={hoverMove}
      onMouseLeave={() => setHoveredMove(NaN)}
      width={size.width}
      height={size.height}
      className="bg-evaluationBarBlack rounded-borderRoundness"
    >
      <path
        fill="#ffffff"
        d={`M 0 ${size.height * 0.5} ${moves
          .map((move, moveNumber) => {
            const xRelation = getMoveX(moveNumber, totalMoves);
            const yRelation = 1 - getMoveY(move, moveNumber);

            const x = size.width * xRelation;
            const y = size.height * yRelation;

            return `L ${x} ${y}`;
          })
          .join(" ")} L ${size.width} ${size.height} L 0 ${size.height}`}
      />
      <line
        x1={0}
        y1={size.height / 2}
        x2={size.width}
        y2={size.height / 2}
        className="stroke-foregroundGrey opacity-75 stroke-2"
      />
      {variationPath ? (
        <path
          d={variationPath}
          fill="none"
          stroke="var(--highlightGreat)"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
      ) : null}
      {activeVariationPoint ? (
        <circle
          cx={activeVariationPoint.x}
          cy={activeVariationPoint.y}
          r={5}
          fill="var(--highlightGreat)"
        />
      ) : null}
      {isNaN(hoveredMoveX) ? (
        ""
      ) : (
        <line
          x1={hoveredMoveX}
          y1={size.height}
          x2={hoveredMoveX}
          y2={0}
          className="stroke-foregroundGrey opacity-50 stroke-2"
        />
      )}
      {isNaN(moveNumberX) ? (
        ""
      ) : (
        <line
          style={{
            display: !moveNumber ? "none" : "",
            stroke: `var(--${strokeColor})`,
          }}
          x1={moveNumberX}
          y1={size.height}
          x2={moveNumberX}
          y2={0}
          className="stroke-[4px]"
        />
      )}
      {importantMoves.map((move, i) => {
        if (!(move.color || (i === moveNumber && moveNumber))) return;

        const xRelation = getMoveX(i, totalMoves);
        const yRelation = 1 - getMoveY(move.move, i);

        const x = size.width * xRelation;
        const y = size.height * yRelation;

        return (
          <circle
            key={i}
            style={{ fill: `var(--${move.color ?? strokeColor})` }}
            cx={x}
            cy={y}
            r={5}
          />
        );
      })}
    </svg>
  );
}
