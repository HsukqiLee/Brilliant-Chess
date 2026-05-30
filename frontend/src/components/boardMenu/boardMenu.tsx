"use client"

import { AnalyzeContext } from '@/context/analyze'
import { ConfigContext } from '@/context/config'
import Image from 'next/image'
import { useContext } from 'react'

export default function BoardMenu() {
    const analyzeContext = useContext(AnalyzeContext)
    const configContext = useContext(ConfigContext)

    const setWhite = analyzeContext.white[1]
    const setAnimation = analyzeContext.animation[1]

    const setOpenedMenu = configContext.openedMenu[1]
    const boardMenuSettingsRef = configContext.boardMenuSettingsRef

    function flipBoard() {
        setAnimation(false)
        setWhite(prev => !prev)
    }

    return (
        <div className="flex flex-col justify-between h-full">
            <div className='flex navTop:flex-col flex-row-reverse gap-2'>
                <button className='outline-none' ref={boardMenuSettingsRef} onClick={() => setOpenedMenu(prev => prev === "settings" ? null : "settings")} type='button'><Image className='min-w-[17px]' src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/settings.svg`} title='Settings' alt="Settings" width={17} height={17} /></button>
                <button className='outline-none' onClick={flipBoard} type='button'><Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/flip.svg`} title='Flip Board' alt="Flip Board" width={17} height={17} className='min-w-[17px]' /></button>
            </div>
            <div>

            </div>
        </div>
    )
}