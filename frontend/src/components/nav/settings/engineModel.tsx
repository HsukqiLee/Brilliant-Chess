import { AnalyzeContext } from "@/context/analyze"
import { useContext } from "react"

export default function EngineModel() {
    const analyzeContext = useContext(AnalyzeContext)
    const [availableModels] = analyzeContext.availableModels
    const [selectedModelId, setSelectedModelId] = analyzeContext.selectedModelId

    if (availableModels.length === 0) return null

    return (
        <section>
            <h1 className="block bg-backgroundBoxBox font-bold text-nowrap p-3 text-foreground">Stockfish Model</h1>
            {availableModels.map((model) => {
                const isSelected = selectedModelId === model.id
                return (
                    <button
                        onClick={() => setSelectedModelId(model.id)}
                        type="button"
                        key={model.id}
                        className="flex flex-row gap-2 items-center hover:bg-black transition-colors hover:text-foregroundHighlighted w-full relative p-2"
                    >
                        <div className="w-[40px] h-[40px] flex justify-center items-center font-bold text-sm bg-backgroundBoxBox rounded-borderRoundness border border-border">
                            SF
                        </div>
                        <span className="font-bold text-lg">{model.name}</span>
                        <div
                            style={{ backgroundColor: "var(--foreground)", display: isSelected ? "" : "none" }}
                            className="w-3 h-3 rounded-full absolute right-3"
                        />
                    </button>
                )
            })}
        </section>
    )
}
