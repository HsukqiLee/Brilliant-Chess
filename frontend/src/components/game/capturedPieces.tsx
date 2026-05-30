import { BISHOP, BLACK, KNIGHT, PAWN, PieceSymbol, QUEEN, ROOK, WHITE } from "chess.js";
import { maxVertical } from "../../../tailwind.config";
import SimplePieceSVG from "../svg/simplePiece";

const PIECES_ORDER: PieceSymbol[] = [ PAWN, BISHOP, KNIGHT, ROOK, QUEEN ]

function formatAdvantage(advantage: number) {
    return advantage > 0 ? `+${advantage}` : ''
}

export default function CapturedPieces(props: { white: boolean, pieces: PieceSymbol[], advantage: number }) {
    const { white, pieces, advantage } = props

    const groupedPieces = pieces.reduce((acc: { [key: string]: number }, piece: PieceSymbol) => {
        acc[piece] = acc[piece] ? acc[piece] + 1 : 1
        return acc
    }, {})

    return (
        <div className="flex flex-row h-full items-end vertical:gap-2 gap-1">
            <div className="w-fit h-full flex flex-row ml-[-3px]">
                {Object.entries(groupedPieces).sort((a, b) => PIECES_ORDER.indexOf(a[0] as PieceSymbol) - PIECES_ORDER.indexOf(b[0] as PieceSymbol)).map(([piece, count], i) => {
                    const outlineColor = "var(--border)"
                    const smallSize = window.innerWidth < maxVertical ? 8 : 15
                    const mediumSize = window.innerWidth < maxVertical ? 10 : 17
                    const bigSize = window.innerWidth < maxVertical ? 12 : 19
                    return (
                        <div className="mb-[1px] flex flex-row items-end" key={i}>
                            {Array.from({ length: count }).map((_, i) => {
                                return <SimplePieceSVG
                                    key={i}
                                    piece={piece as PieceSymbol}
                                    color={white ? WHITE : BLACK}
                                    size={piece === PAWN ? smallSize : piece === ROOK || piece === KNIGHT || piece === BISHOP ? mediumSize : bigSize}
                                    className={`${piece === PAWN ? 'mx-[2px]' : piece === ROOK || piece === KNIGHT || piece === BISHOP ? 'mx-[1px]' : ''} ${i !== 0 ? 'vertical:ml-[-10px] ml-[-7px]' : ''}`}
                                    draggable
                                    style={{filter: `drop-shadow(1px 0 0 ${outlineColor}) drop-shadow(-1px 0 0 ${outlineColor}) drop-shadow(0 1px 0 ${outlineColor}) drop-shadow(0 -1px 0 ${outlineColor})`}}
                                />
                            })}
                        </div>
                    )
                })}
            </div>
            <span className="text-foregroundGrey h-fit font-light text-[8px] vertical:text-[17px]">{white ? formatAdvantage(advantage) : formatAdvantage(-advantage)}</span>
        </div>
    )
}