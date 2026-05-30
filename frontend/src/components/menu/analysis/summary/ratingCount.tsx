import RatingSVG from "@/components/svg/rating";
import { move, moveRating } from "@/engine/stockfish";
import { useEffect, useState } from "react";

const ratings: moveRating[] = [
    "brilliant", // text-highlightBrilliant
    "great", // text-highlightGreat
    "best", // text-highlightBest
    "excellent", // text-highlightExcellent
    "good", // text-highlightGood
    "book", // text-highlightBook
    "inaccuracy", // text-highlightInaccuracy
    "mistake", // text-highlightMistake
    "miss", // text-highlightMiss
    "blunder", // text-highlightBlunder
]

function title(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function RatingCount(props: { moves: move[] }) {
    const [counter, setCounter] = useState<{ w: { [key: string]: number }, b: { [key: string]: number } }>({ w: {}, b: {} })
    const { moves } = props

    useEffect(() => {
        const newCounter: { w: { [key: string]: number }, b: { [key: string]: number } } = { w: {}, b: {} }
        moves.forEach((move, i) => {
            const rating = move.moveRating as string
            const color = i % 2 === 0 ? 'b' : 'w'

            newCounter[color][rating] = newCounter[color][rating] + 1 || 1
        })
        setCounter(newCounter)
    }, [])

    return (
        <div className="w-[85%] flex flex-col gap-3 justify-center reduceSummary:pr-[35px] pr-[26px]">
            {ratings.map(rating => {
                const titleRating = title(rating)

                return (
                    <div key={rating} className="flex flex-row items-center justify-between">
                        <span className="font-bold text-foregroundGrey reduceSummary:text-lg text-base">{titleRating}</span>
                        <div className="flex flex-row text-xl font-extrabold w-fit">
                            <span className={`reduceSummary:w-[81px] w-[40px] text-left text-highlight${titleRating}`}>{counter.w[rating] ?? 0}</span>
                            <RatingSVG draggable className="select-none" rating={rating} size={30} />
                            <span className={`reduceSummary:w-[81px] w-[40px] text-right text-highlight${titleRating}`}>{counter.b[rating] ?? 0}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}