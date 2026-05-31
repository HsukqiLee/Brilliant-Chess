export default function Evaluation(props: { size: number, white: boolean, advantage: string[], whiteMoving: boolean, navTop: boolean }) {
    const { size, white, advantage, whiteMoving, navTop } = props

    const OLD_PERCENTS = [-400, 400]
    const NEW_PERCENTS = [5, 95]

    const advantageAmount = Number(advantage[1]) * (whiteMoving ? 1 : -1)

    const rawPercent = ((advantageAmount - OLD_PERCENTS[0]) * (NEW_PERCENTS[1] - NEW_PERCENTS[0])) / (OLD_PERCENTS[1] - OLD_PERCENTS[0]) + NEW_PERCENTS[0]
    let percent
    if (advantage[0] === 'mate') {
        if (advantage[1]) {
            percent = advantageAmount >= 0 ? 100 : 0
        } else {
            percent = whiteMoving ? 0 : 100
        }
    } else {
        percent = Math.min(Math.max(rawPercent, NEW_PERCENTS[0]), NEW_PERCENTS[1])
    }

    const winning = white ? percent >= 50 : percent <= 50

    let displayAdvantage
    if (advantage[0] === 'mate') {
        displayAdvantage = advantage[1] ?
            'M' + Math.abs(advantageAmount) :
            whiteMoving ? '0-1' : '1-0'
    } else {
        displayAdvantage = (Math.abs(advantageAmount) / 100).toFixed(1)
    }

    return (
        <div style={{ [navTop ? "width" : "height"]: size }} className={`vertical:w-9 navTop:w-7 h-7 bg-evaluationBarBlack overflow-hidden flex navTop:flex-col flex-row relative ${white ? "navTop:justify-end justify-start" : "navTop:justify-start justify-end"}`}>
            <div style={{ [navTop ? "width" : "height"]: `${percent}%`, transition: 'height 1.5s', willChange: 'height' }} className="w-full bg-evaluationBarWhite" />
            <div className="absolute h-full flex navTop:flex-col flex-row-reverse items-center justify-between w-full vertical:py-2 navTop:py-1 navTop:px-0 px-1 vertical:text-xs navTop:text-[9px] text-[11px] font-bold">
                <div style={{ opacity: !winning ? 100 : 0 }} className={`${white ? "text-foreground" : "text-background"}`}>{displayAdvantage}</div>
                <div style={{ opacity: winning ? 100 : 0 }} className={`${!white ? "text-foreground" : "text-background"}`}>{displayAdvantage}</div>
            </div>
        </div>
    )
}