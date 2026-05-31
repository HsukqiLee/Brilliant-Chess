import { useEffect, useRef, useState } from "react";
import { players } from "@/context/analyze";
import RatingCount from "./ratingCount";
import PlayersAccuracy from "./playersAccuracy";
import GameRating from "./gameRating";
import { accuracyPhases } from "./playersAccuracy";
import { move } from "@/engine/stockfish";
import GameChart from "../gameChart";
import { reduceSummary } from "../../../../../tailwind.config";
import ExportSharing from "./exportSharing";
import TimeAnalysis from "./timeAnalysis";
import OpponentComparison from "./opponentComparison";

export default function Summary(props: { moves: move[], container: HTMLElement, players: players, moveNumber: number, setMoveNumber: (moveNumber: number) => void, setAnimation: (animation: boolean) => void, setForward: (forward: boolean) => void }) {
    const { moves, container, players, moveNumber, setMoveNumber, setAnimation, setForward } = props

    const [reducedSummary, setReducedSummary] = useState(false)

    const componentRef = useRef<HTMLDivElement>(null)

    const [accuracy, setAccuracy] = useState({ w: NaN, b: NaN })
    const [accuracyPhases, setAccuracyPhases] = useState<accuracyPhases>({ opening: { w: [], b: [] }, middlegame: { w: [], b: [] }, endgame: { w: [], b: [] } })

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            entries.forEach(() => {
                setReducedSummary(window.innerWidth < reduceSummary)
            })
        })

        const component = componentRef.current

        if (!component) return

        observer.observe(component)
    }, [])

    return (
        <div ref={componentRef} className="flex flex-col gap-3 items-center">
            <GameChart setMoveNumber={setMoveNumber} moves={moves} container={container} moveNumber={moveNumber} setAnimation={setAnimation} setForward={setForward} />
            <PlayersAccuracy reducedSummary={reducedSummary} setAccuracyPhases={setAccuracyPhases} accuracy={[accuracy, setAccuracy]} players={players} moves={moves} />
            <hr className="border-neutral-600 w-[85%]" />
            <RatingCount moves={moves} />
            <hr className="border-neutral-600 w-[85%]" />
            <GameRating reducedSummary={reducedSummary} accuracy={accuracy} accuracyPhases={accuracyPhases} />
            <hr className="border-neutral-600 w-[85%]" />
            <OpponentComparison moves={moves} players={players} accuracy={accuracy} />
            <hr className="border-neutral-600 w-[85%]" />
            <TimeAnalysis moves={moves} />
            <hr className="border-neutral-600 w-[85%]" />
            <ExportSharing moves={moves} players={players} />
        </div>
    )
}