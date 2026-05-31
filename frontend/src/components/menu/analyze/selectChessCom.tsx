import { useContext, useEffect, useRef, useState } from "react"
import Arrow from "../../svg/arrow"
import { AnalyzeContext, Data } from "@/context/analyze"
import { pushPageError } from "@/components/errors/pageErrors"
import { Chess } from "chess.js"
import Files from "@/components/svg/files"
import { ErrorsContext } from "@/context/errors"

export const GAMES_ERROR = ["Error fetching games", "Check your internet connection or try again later."]
export const USER_ERROR = ["User not found", "Check your spelling or your internet connection."]

export const API_BLOCKING_ERROR = ["Server might block excesive requests", "Slow down your request rate or wait before you try again."]

interface Game {
    url: string
    pgn: string
    time_control: string
    end_time: number
    rated: boolean
    accuracies: {
        white: number
        black: number
    }
    tcn: string
    uuid: string
    initial_setup: string
    fen: string
    time_class: string
    rules: string
    white: {
        rating: number
        result: string
        "@id": string
        username: string
        uuid: string
    }
    black: {
        rating: number
        result: string
        "@id": string
        username: string
        uuid: string
    }
    eco: string
}

const PLAYER_URL = 'https://www.chess.com/member/'

export function getMonthName(month: number) {
    switch (month) {
        case 1: return 'January'
        case 2: return 'February'
        case 3: return 'March'
        case 4: return 'April'
        case 5: return 'May'
        case 6: return 'June'
        case 7: return 'July'
        case 8: return 'August'
        case 9: return 'September'
        case 10: return 'October'
        case 11: return 'November'
        case 12: return 'December'
        default: return ''
    }
}

export function capitalizeFirst(string: string) {
    return string[0].toUpperCase() + string.substring(1).toLowerCase()
}

export function Loading(props: {whatIsLoading: string, abort: () => void}) {
    const [ellipsis, setEllipsis] = useState('')

    const ellipsisRef = useRef(ellipsis)

    useEffect(() => {ellipsisRef.current = ellipsis}, [ellipsis])

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

    return (
                <div className="flex flex-col flex-grow">
                    <div className="flex-grow flex flex-col justify-center items-center">
                        <div className="w-[70%] bg-backgroundBox relative overflow-hidden rounded-borderExtraRoundness text-lg text-foregroundGrey flex flex-col gap-14 pb-4 pt-14 items-center">
                            <div className="w-40 flex flex-col items-center gap-4">
                                <Files className="animate-[pulse_1.25s_cubic-bezier(0.4,_0,_0.6,_1)_infinite;] scale-x-[-1]" size={60} />
                                <span className="text-xl text-foreground font-bold">{props.whatIsLoading}</span>
                                <span className="w-full ml-14">Fetching api{ellipsis}</span>
                            </div>
                            <button onClick={props.abort} className="hover:text-foreground transition-colors" type="button">Cancel</button>
                        </div>
                    </div>
                </div>
    )
}

export function SimpleLoading(props: {whatIsLoading: string}) {
    const [ellipsis, setEllipsis] = useState('')

    const ellipsisRef = useRef(ellipsis)

    useEffect(() => {ellipsisRef.current = ellipsis}, [ellipsis])

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

    return (
        <div className="font-extrabold text-2xl animate-[pulse_1.25s_cubic-bezier(0.4,_0,_0.6,_1)_infinite;] w-48 my-4 m-auto">
            Loading {props.whatIsLoading}{ellipsis}
        </div>
    )
}

interface gameInfo {
    pgn: string
    whiteName: string
    blackName: string
    whiteElo: number
    blackElo: number
    result: 'white' | 'black' | 'draw'
    timestamp: number
    timeClass: string
}

