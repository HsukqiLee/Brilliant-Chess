"use client"

import { players } from "@/context/analyze"
import { move } from "@/engine/stockfish"
import { useState, useEffect } from "react"

interface RatingData {
    elo: number
    label: string
    accuracy: number
    cpl: number
    blunders: number
    mistakes: number
}

const RATING_LEVELS: RatingData[] = [
    { elo: 600, label: "新手 (600 ELO)", accuracy: 65.0, cpl: 85.0, blunders: 3.2, mistakes: 2.6 },
    { elo: 1000, label: "业余 (1000 ELO)", accuracy: 71.0, cpl: 62.0, blunders: 2.1, mistakes: 2.0 },
    { elo: 1400, label: "进阶 (1400 ELO)", accuracy: 77.0, cpl: 45.0, blunders: 1.1, mistakes: 1.5 },
    { elo: 1800, label: "专家 (1800 ELO)", accuracy: 83.0, cpl: 30.0, blunders: 0.5, mistakes: 1.0 },
    { elo: 2200, label: "大师 (2200 ELO)", accuracy: 88.0, cpl: 18.0, blunders: 0.1, mistakes: 0.5 },
    { elo: 2800, label: "特级大师 (2800 ELO)", accuracy: 93.0, cpl: 9.0, blunders: 0.02, mistakes: 0.1 }
]

function computeAverageCpl(moves: move[], color: 'w' | 'b'): number {
    const losses: number[] = []

    for (const move of moves) {
        const movingColor = move.color === 'w' ? 'b' : 'w'
        if (movingColor !== color) continue
        if (move.centipawn === null || move.centipawn === undefined) continue

        const previousEval = move.previousStaticEvals?.[1]
        if (!previousEval || previousEval[0] !== 'cp') continue

        const previousCp = Number(previousEval[1])
        if (Number.isNaN(previousCp)) continue

        const before = color === 'w' ? previousCp : -previousCp
        const after = color === 'w' ? move.centipawn : -move.centipawn
        const loss = Math.max(0, before - after)
        losses.push(loss)
    }

    return losses.length ? losses.reduce((acc, cur) => acc + cur, 0) / losses.length : 0
}

