"use client"

import { createContext, useState, Dispatch, SetStateAction, useRef } from 'react'

export type menu = "settings" | null

export interface usedRatings {
    brilliant: boolean,
    great: boolean,
    best: boolean,
    excellent: boolean,
    good: boolean,
    book: boolean,
    inaccuracy: boolean,
    mistake: boolean,
    miss: boolean,
    blunder: boolean,
    forced: boolean,
}

export const defaultUsedRatings: usedRatings = {
    brilliant: true,
    great: true,
    best: true,
    excellent: true,
    good: true,
    book: true,
    inaccuracy: true,
    mistake: true,
    miss: true,
    blunder: true,
    forced: true,
}

export const ConfigContext = createContext<{
    openedMenu: [menu, Dispatch<SetStateAction<menu>>],
    boardTheme: [number, Dispatch<SetStateAction<number>>],
    usedRatings: [usedRatings, Dispatch<SetStateAction<usedRatings>>],
    highlightByRating: [boolean, Dispatch<SetStateAction<boolean>>],
    showArrows: [boolean, Dispatch<SetStateAction<boolean>>],
    arrowAfterMove: [boolean, Dispatch<SetStateAction<boolean>>],
    showLegalMoves: [boolean, Dispatch<SetStateAction<boolean>>],
    animateMoves: [boolean, Dispatch<SetStateAction<boolean>>],
    boardSounds: [boolean, Dispatch<SetStateAction<boolean>>],

    boardMenuSettingsRef: React.MutableRefObject<HTMLButtonElement | null>,
}>({
    openedMenu: [null, () => { }],
    boardTheme: [0, () => { }],
    usedRatings: [defaultUsedRatings, () => { }],
    highlightByRating: [true, () => { }],
    showArrows: [true, () => { }],
    arrowAfterMove: [true, () => { }],
    showLegalMoves: [true, () => { }],
    animateMoves: [true, () => { }],
    boardSounds: [true, () => { }],

    boardMenuSettingsRef: { current: null },
})

export default function ConfigContextProvider(props: { children: React.ReactNode }) {
    const [openedMenu, setOpenedMenu] = useState<menu>(null)
    const [boardTheme, setBoardTheme] = useState<number>(0)
    const [usedRatings, setUsedRatings] = useState<usedRatings>(defaultUsedRatings)
    const [highlightByRating, setHighlightByRating] = useState<boolean>(true)
    const [showArrows, setShowArrows] = useState<boolean>(true)
    const [arrowAfterMove, setArrowAfterMove] = useState<boolean>(true)
    const [showLegalMoves, setShowLegalMoves] = useState<boolean>(true)
    const [animateMoves, setAnimateMoves] = useState<boolean>(true)
    const [boardSounds, setBoardSounds] = useState<boolean>(true)

    const boardMenuSettingsRef = useRef<HTMLButtonElement>(null)

    return (
        <ConfigContext.Provider value={{ boardTheme: [boardTheme, setBoardTheme], openedMenu: [openedMenu, setOpenedMenu], usedRatings: [usedRatings, setUsedRatings], highlightByRating: [highlightByRating, setHighlightByRating], showArrows: [showArrows, setShowArrows], arrowAfterMove: [arrowAfterMove, setArrowAfterMove], showLegalMoves: [showLegalMoves, setShowLegalMoves], animateMoves: [animateMoves, setAnimateMoves], boardSounds: [boardSounds, setBoardSounds], boardMenuSettingsRef: boardMenuSettingsRef }}>
            {props.children}
        </ConfigContext.Provider>
    )
}