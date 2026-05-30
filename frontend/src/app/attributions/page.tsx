import License from "@/components/svg/license";
import PieceSVG from "@/components/svg/piece";
import { KING, QUEEN, WHITE } from "chess.js";
import Image from "next/image";
import Link from "next/link";

export default function Attributions() {
    return (
        <div className="flex-grow h-full w-full max-w-[1400px] mx-auto">
            <header>
                <h1 className="text-4xl font-extrabold mx-auto mt-6 flex flex-row items-center gap-4 w-fit"><License draggable size={35} class="fill-foreground" />Attributions</h1>
            </header>
            <main className="grid mt-4 attributionsTwoColumns:grid-cols-3 attributionsOneColumn:grid-cols-2 grid-cols-1 attributionsTwoColumns:p-6 attributionsTwoColumns:gap-6 p-3 gap-3">
                <section className="bg-backgroundBox p-6 w-full rounded-borderRoundness">
                    <h1 className="text-2xl font-bold flex flex-row items-center mx-auto mb-8 w-fit gap-2">
                        <div draggable role="img" aria-label="pieces" className="flex flex-row">
                            <PieceSVG className="rotate-[-20deg] relative top-1" piece={QUEEN} size={50} color={WHITE} />
                            <PieceSVG className="rotate-12 relative bottom-2 right-2" piece={KING} size={50} color={WHITE} />
                        </div>
                        Chess Pieces
                    </h1>
                    <ul className="text-lg">
                        <li>Created by: <Link target="_blank" className="text-blue-600 hover:underline font-bold" href="https://en.wikipedia.org/wiki/User:Cburnett">Cburnett</Link></li>
                        <li>License: <Link target="_blank" className="text-blue-600 hover:underline font-bold" href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</Link></li>
                    </ul>
                </section>
                <section className="bg-backgroundBox p-6 w-full rounded-borderRoundness">
                    <h1 className="text-2xl font-bold flex flex-row items-center mx-auto mb-8 w-fit gap-2">
                        <div draggable className="flex flex-row mr-2 select-none">
                            <Image draggable={false} className="rotate-[-20deg]" alt="megaphone" src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/megaphone.svg`} width={50} height={0} />
                        </div>
                        Board Sounds
                    </h1>
                    <ul className="text-lg">
                        <li>Created by: <Link target="_blank" className="text-blue-600 hover:underline font-bold" href="https://github.com/lichess-org">Lichess</Link></li>
                        <li>License: <Link target="_blank" className="text-blue-600 hover:underline font-bold" href="https://github.com/lichess-org/lila/blob/master/LICENSE">AGPL-3.0</Link></li>
                    </ul>
                </section>
                <section className="bg-backgroundBox p-6 w-full rounded-borderRoundness">
                    <h1 className="text-2xl font-bold flex flex-row items-center mx-auto mb-8 w-fit gap-2">
                        <div draggable className="flex flex-row mr-2 select-none">
                            <Image draggable={false} alt="megaphone" src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/stockfish.webp`} width={50} height={0} />
                        </div>
                        Stockfish.js
                    </h1>
                    <ul className="text-lg">
                        <li>Created by: <Link target="_blank" className="text-blue-600 hover:underline font-bold" href="https://github.com/nmrugg">Nmrugg</Link></li>
                        <li>License: <Link target="_blank" className="text-blue-600 hover:underline font-bold" href="https://github.com/nmrugg/stockfish.js/blob/master/license.txt">GPL-3.0</Link></li>
                    </ul>
                </section>
            </main>
        </div>
    )
}