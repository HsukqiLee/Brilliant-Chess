import { useContext, useEffect, useRef, useState } from "react"
import Lens from "../../svg/lens"
import LoadingBar from "./loadingBar"
import { AnalyzeContext } from "@/context/analyze"

export default function Loading(props: { format: string, analyzeController?: AbortController }) {
    const [ellipsis, setEllipsis] = useState('')

    const analyzeContext = useContext(AnalyzeContext)

    const [progress] = analyzeContext.progress

    const progressRef = useRef(progress)
    const ellipsisRef = useRef(ellipsis)

    const { format, analyzeController } = props

    useEffect(() => {
        ellipsisRef.current = ellipsis
    }, [ellipsis])

    useEffect(() => {
        function animateEllipsis() {
            const ellipsis = ellipsisRef.current

            if (ellipsis.length >= 3) {
                setEllipsis('')
            } else {
                setEllipsis(ellipsis + '.')
            }
        }

        const ellipsisInterval = setInterval(animateEllipsis, 300)

        return () => clearInterval(ellipsisInterval)
    }, [])

    useEffect(() => {
        progressRef.current = progress
    }, [progress])

    function cancel() {
        analyzeController?.abort()
    }

    return (
        <div className="flex flex-col flex-grow">
            <div className="text-lg font-bold text-foregroundGrey px-5 pb-5 w-full">Analyzing{ellipsis}</div>
            <hr className="border-neutral-600" />
            <div className="flex-grow flex flex-col justify-center items-center relative">
                <div className="w-[70%] bg-backgroundBox relative overflow-hidden rounded-borderExtraRoundness text-lg text-foregroundGrey flex flex-col gap-14 pb-4 pt-14 items-center">
                    <div className="w-36 flex flex-col items-center gap-4">
                        <Lens class="animate-[pulse_1.25s_cubic-bezier(0.4,_0,_0.6,_1)_infinite;] scale-x-[-1] fill-backgroundBoxBoxHighlighted" size={60} />
                        <span className="text-xl text-foreground font-bold">{format.toUpperCase()}</span>
                        <span className="w-full">Analyzing Game{ellipsis}</span>
                    </div>
                    <button onClick={cancel} className="hover:text-foreground transition-colors" type="button">Cancel</button>
                    <LoadingBar progress={progress} transitionTime={100} />
                </div>
            </div>
        </div>
    )
}