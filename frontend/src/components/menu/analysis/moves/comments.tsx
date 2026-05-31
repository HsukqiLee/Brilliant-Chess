"use client"

import { useState, useEffect } from "react"
import RatingSVG from "@/components/svg/rating"
import { moveRating } from "@/engine/stockfish"

const RATING_FORMATS_GUIDE = {
    _isA_Move: 'is a _ move',
    _isAn_Move: 'is an _ move',
    _is_: 'is _',
    _isAn_: 'is an _',
    _isA_: 'is a _',
}

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
}

export function FormatEval(props: {evaluation: string[], white: boolean, smaller?: boolean, best?: boolean}) {
    const { evaluation, white, smaller, best } = props

    const number = (Number(evaluation[1]) / 100) * (white ? 1 : -1)
            
    let prevChar = ''
    if (number > 0) prevChar = '+'
    if (number < 0) prevChar = '-'

    return (
        <div style={{ fontSize: smaller ? "14px" : "", padding: smaller ? "2px" : "", width: smaller ? "46px" : "", backgroundColor: prevChar === '-' ? 'var(--evaluationBarBlack)' : 'var(--evaluationBarWhite)', color: prevChar === '-' ? 'var(--foreground)' : 'var(--foregroundBlack)', filter: prevChar === '-' ? '' : 'brightness(0.9)'}} className="rounded-borderRoundness py-1 font-extrabold w-[61px] text-center shrink-0">
            {(() => {
                if (evaluation[0] === 'mate' && evaluation[1]) {
                    return prevChar + "M" + (Math.abs(Number(evaluation[1])) - Number(Boolean(best)))
                } else if (!evaluation[1]) {
                    if (white) return '0-1'
                    else return '1-0'
                } else {
                    return prevChar + Math.abs(number).toFixed(2)
                }
            })()}
        </div>
    )
}

interface CommentsProps {
    comment?: string
    rating?: moveRating
    moveSan?: string
    evaluation: string[]
    white: boolean
    overallGameComment: string
    fen?: string
    bestMove?: string
    evalBefore?: string[]
    evalAfter?: string[]
}

export default function Comments(props: CommentsProps) {
    const { comment, rating, moveSan, evaluation, white, overallGameComment, fen, bestMove, evalBefore, evalAfter } = props

    const [aiComment, setAiComment] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [aiCache, setAiCache] = useState<Record<string, string>>({})

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    const isBackendEnabled = Boolean(backendUrl)

    // Reset or load cached AI comment when FEN changes
    useEffect(() => {
        if (fen) {
            if (aiCache[fen]) {
                setAiComment(aiCache[fen])
            } else {
                setAiComment(null)
            }
            setError(null)
        }
    }, [fen, aiCache])

    const fetchAiComment = async () => {
        if (!fen || !isBackendEnabled) return
        setLoading(true)
        setError(null)

        const formatEvalString = (ev: string[] | undefined) => {
            if (!ev || ev.length < 2) return "0.00"
            if (ev[0] === "mate") return `M${ev[1]}`
            const num = Number(ev[1]) / 100
            return num >= 0 ? `+${num.toFixed(2)}` : num.toFixed(2)
        }

        try {
            const response = await fetch(`${backendUrl}/api/ai/commentary`, {
                method: "POST",
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
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const json = await response.json()
            const text = json.commentary
            setAiComment(text)
            setAiCache(prev => ({ ...prev, [fen]: text }))
        } catch (err: any) {
            setError("Failed to fetch AI Coach review. Please try again.")
            console.error("AI Coach error:", err)
        } finally {
            setLoading(false)
        }
    }

    if (!comment || !rating || !moveSan) {
        return (
            <div className="bg-white w-[85%] rounded-borderExtraRoundness p-4 font-bold text-lg text-foregroundBlack" dangerouslySetInnerHTML={{ __html: overallGameComment }} />
        )
    }

    return (
        <div style={{backgroundColor: "#ffffff"}} className="min-h-44 w-[85%] p-4 rounded-borderExtraRoundness text-foregroundBlack text-lg font-bold flex flex-col gap-2 shadow-sm">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row items-center gap-2 min-w-0">
                    <RatingSVG draggable rating={rating} size={32} />
                    <span className="truncate">{moveSan} {RATING_FORMATS[rating].replace('_', rating)}</span>
                </div>
                <FormatEval evaluation={evaluation} white={white} />
            </div>
            
            <div className="text-sm font-semibold text-neutral-600 leading-normal mb-1">
                {comment}
            </div>

            {isBackendEnabled && (
                <div className="border-t border-neutral-100 pt-2 mt-1">
                    {aiComment ? (
                        <div className="bg-neutral-50 border border-neutral-100/70 p-2.5 rounded-borderRoundness text-xs font-semibold text-neutral-800 leading-relaxed">
                            <div className="flex items-center justify-between font-bold text-neutral-500 text-[10px] uppercase tracking-wider mb-1">
                                <span>✨ AI Coach Commentary</span>
                                <button 
                                    onClick={fetchAiComment} 
                                    className="text-[10px] text-highlightGreat hover:underline bg-transparent border-none cursor-pointer p-0 font-bold"
                                    disabled={loading}
                                >
                                    Regenerate
                                </button>
                            </div>
                            <p className="whitespace-pre-wrap">{aiComment}</p>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center gap-2 py-3 text-xs text-neutral-500 font-bold animate-pulse">
                            <span>✨ AI Coach is reviewing the move...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col gap-1.5 py-1">
                            <span className="text-xs text-highlightBlunder">{error}</span>
                            <button
                                type="button"
                                onClick={fetchAiComment}
                                className="text-[10px] text-highlightGreat font-extrabold hover:underline self-start bg-transparent border-none cursor-pointer p-0"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={fetchAiComment}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-borderRoundness bg-highlightGreat text-white hover:bg-highlightGreat/95 transition-colors text-xs font-extrabold cursor-pointer border-none shadow-sm"
                        >
                            <span>✨ AI Coach Review (智能点评)</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}