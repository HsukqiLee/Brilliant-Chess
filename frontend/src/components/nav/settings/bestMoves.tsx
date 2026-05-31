import { ConfigContext } from "@/context/config"
import { useContext, useEffect } from "react"
import { boardThemes } from "./themes"
import { Arrow } from "@/components/game/board"
import PieceSVG from "@/components/svg/piece"
import { QUEEN, WHITE } from "chess.js"

export default function BestMoves() {
    const configContext = useContext(ConfigContext)

    const [boardTheme] = configContext.boardTheme
    const [showArrows, setShowArrows] = configContext.showArrows
    const [arrowAfterMove, setArrowAfterMove] = configContext.arrowAfterMove

    useEffect(() => {
        const showArrows = localStorage.getItem('showArrows')
        if (!showArrows) return
        const numberShowArrows = Number(showArrows)
        if (!isNaN(numberShowArrows)) {
            setShowArrows(Boolean(numberShowArrows))
        } else {
            localStorage.setItem('showArrows', '1')
            setShowArrows(true)
        }
    }, [])

    function toggleShowArrows() {
        const newShowArrows = !showArrows

        localStorage.setItem('showArrows', String(Number(newShowArrows)))

        setShowArrows(newShowArrows)
    }

    useEffect(() => {
        const arrowAfterMove = localStorage.getItem('arrowAfterMove')
        if (!arrowAfterMove) return
        const numberArrowAfterMove = Number(arrowAfterMove)
        if (!isNaN(numberArrowAfterMove)) {
            setArrowAfterMove(Boolean(numberArrowAfterMove))
        } else {
            localStorage.setItem('arrowAfterMove', '1')
            setArrowAfterMove(true)
        }
    }, [])

    function toggleArrowAfterMove() {
        const newArrowAfterMove = !arrowAfterMove

        localStorage.setItem('arrowAfterMove', String(Number(newArrowAfterMove)))

        setArrowAfterMove(newArrowAfterMove)
    }

    return (
        <section>
            <h1 className="block bg-backgroundBoxBox font-bold text-nowrap p-3 text-foreground">Best Moves</h1>
            <button onClick={toggleShowArrows} type="button" className="flex flex-row gap-2 items-center hover:text-foregroundHighlighted hover:bg-black transition-colors w-full relative p-2">
                <div className="grid grid-cols-2 w-fit relative">
                    {Array.from({ length: 4 }).map((_, i) => {
                        const isEvenCol = i % 2 === 0
                        const isEvenRow = Math.floor(i / 2) % 2 === 0

                        const squareColor = isEvenCol ? (isEvenRow ? boardThemes[boardTheme].white : boardThemes[boardTheme].black) : (isEvenRow ? boardThemes[boardTheme].black : boardThemes[boardTheme].white)

                        return (
                            <div key={i} style={{ backgroundColor: squareColor }} className="h-5 w-5 relative">
                                {i === 2 ? <PieceSVG className="absolute z-10 top-0 left-0" piece={QUEEN} size={20} color={WHITE} /> : null}
                            </div>
                        )
                    })}
                    {showArrows ? <Arrow move={[{ col: 0, row: 1 }, { col: 1, row: 1 }]} squareSize={20} white class="fill-bestArrow stroke-bestArrow" /> : null}
                </div>
                <span className="font-bold text-lg">Show arrows</span>
                <div style={{ backgroundColor: "var(--foreground)", display: showArrows ? '' : 'none' }} className="w-3 h-3 rounded-full absolute right-3" />
            </button>
            <button onClick={toggleArrowAfterMove} type="button" className="flex flex-row gap-2 items-center hover:text-foregroundHighlighted hover:bg-black transition-colors w-full relative p-2">
                <div className="grid grid-cols-2 w-fit relative">
                    {Array.from({ length: 4 }).map((_, i) => {
                        const isEvenCol = i % 2 === 0
                        const isEvenRow = Math.floor(i / 2) % 2 === 0

                        const squareColor = isEvenCol ? (isEvenRow ? boardThemes[boardTheme].white : boardThemes[boardTheme].black) : (isEvenRow ? boardThemes[boardTheme].black : boardThemes[boardTheme].white)

                        return (
                            <div key={i} style={{ backgroundColor: squareColor }} className="h-5 w-5 relative">
                                {(i === 2 || i === 3) && arrowAfterMove ? <div className="w-full h-full absolute top-0 left-0 opacity-50" style={{backgroundColor: 'var(--highlightBoard)'}} /> : null}
                                {(i === 2 && !arrowAfterMove) || (i === 3 && arrowAfterMove) ? <PieceSVG className="absolute z-10 top-0 left-0" piece={QUEEN} size={20} color={WHITE} /> : null}
                                {(i === 2 || i === 3) && arrowAfterMove ? <div className="w-full h-full opacity-50 absolute top-0 left-0" style={{ backgroundColor: boardThemes[boardTheme].highlight }} /> : null}
                            </div>
                        )
                    })}
                    <Arrow move={[{ col: 0, row: 1 }, { col: 1, row: 1 }]} squareSize={20} white class="fill-bestArrow stroke-bestArrow" />
                </div>
                <span className="font-bold text-lg">Arrow after move</span>
                <div style={{ backgroundColor: "var(--foreground)", display: arrowAfterMove ? '' : 'none'}} className="w-3 h-3 rounded-full absolute right-3" />
            </button>
        </section>
    )
}