export default function OpponentComparison(props: { moves: move[], players: players, accuracy: { w: number, b: number } }) {
    const { moves, players, accuracy } = props

    const [selectedColor, setSelectedColor] = useState<'w' | 'b'>('w')
    const [comparedElo, setComparedElo] = useState<number>(1400)

    // Auto-detect ELO on mount or players change
    useEffect(() => {
        const playerIndex = selectedColor === 'w' ? 0 : 1
        const eloStr = players[playerIndex]?.elo || ""
        const parsed = parseInt(eloStr.replace(/\D/g, ""), 10)
        if (!isNaN(parsed)) {
            // Find closest ELO bracket
            let closest = RATING_LEVELS[2] // default 1400
            let minDiff = Math.abs(parsed - closest.elo)
            for (const level of RATING_LEVELS) {
                const diff = Math.abs(parsed - level.elo)
                if (diff < minDiff) {
                    minDiff = diff
                    closest = level
                }
            }
            setComparedElo(closest.elo)
        }
    }, [players, selectedColor])

    // Calculate user metrics
    const userAccuracy = selectedColor === 'w' ? (accuracy.w || 0) : (accuracy.b || 0)
    const userCpl = computeAverageCpl(moves, selectedColor)

    // Calculate played counts of blunders/mistakes
    const getCounter = (color: 'w' | 'b') => {
        let blunders = 0
        let mistakes = 0
        moves.forEach((move, i) => {
            if (i === 0) return
            const movingColor = i % 2 === 0 ? 'b' : 'w'
            if (movingColor !== color) return
            if (move.moveRating === 'blunder') {
                blunders++
            } else if (move.moveRating === 'mistake') {
                mistakes++
            }
        })
        return { blunders, mistakes }
    }

    const userCounts = getCounter(selectedColor)
    const targetData = RATING_LEVELS.find(l => l.elo === comparedElo) || RATING_LEVELS[2]

    // Diff values
    const diffAccuracy = userAccuracy - targetData.accuracy
    const diffCpl = targetData.cpl - userCpl // positive is good (user Cpl is lower)
    const diffBlunders = targetData.blunders - userCounts.blunders // positive is good (user blunders is lower)
    const diffMistakes = targetData.mistakes - userCounts.mistakes // positive is good (user mistakes is lower)

    // Coach advice generation
    const getCoachAdvice = () => {
        const coachIntro = `【国象大师教练点评】：`
        if (diffBlunders < -0.8) {
            return `${coachIntro}你的单局失误率（Blunders）显著高于该等级平均值。在战术防守端存在盲区，极易在局势平稳时漏算简单战术。建议落子前多花5秒检查子力保护，并重点训练防守基本功。`
        }
        if (diffCpl < -12) {
            return `${coachIntro}你的平均分值损耗（CPL）偏高。虽然防守大体稳健、没有致命失误，但中局选子精度不足，导致子力优势和主动权在平淡的交换中被对手慢慢蚕食。建议多研读中局的位置感和兵形结构。`
        }
        if (diffAccuracy > 3) {
            return `${coachIntro}太棒了！你的整体行棋准确率（Accuracy）优于该等级段平均表现。中局战术算力精准，抓住对手失误的效率很高，请继续保持这套敏锐的进攻思维。`
        }
        return `${coachIntro}此局发挥整体符合该等级段预期。在局势细微转变和残局优化上仍有提升空间。建议针对中局的复盘进行深度拆解，找出更具进取性的着法。`
    }

    const renderDiffBadge = (diff: number, isPercent: boolean = false) => {
        const isBetter = diff >= 0
        const formatted = Math.abs(diff).toFixed(1) + (isPercent ? "%" : "")
        if (isBetter) {
            return (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-950/40 text-green-400 border border-green-900/50">
                    +{formatted} (优于同级)
                </span>
            )
        } else {
            return (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-950/30 text-red-400 border border-red-900/40">
                    -{formatted} (弱于同级)
                </span>
            )
        }
    }

    return (
        <div className="w-[85%] flex flex-col gap-4 bg-backgroundBoxBox p-4 rounded-borderRoundness border border-border">
            <div className="flex flex-row justify-between items-center border-b border-neutral-800 pb-2">
                <span className="font-extrabold text-foreground text-md">📊 同等级别玩家对比</span>
                <div className="flex bg-neutral-900 rounded-borderRoundness p-0.5 border border-neutral-800">
                    <button
                        onClick={() => setSelectedColor('w')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${selectedColor === 'w' ? 'bg-backgroundBoxBoxHighlighted text-foreground shadow' : 'text-foregroundGrey hover:text-foreground'}`}
                    >
                        {players[0]?.name || "White"}
                    </button>
                    <button
                        onClick={() => setSelectedColor('b')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${selectedColor === 'b' ? 'bg-backgroundBoxBoxHighlighted text-foreground shadow' : 'text-foregroundGrey hover:text-foreground'}`}
                    >
                        {players[1]?.name || "Black"}
                    </button>
                </div>
            </div>

            {/* Compared ELO Selection tabs */}
            <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-foregroundGrey">对比目标分段:</span>
                <div className="grid grid-cols-3 gap-1 md:flex md:flex-row md:justify-between bg-neutral-950 p-1 rounded-borderRoundness border border-neutral-900 overflow-hidden">
                    {RATING_LEVELS.map(level => (
                        <button
                            key={level.elo}
                            onClick={() => setComparedElo(level.elo)}
                            className={`flex-1 py-1 rounded text-xs font-extrabold transition-all duration-200 text-center ${comparedElo === level.elo ? 'bg-backgroundBoxBoxHighlighted text-foreground shadow-md scale-105 border-transparent' : 'text-foregroundGrey hover:text-foreground hover:bg-neutral-900/60'}`}
                        >
                            {level.elo}
                        </button>
                    ))}
                </div>
            </div>

            {/* Comparison Metrics Grid */}
            <div className="flex flex-col gap-3">
                {/* Accuracy */}
                <div className="flex flex-col gap-1 p-2 bg-neutral-950/40 hover:bg-neutral-950/70 rounded border border-neutral-900 hover:border-neutral-800/80 transition-all duration-200">
                    <div className="flex flex-row justify-between items-center">
                        <span className="text-sm font-bold text-foreground">准确率 (Accuracy)</span>
                        {renderDiffBadge(diffAccuracy, true)}
                    </div>
                    <div className="flex flex-row justify-between text-xs text-foregroundGrey mt-1">
                        <span>你的表现: <strong className="text-foreground">{userAccuracy.toFixed(1)}%</strong></span>
                        <span>同级平均: <strong>{targetData.accuracy.toFixed(1)}%</strong></span>
                    </div>
                </div>

                {/* Avg CPL */}
                <div className="flex flex-col gap-1 p-2 bg-neutral-950/40 hover:bg-neutral-950/70 rounded border border-neutral-900 hover:border-neutral-800/80 transition-all duration-200">
                    <div className="flex flex-row justify-between items-center">
                        <span className="text-sm font-bold text-foreground">平均分值损耗 (Avg CPL)</span>
                        {renderDiffBadge(diffCpl)}
                    </div>
                    <div className="flex flex-row justify-between text-xs text-foregroundGrey mt-1">
                        <span>你的表现: <strong className="text-foreground">{userCpl.toFixed(1)}</strong></span>
                        <span>同级平均: <strong>{targetData.cpl.toFixed(1)}</strong></span>
                    </div>
                </div>

                {/* Blunders */}
                <div className="flex flex-col gap-1 p-2 bg-neutral-950/40 hover:bg-neutral-950/70 rounded border border-neutral-900 hover:border-neutral-800/80 transition-all duration-200">
                    <div className="flex flex-row justify-between items-center">
                        <span className="text-sm font-bold text-foreground">大失误数 (Blunders)</span>
                        {renderDiffBadge(diffBlunders)}
                    </div>
                    <div className="flex flex-row justify-between text-xs text-foregroundGrey mt-1">
                        <span>你的表现: <strong className="text-foreground">{userCounts.blunders}</strong></span>
                        <span>同级平均: <strong>{targetData.blunders.toFixed(1)}</strong></span>
                    </div>
                </div>

                {/* Mistakes */}
                <div className="flex flex-col gap-1 p-2 bg-neutral-950/40 hover:bg-neutral-950/70 rounded border border-neutral-900 hover:border-neutral-800/80 transition-all duration-200">
                    <div className="flex flex-row justify-between items-center">
                        <span className="text-sm font-bold text-foreground">错误数 (Mistakes)</span>
                        {renderDiffBadge(diffMistakes)}
                    </div>
                    <div className="flex flex-row justify-between text-xs text-foregroundGrey mt-1">
                        <span>你的表现: <strong className="text-foreground">{userCounts.mistakes}</strong></span>
                        <span>同级平均: <strong>{targetData.mistakes.toFixed(1)}</strong></span>
                    </div>
                </div>
            </div>

            {/* Coach Insight */}
            <div className="p-3 bg-neutral-900/80 rounded-r-borderRoundness border border-neutral-800 border-l-4 border-l-backgroundBoxBoxHighlighted text-xs text-foregroundGrey leading-relaxed font-semibold shadow-inner">
                {getCoachAdvice()}
            </div>
        </div>
    )
}
