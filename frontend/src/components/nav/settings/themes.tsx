import { ConfigContext } from "@/context/config"
import { useContext, useEffect } from "react"

type boardThemeLabel = "Green" | "Brown" | "Blue" | "Gray" | "Red" | "Purple" | "Orange"

interface boardTheme {
    label: boardThemeLabel,
    black: string,
    white: string,
    highlight: string,
}

export const boardThemes: boardTheme[] = [
    { label: "Green", black: "#779556", white: "#ebecd0", highlight: "#ffff33" },
    { label: "Brown", black: "#b58863", white: "#f0d9b5", highlight: "#ffff33" },
    { label: "Blue", black: "#4d6d92", white: "#ececd7", highlight: "#00a5ff" },
    { label: "Gray", black: "#4f4f4f", white: "#e3e3e3", highlight: "#ffff33" },
    { label: "Red", black: "#ba5546", white: "#f0d8bf", highlight: "#f8f893" },
    { label: "Purple", black: "#8877b7", white: "#efefef", highlight: "#7dacc9" },
    { label: "Orange", black: "#d08b18", white: "#fce4b2", highlight: "#ffff33" },
]

export default function Themes() {
    const configContext = useContext(ConfigContext)

    const [boardTheme, setBoardTheme] = configContext.boardTheme

    useEffect(() => {
        const boardTheme = Number(localStorage.getItem('boardTheme'))
        if (boardThemes[boardTheme] != null) {
            setBoardTheme(boardTheme)
        } else {
            localStorage.setItem('boardTheme', '0')
            setBoardTheme(0)
        }
    }, [])

    function changeBoardTheme(boardThemeIndex: number) {
        setBoardTheme(boardThemeIndex)
        localStorage.setItem('boardTheme', String(boardThemeIndex))
    }

    return (
        <section>
            <h1 className="block bg-backgroundBoxBox font-bold text-nowrap p-3 text-foreground">Board Theme</h1>
            {boardThemes.map((theme, i) => {
                return (
                    <button onClick={() => changeBoardTheme(i)} type="button" key={i} className="flex flex-row gap-2 items-center hover:bg-black transition-colors hover:text-foregroundHighlighted w-full relative p-2">
                        <div className="grid grid-cols-2 w-fit">
                            {Array.from({ length: 4 }).map((_, i) => {
                                const isEvenCol = i % 2 === 0
                                const isEvenRow = Math.floor(i / 2) % 2 === 0

                                const squareColor = isEvenCol ? (isEvenRow ? theme.white : theme.black) : (isEvenRow ? theme.black : theme.white)

                                return <div key={i} style={{ backgroundColor: squareColor }} className="h-5 w-5" />
                            })}
                        </div>
                        <span className="font-bold text-lg">{theme.label}</span>
                        <div style={{backgroundColor: theme.black, display: boardTheme === i ? '' : 'none'}} className="w-3 h-3 rounded-full absolute right-3" />
                    </button>
                )
            })}
        </section>
    )
}