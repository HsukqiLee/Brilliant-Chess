"use client"

import { useContext, useEffect, useRef, useState } from "react";
import NextMove from "../../svg/nextMove";
import Play from "../../svg/play";
import SkipGame from "../../svg/skipGame";
import Pause from "../../svg/pause";
import { AnalyzeContext } from "@/context/analyze";

export default function GameButtons() {
    const [playPauseHover, setPlayPauseHover] = useState(false)

    const analyzeContext = useContext(AnalyzeContext)

    const [playing] = analyzeContext.playing
    const [moveNumber] = analyzeContext.moveNumber
    const gameController = analyzeContext.gameController

    const moveNumberRef = useRef(moveNumber)

    useEffect(() => {
        moveNumberRef.current = moveNumber
    }, [moveNumber])

    function previousMove() {
        gameController.back()
    }

    function nextMove() {
        gameController.forward()
    }

    function firstMove() {
        gameController.first()
    }

    function lastMove() {
        gameController.last()
    }

    function play() {
        gameController.play()
    }

    function pause() {
        gameController.pause()
    }

    return (
        <div className="w-[85%] rounded-borderRoundness p-3 flex flex-row justify-around items-center">
            <SkipGame click={firstMove} class="h-[45px] rotate-180 fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
            <NextMove click={previousMove} class="h-[25px] rotate-180 fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
            <div onMouseEnter={() => setPlayPauseHover(true)} onMouseLeave={() => setPlayPauseHover(false)}>
                <Play click={play} class={`h-[25px] transition-colors pl-1 ${playPauseHover ? 'fill-foregroundHighlighted' : 'fill-foregroundGrey'} ${playing ? 'hidden' : ''}`} />
                <Pause click={pause} class={`h-[25px] transition-colors pr-1 ${playPauseHover ? 'fill-foregroundHighlighted' : 'fill-foregroundGrey'} ${!playing ? 'hidden' : ''}`} />
            </div>
            <NextMove click={nextMove} class="h-[25px] fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
            <SkipGame click={lastMove} class="h-[45px] fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
        </div>
    )
}