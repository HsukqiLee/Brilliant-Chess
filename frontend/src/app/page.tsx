import BoardMenu from "@/components/boardMenu/boardMenu"
import Game from "@/components/game/game"
import Menu from "@/components/menu/menu"
import Nav from "@/components/nav/nav"
import AnalyzeContextProvider from "@/context/analyze"
import ConfigContextProvider from "@/context/config"
import ErrorsContextProvider from "@/context/errors"
import PageErrors from "@/components/errors/pageErrors"
import GameButtons from "@/components/menu/analysis/gameButtons"

export default function Home() {
  return (
    <ConfigContextProvider><ErrorsContextProvider>
      <PageErrors />
      <header>
        <Nav />
      </header>
      <main className="flex flex-col vertical:flex-row h-full vertical:p-4 p-2 vertical:gap-2 gap-4 items-center vertical:justify-center select-none w-full overflow-x-hidden overflow-y-auto">
        <AnalyzeContextProvider>
          <div className="h-full flex navTop:flex-row flex-col vertical:gap-[10px] gap-[6px] w-min">
            <Game />
            <BoardMenu />
            <div className="bg-backgroundBox flex-row justify-center rounded-borderRoundness w-full navTop:hidden flex h-12">
                <div className="max-w-[500px] w-full flex flex-row justify-center scale-75">
                    <GameButtons />
                </div>
            </div>
          </div>
          <Menu />
        </AnalyzeContextProvider>
      </main>
    </ErrorsContextProvider></ConfigContextProvider>
  )
}
