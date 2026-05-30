import { useContext, useEffect, useState } from "react"
import Arrow from "../../svg/arrow"
import { AnalyzeContext } from "@/context/analyze"
import { pushPageError, pushPageWarning } from "@/components/errors/pageErrors"
import { Chess } from "chess.js"
import { API_BLOCKING_ERROR, GAMES_ERROR, GamesUI, getMonthName, Loading, USER_ERROR } from "./selectChessCom"
import { ErrorsContext } from "@/context/errors"

interface Game {
    id: string;
    rated: boolean;
    variant: string;
    speed: string;
    perf: string;
    createdAt: number;
    lastMoveAt: number;
    status: string;
    source: string;
    players: {
        white: {
            user: {
                name: string;
                id: string;
            };
            rating: number;
            ratingDiff: number;
            provisional?: boolean;
        };
        black: {
            user: {
                name: string;
                id: string;
            };
            rating: number;
            ratingDiff: number;
        };
    };
    winner: "white" | "black";
    moves: string;
    pgn: string;
    clock: {
        initial: number;
        increment: number;
        totalTime: number;
    };
}

const PLAYER_URL = 'https://lichess.org/@/'

function Games(props: { url: string, username: string, depth: number, unSelect: () => void }) {
    const { url, username, depth, unSelect } = props

    const [gamesInfo, setGamesInfo] = useState<{ whiteName: string, blackName: string, whiteElo: number, blackElo: number, result: 'white' | 'black' | 'draw', timestamp: number, pgn: string, timeClass: string }[]>([])
    const [loading, setLoading] = useState(true)

    const analyzeContext = useContext(AnalyzeContext)
    const errorsContext = useContext(ErrorsContext)

    const setData = analyzeContext.data[1]
    const setErrors = errorsContext.errors[1]

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const res = await fetch(url, { headers: { Accept: "application/x-ndjson" } })
                if (!res.ok) throw new Error(String(res.status))

                const text = await res.text()
                
                const jsonArr: Game[] = text.split("\n").map(text => {
                    try {
                        return JSON.parse(text)
                    } catch {
                        return null
                    }
                }).filter(obj => obj)

                const newGamesInfo: typeof gamesInfo = jsonArr.map(json => {
                    const whiteName = json.players.white.user.name
                    const whiteElo = json.players.white.rating

                    const blackName = json.players.black.user.name
                    const blackElo = json.players.black.rating
                    
                    const result = json.winner

                    const timestamp = json.createdAt

                    const pgn = json.pgn

                    const timeClass = json.speed

                    return { whiteElo, whiteName, blackElo, blackName, result, timestamp, pgn, timeClass }
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
                await pushPageWarning(setErrors, API_BLOCKING_ERROR[0], API_BLOCKING_ERROR[1])
            }
        })()
    }, [])

    if (gamesInfo.length === 0 && !loading) {
        return (
            <div className="text-center font-bold text-2xl my-4">No games found in this month...</div>
        )
    }

    return <GamesUI gamesInfo={gamesInfo} loading={loading} username={username} depth={depth} setData={setData} />
}

export default function SelectLichessOrgGame(props: { username: string, depth: number, stopSelecting: () => void }) {
    const { username, depth, stopSelecting } = props

    const [dates, setDates] = useState<{ month: number, year: number, url: string }[]>([])
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
                const resFirstGame = await fetch(`https://lichess.org/api/games/user/${username}?sort=dateAsc&max=1`, { headers: { Accept: "application/x-ndjson" } })
                if (!resFirstGame.ok) throw new Error(String(resFirstGame.status))
                
                const jsonFirstGame: { createdAt: number } = await resFirstGame.json()
                const dateFirstGame = new Date(jsonFirstGame.createdAt)

                const resLastGame = await fetch(`https://lichess.org/api/games/user/${username}?sort=dateDesc&max=1`, { headers: { Accept: "application/x-ndjson" } })
                if (!resLastGame.ok) throw new Error(String(resLastGame.status))

                const jsonLastGame: { createdAt: number } = await resLastGame.json()
                const dateLastGame = new Date(jsonLastGame.createdAt)

                const currentDate = new Date(dateFirstGame)
                const newDates: typeof dates = []
                while (currentDate <= dateLastGame) {
                    const sinceDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0)
                    const untilDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1, 0, 0, 0, 0)
                    untilDate.setMilliseconds(untilDate.getMilliseconds() - 1)

                    const month = currentDate.getMonth()
                    const year = currentDate.getFullYear()

                    newDates.push({month: month + 1, year, url: `https://lichess.org/api/games/user/${username}?since=${sinceDate.getTime()}&until=${untilDate.getTime()}&pgnInJson=true`})
                    currentDate.setMonth(currentDate.getMonth() + 1)
                }

                setLoading(false)
                setDates(newDates.toReversed())
            } catch {
                stopSelecting()
                await pushPageError(setErrors, USER_ERROR[0], USER_ERROR[1])
                await pushPageWarning(setErrors, API_BLOCKING_ERROR[0], API_BLOCKING_ERROR[1])
            }
        })()
    }, [username])

    return (
        <div className={`overflow-x-hidden overflow-y-auto ${loading ? " flex flex-col justify-center flex-grow" : ''}`}>
            <h1 style={{display: loading ? 'none' : ''}} className="text-2xl py-4 px-8 sticky text-foreground"><a target="_blank" href={`${PLAYER_URL}${username}`} className="hover:underline text-foregroundHighlighted text-3xl font-bold">{username}</a>&apos;s games</h1>
            <hr style={{display: loading ? 'none' : ''}} className="border-border" />
            <div className="flex flex-col w-full">
                {loading ? <Loading whatIsLoading="Archives" abort={stopSelecting} /> : null}
                {dates.map((date, i) => {
                    return (
                        <div key={i}>
                            <button onClick={() => toggleSelected(i)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(NaN)} type="button" className={`${hovered === i || selected === i ? 'text-foregroundHighlighted' : 'text-foregroundGrey'} hover:bg-backgroundBoxHover w-full tracking-wide transition-colors text-2xl px-8 py-4 flex flex-row justify-between items-center`}>
                                <span><b>{date.year}</b> {getMonthName(date.month)}</span>
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