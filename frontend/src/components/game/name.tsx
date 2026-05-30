import { PieceSymbol } from "chess.js"
import Profile from "../svg/profile"
import CapturedPieces from "./capturedPieces"
import { maxVertical } from "../../../tailwind.config"
import { useEffect, useState } from "react"

export default function Name(props: { white: boolean, children: React.ReactNode, captured: PieceSymbol[], materialAdvantage: number }) {
    const [profileSize, setProfileSize] = useState(40)

    const { white, captured, materialAdvantage } = props
    const name = props.children

    useEffect(() => {
        function resizeProfile() {
            setProfileSize(window.innerWidth < maxVertical ? 24 : 40)
        }

        resizeProfile()

        window.addEventListener('resize', resizeProfile)

        return () => window.removeEventListener('resize', resizeProfile)
    }, [])

    return (
        <div className="flex flex-row items-start vertical:text-sm text-[10px] font-bold text-foregroundHighlighted vertical:gap-2 gap-[6px] flex-grow overflow-x-auto overflow-y-hidden">
            <div className={`vertical:h-11 vertical:w-11 h-7 w-7 flex flex-row justify-center items-end ${white ? "bg-backgroundProfileWhite" : "bg-backgroundProfileBlack"}`}>
                <Profile width={profileSize} height={profileSize} class={`${white ? "fill-foregroundProfileWhite" : "fill-foregroundProfileBlack"}`} />
            </div>
            <div className="flex flex-col justify-between h-7 vertical:h-11">
                <span className="h-fit vertical:pb-[1px] vertical:pt-[2px] select-text text-nowrap">{name}</span>
                <CapturedPieces advantage={materialAdvantage} white={white} pieces={captured} />
            </div>
        </div>
    )
}