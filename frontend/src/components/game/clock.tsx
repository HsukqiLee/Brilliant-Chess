import { Color } from "chess.js"

export default function Clock(props: { white: boolean, colorMoving: Color, children: React.ReactNode }) {
    const { white, colorMoving } = props
    const time = props.children

    const moving = white ? colorMoving === 'w' : colorMoving === 'b'

    return (
        <div className={`flex text-nowrap justify-end vertical:pr-3 pr-[6px] vertical:text-2xl text-base font-bold items-center vertical:h-11 h-7 vertical:min-w-36 vertical:max-w-36 min-w-16 max-w-16 rounded-borderRoundness ${moving ? "" : "opacity-50"} ${white ? "bg-backgroundWhiteClock" : "bg-backgroundBlackClock"} ${white ? "text-backgroundBlackClock" : "text-backgroundWhiteClock"}`}>
            {time}
        </div>
    )
}