export function GamesUI(props: { gamesInfo: gameInfo[], loading: boolean, username: string, setData: (data: Data) => void, depth: number }) {
    const { gamesInfo, loading, username, setData } = props

    return (
        <>
            {loading ? <SimpleLoading whatIsLoading="games" /> : null}
            <div className="w-full overflow-auto max-h-[400px]">
                <table className="w-full">
                    <thead style={{display: loading ? 'none' : ''}}>
                        <tr>
                            <th className="py-2 text-left pl-8">Players</th>
                            <th className="py-2 text-left pl-3 pr-4">Result</th>
                            <th className="py-2 text-left pr-4 notFullDate:pr-8"><span className="notFullDate:block hidden">Date</span><span className="notFullDate:hidden block">Day</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {gamesInfo.map((gameInfo, i) => {
                            const { pgn, whiteName, blackName, whiteElo, blackElo, result, timestamp, timeClass } = gameInfo

                            const whiteWon = result === 'white'
                            const blackWon = result === 'black'
                            // const draw = result === 'draw'

                            const isWin = (whiteWon && whiteName.toLowerCase() === username.toLowerCase()) || (blackWon && blackName.toLowerCase() === username.toLowerCase())
                            const isLoss = (whiteWon && whiteName.toLowerCase() !== username.toLowerCase()) || (blackWon && blackName.toLowerCase() !== username.toLowerCase())

                            const date = new Date(timestamp)

                            return (
                                <tr title={`Time Class: ${capitalizeFirst(timeClass)}`} onClick={() => setData({format: 'pgn', string: pgn })} className="border-b-[1px] cursor-pointer select-none border-border transition-colors hover:bg-backgroundBoxHover" key={i}>
                                    <td className="text-base flex flex-col py-4 w-60 overflow-hidden pl-8">
                                        <div className="flex flex-row items-center gap-2"><div className={`h-4 min-h-4 w-4 min-w-4 bg-evaluationBarWhite rounded-borderRoundness ${whiteWon ? 'border-[3px] border-winGreen' : ''}`} />{whiteName} ({whiteElo})</div>
                                        <div className="flex flex-row items-center gap-2"><div className={`h-4 w-4 bg-evaluationBarBlack rounded-borderRoundness ${blackWon ? 'border-[3px] border-winGreen' : ''}`} />{blackName} ({blackElo})</div>
                                    </td>
                                    <td className="py-2 pl-3 pr-4">
                                        <div className="flex flex-row items-center gap-2">
                                            <div className="flex w-4 flex-col text-foregroundGrey font-bold text-base"><span>{whiteWon ? 1 : blackWon ? 0 : <>&#189;</>}</span><span>{blackWon ? 1 : whiteWon ? 0 : <>&#189;</>}</span></div>
                                            <div style={{ mixBlendMode: 'screen' }} className={`h-4 w-4 rounded-borderRoundness text-lg font-extrabold flex justify-center items-center text-black ${isWin ? 'bg-winGreen' : isLoss ? 'bg-lossRed' : 'bg-foregroundGrey'}`}><div className="w-fit h-fit ml-px">{isWin ? '+' : isLoss ? '-' : '='}</div></div>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-4 notFullDate:pr-8 text-nowrap text-sm">
                                        <div className="flex flex-row items-baseline">
                                            <span className="hidden notFullDate:block">{getMonthName(date.getMonth() + 1).slice(0, 3)} </span><span className="font-bold text-lg ml-1">{date.getDate()}</span><span className="hidden notFullDate:block">, {date.getFullYear()}</span>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}

function Games(props: { url: string, username: string, depth: number, unSelect: () => void }) {
    const { url, username, depth, unSelect } = props

    const [gamesInfo, setGamesInfo] = useState<gameInfo[]>([])
    const [loading, setLoading] = useState(true)

    const errorsContext = useContext(ErrorsContext)
    const analyzeContext = useContext(AnalyzeContext)

    const setErrors = errorsContext.errors[1]
    const setData = analyzeContext.data[1]

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const res = await fetch(url)
                if (!res.ok) throw new Error(String(res.status))

                const json: { games: Game[] } = await res.json()
                const games = json.games

                const newGamesInfo = games.toReversed().map(game => {
                    const { pgn, black, white, end_time } = game

                    const whiteName = white.username
                    const blackName = black.username

                    const whiteElo = white.rating
                    const blackElo = black.rating

                    const timestamp = end_time * 1000

                    let result: 'white' | 'black' | 'draw'
                    if (white.result === 'win') result = 'white'
                    else if (black.result === 'win') result = 'black'
                    else result = 'draw'

                    const timeClass = game.time_class

                    return { pgn, whiteName, blackName, whiteElo, blackElo, result, timestamp, timeClass }
                }).filter(gameInfo => {
                    try {
                        const chess = new Chess()
                        chess.loadPgn(gameInfo.pgn)
                    } catch {
                        return false
                    }

                    return true
                })

                setLoading(false)
                setGamesInfo(newGamesInfo)
            } catch {
                unSelect()
                await pushPageError(setErrors, GAMES_ERROR[0], GAMES_ERROR[1])
            }
        })()
    }, [])

    if (gamesInfo.length === 0 && !loading) {
        return (
            <div className="text-center font-bold text-2xl my-4">No games found in this month...</div>
        )
    }

    return <GamesUI gamesInfo={gamesInfo} username={username} depth={depth} loading={loading} setData={setData} />
}

export default function SelectChessComGame(props: { username: string, depth: number, stopSelecting: () => void }) {
    const { username, depth, stopSelecting } = props

    const [dates, setDates] = useState<{ month: string, year: string, url: string }[]>([])
    const [hovered, setHovered] = useState<number>(NaN)
    const [selected, setSelected] = useState<number>(NaN)
    const [loading, setLoading] = useState(true)

    const errorsContext = useContext(ErrorsContext)

    const setErrors = errorsContext.errors[1]

    const toggleSelected = (number: number) => {
        setSelected(prev => prev === number ? NaN : number)
    }

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const res = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`)
                if (!res.ok) throw new Error(String(res.status))

                const json: { archives: string[] } = await res.json()
                const archives = json.archives

                const newDates = archives.toReversed().map(url => {
                    const [year, month] = url.split('/').slice(-2)
                    return { year, month, url }
                })

                setLoading(false)
                setDates(newDates)
            } catch {
                stopSelecting()
                await pushPageError(setErrors, USER_ERROR[0], USER_ERROR[0])
            }
        })()
    }, [username])

    return (
        <div className={`overflow-x-hidden overflow-y-auto ${loading ? "flex flex-col justify-center flex-grow" : ''}`}>
            <h1 style={{display: loading ? 'none' : ''}} className="text-2xl py-4 px-8 sticky text-foreground"><a target="_blank" href={`${PLAYER_URL}${username}`} className="hover:underline text-backgroundBoxBoxHighlightedHover text-3xl font-bold">{username}</a>&apos;s games</h1>
            <hr style={{display: loading ? 'none' : ''}} className="border-border" />
            <div className="flex flex-col w-full">
                {loading ? <Loading whatIsLoading="Archives" abort={stopSelecting} /> : null}
                {dates.map((date, i) => {
                    return (
                        <div className="w-full" key={i}>
                            <button onClick={() => toggleSelected(i)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(NaN)} type="button" className={`${hovered === i || selected === i ? 'text-foregroundHighlighted' : 'text-foregroundGrey'} hover:bg-backgroundBoxHover w-full tracking-wide transition-colors text-2xl px-8 py-4 flex flex-row justify-between items-center`}>
                                <span><b>{date.year}</b> {getMonthName(Number(date.month))}</span>
                                <div style={{ opacity: hovered === i || selected === i ? '100' : '0', transform: `rotate(${selected !== i ? '180deg' : '0'})` }} className="transition-opacity"><Arrow class="fill-foregroundHighlighted" /></div>
                            </button>
                            {selected === i ?
                                <Games url={date.url} username={username} depth={depth} unSelect={() => setSelected(NaN)} />
                                : ''}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}