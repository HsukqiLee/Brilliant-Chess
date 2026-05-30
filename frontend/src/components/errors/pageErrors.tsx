"use client"

import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from "react"
import { ErrorsContext, PageErrorProps } from "@/context/errors"

const TIME_IN_SCREEN = 7500

export type Corner = "tl" | "tr" | "bl" | "br"

const CORNER: Corner = "br"

function PageError(props: { title: string, description?: string, errorKey: number, removeError: (errorKey: number) => void, newErrorKey: number, y: string, type: PageErrorProps['type'] }) {
    const { title, description, errorKey, removeError, newErrorKey, y, type } = props

    const [hided, setHided] = useState(true)

    const errorRef = useRef<HTMLDivElement>(null)

    function removeCurrentError() {
        setHided(true)
        setTimeout(() => removeError(errorKey), 150)
    }

    useEffect(() => {
        setTimeout(() => {
            removeCurrentError()
        }, TIME_IN_SCREEN)
            
        setHided(false)
    }, [])

    useEffect(() => {
        if (newErrorKey === errorKey) return

        const newErrorElement = document.querySelector(`[data-errorkey="${newErrorKey}"]`) as HTMLDivElement

        if (!newErrorElement || !errorRef.current) return


        const newErrorHeight = newErrorElement.offsetHeight

        errorRef.current.animate([
            {transform: `translateY(${newErrorHeight * (y === 't' ? -1 : 1)}px)`},
            {transform: 'translateY(0px)'},
        ],{
            duration: 50,
        })
    }, [newErrorKey])

    return (
        <div ref={errorRef} data-errorkey={errorKey} style={{opacity: hided ? 0 : 100, backgroundColor: type === 'error' ? 'var(--error)' : type === 'warning' ? 'var(--warning)' : ''}} className="p-3 text-xl select-text z-[999] text-foregroundHighlighted font-bold rounded-borderRoundness hover:scale-105 will-change-transform transition-all max-w-96">
            { title }
            <div style={{display: description ? '' : 'none'}} className="text-base opacity-85 mt-2">
                { description }
            </div>
        </div>
    )
}

let errorKey = 0

export default function PageErrors() {
    const errorsContext = useContext(ErrorsContext)

    const [errors, setErrors] = errorsContext.errors

    const x = CORNER.substring(1, 2)
    const y = CORNER.substring(0, 1)

    const removeError = (errorKey: number) => {
        setErrors(prev => prev.filter(error => error.errorKey !== errorKey))
    }

    return (
        <div className="absolute w-fit flex m-5 gap-2" style={{top: y === "t" ? 0 : '', bottom: y === "b" ? 0 : '', right: x === "r" ? 0 : '', left: x === "l" ? 0 : '', flexDirection: y === "b" ? "column" : "column-reverse", alignItems: x === 'r' ? 'flex-end' : 'flex-start'}}>
            {errors.map(error => <PageError key={error.errorKey} {...error} removeError={removeError} newErrorKey={errors[errors.length - 1].errorKey} y={y} type={error.type} />)}
        </div>
    )
}

export async function pushPageError(setErrors: Dispatch<SetStateAction<PageErrorProps[]>>, title: string, description?: string) {
    errorKey++
    setErrors(prev => [...prev, {title, description, type: 'error', errorKey}])
}

export async function pushPageWarning(setErrors: Dispatch<SetStateAction<PageErrorProps[]>>, title: string, description?: string) {
    errorKey++
    setErrors(prev => [...prev, {title, description, type: 'warning' , errorKey}])
}