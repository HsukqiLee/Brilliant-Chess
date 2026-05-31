"use client"

import { useEffect, useRef, useState, useMemo } from "react"

interface TablebaseMove {
    uci: string
    san: string
    dtz: number | null
    precise_dtz: number | null
    dtc: number | null
    dtm: number | null
    category: string
}

interface TablebaseResponse {
    dtz: number | null
    precise_dtz: number | null
    dtc: number | null
    dtm: number | null
    checkmate: boolean
    stalemate: boolean
    insufficient_material: boolean
    category: string
    moves: TablebaseMove[]
}

function getPieceCount(fen: string): number {
    const boardPart = fen.split(" ")[0]
    const pieceRegex = /[pnbrqk]/i
    let count = 0
    for (const char of boardPart) {
        if (pieceRegex.test(char)) {
            count++
        }
    }
    return count
}

export default function TablebaseExplorer(props: { fen?: string }) {
    const { fen } = props

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<TablebaseResponse | null>(null)

    const cacheRef = useRef<Map<string, TablebaseResponse>>(new Map())

    const pieceCount = useMemo(() => {
        if (!fen) return 0
        return getPieceCount(fen)
    }, [fen])

    const activeColor = useMemo(() => {
        if (!fen) return "w"
        return fen.split(" ")[1] // 'w' or 'b'
    }, [fen])

    useEffect(() => {
        if (!fen || pieceCount > 7) {
            setData(null)
            setError(null)
            return
        }

        const cached = cacheRef.current.get(fen)
        if (cached) {
            setData(cached)
            setError(null)
            return
        }

        const controller = new AbortController()

        async function fetchTablebase() {
            setLoading(true)
            setError(null)

            try {
                const response = await fetch(
                    `https://tablebase.lichess.ovh/standard?fen=${encodeURIComponent(fen || "")}`,
                    { signal: controller.signal }
                )

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }

                const json = (await response.json()) as TablebaseResponse
                cacheRef.current.set(fen!, json)
                setData(json)
            } catch (err: any) {
                if (err?.name === "AbortError") return
                setError("Failed to query Tablebase API.")
                setData(null)
            } finally {
                setLoading(false)
            }
        }

        fetchTablebase()

        return () => controller.abort()
    }, [fen, pieceCount])

    if (!fen) return null

    // If pieces > 7, display a neat, unobtrusive informative message
    if (pieceCount > 7) {
        return (
            <div className="w-[85%] flex flex-col gap-1.5 bg-backgroundBoxDarker rounded-borderRoundness px-3 py-2 border border-neutral-800/40 opacity-80">
                <div className="flex flex-row items-center justify-between text-xs font-bold text-foregroundGrey">
                    <span className="flex items-center gap-1.5">🗂️ Syzygy Tablebase</span>
                    <span className="text-[10px] bg-backgroundBoxBox px-1.5 py-0.5 rounded-borderRoundness font-mono">
                        {pieceCount} pieces
                    </span>
                </div>
                <div className="text-[10px] text-foregroundGrey italic leading-tight">
                    Active in endgames with 7 or fewer pieces remaining.
                </div>
            </div>
        )
    }

    const sideToMove = activeColor === "w" ? "White" : "Black"
    const otherSide = activeColor === "w" ? "Black" : "White"

    const getOutcomeText = (category: string) => {
        switch (category) {
            case "win":
                return `${sideToMove} Wins`
            case "loss":
                return `${otherSide} Wins`
            case "draw":
                return "Draw"
            case "cursed-win":
                return `${sideToMove} Wins (Cursed by 50-move rule)`
            case "blessed-loss":
                return `${otherSide} Wins (Blessed by 50-move rule)`
            default:
                return category.toUpperCase()
        }
    }

    const getOutcomeColor = (category: string) => {
        if (category.includes("win")) return "text-highlightGreat bg-highlightGreat/10 border-highlightGreat/30"
        if (category.includes("loss")) return "text-highlightBlunder bg-highlightBlunder/10 border-highlightBlunder/30"
        return "text-highlightBook bg-highlightBook/10 border-highlightBook/30"
    }

    const getMoveOutcomeLabel = (category: string) => {
        // For moves, the category represents the resulting position.
        // If resulting position is 'loss', it means the opponent loses, which means this move is a WIN for the side playing it!
        // If resulting position is 'win', it means the opponent wins, which means this move is a LOSS for the side playing it!
        if (category === "loss") return "WIN"
        if (category === "win") return "LOSS"
        if (category === "draw") return "DRAW"
        if (category === "cursed-win") return "LOSS (Cursed)"
        if (category === "blessed-loss") return "WIN (Blessed)"
        return category.toUpperCase()
    }

    const getMoveOutcomeColor = (category: string) => {
        if (category === "loss" || category === "blessed-loss") return "bg-highlightGreat/20 text-highlightGreat border border-highlightGreat/45"
        if (category === "win" || category === "cursed-win") return "bg-highlightBlunder/20 text-highlightBlunder border border-highlightBlunder/45"
        return "bg-neutral-800 text-foregroundGrey border border-neutral-700/50"
    }

    const getDtmDtzLabel = (m: TablebaseMove) => {
        if (m.dtm !== null) return `M${Math.abs(m.dtm)}`
        if (m.dtz !== null) return `Z${Math.abs(m.dtz)}`
        return ""
    }

    return (
        <div className="w-[85%] flex flex-col gap-2 bg-backgroundBoxDarker rounded-borderRoundness px-3 py-2 border border-neutral-750">
            <div className="flex flex-row items-center justify-between text-xs font-bold text-foregroundGrey">
                <span className="flex items-center gap-1.5 font-extrabold text-foreground">
                    🗂️ Syzygy Tablebase
                </span>
                <span className="text-[10px] bg-backgroundBoxBox px-1.5 py-0.5 rounded-borderRoundness font-mono text-foreground font-extrabold">
                    {pieceCount} pieces
                </span>
            </div>

            {loading && <div className="text-xs text-foregroundGrey py-1">Probing Syzygy Tablebase...</div>}
            {error && <div className="text-xs text-highlightMistake py-1">{error}</div>}

            {data && !loading && (
                <div className="flex flex-col gap-2">
                    {/* Header outcome summary */}
                    <div className={`flex flex-row items-center justify-between text-xs font-bold border px-2 py-1.5 rounded-borderRoundness ${getOutcomeColor(data.category)}`}>
                        <span>{getOutcomeText(data.category)}</span>
                        {data.dtm !== null && (
                            <span className="font-mono">DTM: {Math.abs(data.dtm)}</span>
                        )}
                        {data.dtm === null && data.dtz !== null && (
                            <span className="font-mono">DTZ: {Math.abs(data.dtz)}</span>
                        )}
                    </div>

                    {/* Special board states */}
                    {data.checkmate && <div className="text-xs text-highlightGreat font-bold">Position is Checkmate.</div>}
                    {data.stalemate && <div className="text-xs text-highlightBook font-bold">Position is Stalemate.</div>}
                    {data.insufficient_material && <div className="text-xs text-foregroundGrey">Insufficient material to force mate.</div>}

                    {/* Tablebase Moves */}
                    {data.moves && data.moves.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                            <div className="text-[10px] font-bold text-foregroundGrey uppercase tracking-wider">Tablebase Moves</div>
                            <ul className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                                {data.moves.map((m) => {
                                    const label = getDtmDtzLabel(m)
                                    return (
                                        <li
                                            key={m.uci}
                                            className="flex flex-row justify-between items-center text-xs bg-backgroundBoxBox/45 hover:bg-backgroundBoxBox border border-neutral-800 px-2 py-1.5 rounded-borderRoundness"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-foreground">{m.san}</span>
                                                <span className="text-[9px] text-foregroundGrey font-mono opacity-80 uppercase">({m.uci})</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {label && (
                                                    <span className="text-[9px] font-mono font-bold bg-backgroundBoxBox px-1 py-0.2 rounded-borderRoundness border border-neutral-700/30">
                                                        {label}
                                                    </span>
                                                )}
                                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-borderRoundness ${getMoveOutcomeColor(m.category)}`}>
                                                    {getMoveOutcomeLabel(m.category)}
                                                </span>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ) : (
                        !data.checkmate && !data.stalemate && (
                            <div className="text-xs text-foregroundGrey">No moves available.</div>
                        )
                    )}
                </div>
            )}
        </div>
    )
}
