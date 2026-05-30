"use client"

import { useContext } from "react"
import { AnalyzeContext } from "@/context/analyze"

function getPlyLabel(ply: number) {
    if (ply <= 0) return ""

    const turn = Math.ceil(ply / 2)
    const isWhite = ply % 2 === 1

    return isWhite ? `${turn}.` : `${turn}...`
}

export default function VariationExplorer() {
    const analyzeContext = useContext(AnalyzeContext)

    const [pageState, setPageState] = analyzeContext.pageState
    const [customLine, setCustomLine] = analyzeContext.customLine
    const [variations, setVariations] = analyzeContext.variations
    const [moveNumber, setMoveNumber] = analyzeContext.moveNumber
    const [mainlineMoves] = analyzeContext.game
    const [analyzingMove] = analyzeContext.analyzingMove
    const [, setReturnedToNormalGame] = analyzeContext.returnedToNormalGame

    const hasLine = customLine.moves.length > 0
    const sortedVariations = [...variations].sort((a, b) => b.createdAt - a.createdAt)

    const baseMoveNumber = hasLine ? customLine.baseMoveNumber : moveNumber

    const baseMove = mainlineMoves[baseMoveNumber]
    const baseLabel = baseMoveNumber === 0
        ? "Start position"
        : `After ${getPlyLabel(baseMoveNumber)} ${baseMove?.san ?? ""}`

    function createVariationId() {
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    }

    function openLine() {
        if (!hasLine) return
        setReturnedToNormalGame(null)
        setMoveNumber(baseMoveNumber)
        setPageState("analyzeCustom")
        setCustomLine(prev => ({ ...prev, moveNumber: Math.max(prev.moveNumber, 0) }))
    }

    function clearLine() {
        setReturnedToNormalGame(null)
        setCustomLine({ baseMoveNumber: moveNumber, moveNumber: -1, moves: [], arrows: {} })
        if (pageState === "analyzeCustom") setPageState("analyze")
    }

    function returnToMainline() {
        if (!hasLine) return
        setReturnedToNormalGame(null)
        setPageState("analyze")
        setCustomLine({ baseMoveNumber: moveNumber, moveNumber: -1, moves: [], arrows: {} })
    }

    function saveVariation() {
        if (!hasLine) return

        const createdAt = Date.now()
        const newVariation = {
            id: createVariationId(),
            name: `Variation ${variations.length + 1}`,
            baseMoveNumber: customLine.baseMoveNumber,
            moveNumber: customLine.moveNumber,
            moves: [...customLine.moves],
            arrows: { ...customLine.arrows },
            createdAt,
        }

        setVariations(prev => [...prev, newVariation])
    }

    function loadVariation(id: string) {
        const variation = variations.find(line => line.id === id)
        if (!variation) return

        setReturnedToNormalGame(null)
        setMoveNumber(variation.baseMoveNumber)
        setPageState("analyzeCustom")
        setCustomLine({
            baseMoveNumber: variation.baseMoveNumber,
            moveNumber: variation.moves.length ? Math.min(Math.max(variation.moveNumber, 0), variation.moves.length - 1) : -1,
            moves: [...variation.moves],
            arrows: { ...variation.arrows },
        })
    }

    function deleteVariation(id: string) {
        setVariations(prev => prev.filter(line => line.id !== id))
    }

    function jumpToMove(index: number) {
        if (!hasLine) return
        setReturnedToNormalGame(null)
        setPageState("analyzeCustom")
        setCustomLine(prev => ({ ...prev, moveNumber: index }))
    }

    return (
        <div className="w-[85%] flex flex-col gap-2 bg-backgroundBoxDarker rounded-borderRoundness px-3 py-2">
            <div className="flex flex-row items-center justify-between">
                <div className="font-extrabold text-foregroundGrey">Variation Explorer</div>
                <div className="flex flex-row gap-2">
                    {hasLine ? (
                        <button type="button" disabled={analyzingMove} onClick={saveVariation} className="text-sm font-bold px-2 py-1 rounded-borderRoundness bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover disabled:opacity-50">Save</button>
                    ) : null}
                    {hasLine && pageState !== "analyzeCustom" ? (
                        <button type="button" disabled={analyzingMove} onClick={openLine} className="text-sm font-bold px-2 py-1 rounded-borderRoundness bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover disabled:opacity-50">Open</button>
                    ) : null}
                    {hasLine && pageState === "analyzeCustom" ? (
                        <button type="button" disabled={analyzingMove} onClick={returnToMainline} className="text-sm font-bold px-2 py-1 rounded-borderRoundness bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover disabled:opacity-50">Back</button>
                    ) : null}
                    {hasLine ? (
                        <button type="button" disabled={analyzingMove} onClick={clearLine} className="text-sm font-bold px-2 py-1 rounded-borderRoundness bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover disabled:opacity-50">Clear</button>
                    ) : null}
                </div>
            </div>
            <div className="text-xs text-foregroundGrey">{baseLabel}</div>
            {hasLine ? (
                <ul className="flex flex-col gap-1">
                    {customLine.moves.map((move, index) => {
                        const ply = baseMoveNumber + 1 + index
                        const plyLabel = getPlyLabel(ply)
                        const isActive = index === customLine.moveNumber

                        return (
                            <li key={`${move.san}-${index}`} className="flex flex-row items-center gap-2">
                                <button type="button" disabled={analyzingMove} onClick={() => jumpToMove(index)} className={`text-left w-full px-2 py-1 rounded-borderRoundness ${isActive ? "bg-backgroundBoxBox text-foreground" : "text-foregroundGrey hover:bg-backgroundBoxBox"}`}>
                                    <span className="font-bold mr-2">{plyLabel}</span>
                                    <span className="font-extrabold">{move.san}</span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            ) : (
                <div className="text-xs text-foregroundGrey">Make a move on the board to start a variation.</div>
            )}
            <div className="border-t border-neutral-700/40 pt-2 text-xs text-foregroundGrey">Saved variations</div>
            {sortedVariations.length ? (
                <ul className="flex flex-col gap-1">
                    {sortedVariations.map((line) => {
                        const lineBaseMove = mainlineMoves[line.baseMoveNumber]
                        const lineLabel = line.baseMoveNumber === 0
                            ? "Start position"
                            : `After ${getPlyLabel(line.baseMoveNumber)} ${lineBaseMove?.san ?? ""}`

                        return (
                            <li key={line.id} className="flex flex-row items-center gap-2">
                                <button type="button" disabled={analyzingMove} onClick={() => loadVariation(line.id)} className="text-left w-full px-2 py-1 rounded-borderRoundness text-foregroundGrey hover:bg-backgroundBoxBox">
                                    <span className="font-bold mr-2">{line.name}</span>
                                    <span className="text-[10px] opacity-80">{lineLabel} • {line.moves.length} moves</span>
                                </button>
                                <button type="button" disabled={analyzingMove} onClick={() => deleteVariation(line.id)} className="text-xs font-bold px-2 py-1 rounded-borderRoundness bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover disabled:opacity-50">Delete</button>
                            </li>
                        )
                    })}
                </ul>
            ) : (
                <div className="text-xs text-foregroundGrey">No saved variations yet.</div>
            )}
        </div>
    )
}
