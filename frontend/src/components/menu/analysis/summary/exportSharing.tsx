"use client";

import { useContext, useState } from "react";
import { AnalyzeContext, players } from "@/context/analyze";
import { move } from "@/engine/stockfish";
import { useAuth } from "@/context/auth";
import { apiUrl, getApiBaseUrl } from "@/lib/api";

type ExportSharingProps = {
  moves: move[];
  players: players;
};

export default function ExportSharing({ moves, players }: ExportSharingProps) {
  const analyzeContext = useContext(AnalyzeContext);
  const [result] = analyzeContext.result;
  const [time] = analyzeContext.time;
  const [, setTab] = analyzeContext.tab;
  const { user } = useAuth();

  const [includeEval, setIncludeEval] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);
  const [copyStatus, setCopyStatus] = useState("");
  const [shareStatus, setShareStatus] = useState("");

  function formatPGNEval(evaluation: string[] | undefined, white: boolean) {
    if (!evaluation) return "0.00";
    if (evaluation[0] === "mate" && evaluation[1]) {
      const mateIn = Number(evaluation[1]) * (white ? 1 : -1);
      return `#${mateIn}`;
    }
    const val = (Number(evaluation[1]) / 100) * (white ? 1 : -1);
    return isNaN(val) ? "0.00" : val.toFixed(2);
  }

  function getRatingGlyph(rating: string | undefined) {
    switch (rating) {
      case "brilliant":
        return "!!";
      case "great":
        return "!";
      case "best":
        return "!";
      case "excellent":
        return "!";
      case "inaccuracy":
        return "?!";
      case "mistake":
        return "?";
      case "blunder":
        return "??";
      default:
        return "";
    }
  }

  function generatePGNString(incEval: boolean, incComments: boolean) {
    const headers = [
      `[Event "Brilliant Chess Analysis"]`,
      `[Site "Brilliant Chess"]`,
      `[Date "${new Date().toISOString().slice(0, 10).replace(/-/g, ".")}"]`,
      `[Round "1"]`,
      `[White "${players[0]?.name || "White"}"]`,
      `[Black "${players[1]?.name || "Black"}"]`,
      `[Result "${result || "*"}"]`,
      players[0]?.elo && players[0].elo !== "NOELO"
        ? `[WhiteElo "${players[0]?.elo}"]`
        : null,
      players[1]?.elo && players[1].elo !== "NOELO"
        ? `[BlackElo "${players[1]?.elo}"]`
        : null,
      time ? `[TimeControl "${time}"]` : null,
      `[Variant "Standard"]`,
      `[Link "${typeof window !== "undefined" ? window.location.href.split("?")[0] : ""}"]`,
    ]
      .filter(Boolean)
      .join("\n");

    const pgnMoves: string[] = [];
    const realMoves = moves.slice(1);

    let turnNumber = 1;
    for (let i = 0; i < realMoves.length; i += 2) {
      const whiteMove = realMoves[i];
      const blackMove = realMoves[i + 1];

      let moveStr = `${turnNumber}.`;

      // White move
      const whiteSan = whiteMove.san || "";
      const whiteRatingGlyph = getRatingGlyph(whiteMove.moveRating);
      let whiteAnnotation = "";
      if (incEval || incComments) {
        const whiteEval = whiteMove.previousStaticEvals?.[0];
        const whiteEvalStr = incEval
          ? `[%eval ${formatPGNEval(whiteEval, true)}]`
          : "";
        const whiteComment =
          incComments && whiteMove.comment ? ` ${whiteMove.comment}` : "";

        if (whiteEvalStr || whiteComment) {
          whiteAnnotation = ` { ${whiteEvalStr}${whiteComment} }`;
        }
      }
      moveStr += ` ${whiteSan}${whiteRatingGlyph}${whiteAnnotation}`;

      // Black move
      if (blackMove) {
        const blackSan = blackMove.san || "";
        const blackRatingGlyph = getRatingGlyph(blackMove.moveRating);
        let blackAnnotation = "";
        if (incEval || incComments) {
          const blackEval = blackMove.previousStaticEvals?.[0];
          const blackEvalStr = incEval
            ? `[%eval ${formatPGNEval(blackEval, false)}]`
            : "";
          const blackComment =
            incComments && blackMove.comment ? ` ${blackMove.comment}` : "";

          if (blackEvalStr || blackComment) {
            blackAnnotation = ` { ${blackEvalStr}${blackComment} }`;
          }
        }
        moveStr += ` ${blackSan}${blackRatingGlyph}${blackAnnotation}`;
      }

      pgnMoves.push(moveStr);
      turnNumber++;
    }

    return `${headers}\n\n${pgnMoves.join(" ")} ${result || "*"}`;
  }

  function downloadPGN() {
    const pgnText = generatePGNString(includeEval, includeComments);
    const blob = new Blob([pgnText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const whiteName = players[0]?.name?.replace(/\s+/g, "_") || "White";
    const blackName = players[1]?.name?.replace(/\s+/g, "_") || "Black";

    a.href = url;
    a.download = `${whiteName}_vs_${blackName}_analysis.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copyPGN() {
    try {
      const pgnText = generatePGNString(includeEval, includeComments);
      await navigator.clipboard.writeText(pgnText);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Failed!");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  }

  async function copyShareLink() {
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      const pgnString = generatePGNString(includeEval, includeComments);
      const shareUrl = `${baseUrl}?pgn=${encodeURIComponent(pgnString)}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Copied!");
      setTimeout(() => setShareStatus(""), 2000);
    } catch {
      setShareStatus("Failed!");
      setTimeout(() => setShareStatus(""), 2000);
    }
  }

  const [saveStatus, setSaveStatus] = useState("");

  async function saveToLibrary() {
    if (!user) {
      setTab("profile");
      return;
    }
    try {
      setSaveStatus("Saving...");

      // Calculate accuracies
      const accuracies: { w: number[]; b: number[] } = { w: [], b: [] };
      for (const m of moves) {
        const color = m.color === "w" ? "b" : "w";
        const rating = m.moveRating;
        let moveAccuracy: number = NaN;
        switch (rating) {
          case "brilliant":
          case "great":
          case "best":
          case "book":
            moveAccuracy = 100;
            break;
          case "excellent":
            moveAccuracy = 90;
            break;
          case "good":
            moveAccuracy = 70;
            break;
          case "inaccuracy":
          case "miss":
            moveAccuracy = 30;
            break;
          case "mistake":
            moveAccuracy = 20;
            break;
          case "blunder":
            moveAccuracy = 0;
            break;
        }
        if (!isNaN(moveAccuracy)) {
          accuracies[color].push(moveAccuracy);
        }
      }

      const avgAcc = (arr: number[]) =>
        arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      const whiteAcc = avgAcc(accuracies.w);
      const blackAcc = avgAcc(accuracies.b);

      // Calculate average CPL
      const computeCpl = (color: "w" | "b") => {
        const losses: number[] = [];
        for (const m of moves) {
          const movingColor = m.color === "w" ? "b" : "w";
          if (movingColor !== color) continue;
          if (m.centipawn === null || m.centipawn === undefined) continue;

          const previousEval = m.previousStaticEvals?.[1];
          if (!previousEval || previousEval[0] !== "cp") continue;

          const previousCp = Number(previousEval[1]);
          if (Number.isNaN(previousCp)) continue;

          const before = color === "w" ? previousCp : -previousCp;
          const after = color === "w" ? m.centipawn : -m.centipawn;
          const loss = Math.max(0, before - after);
          losses.push(loss);
        }
        return losses.length ? avgAcc(losses) : 0;
      };

      const whiteCpl = computeCpl("w");
      const blackCpl = computeCpl("b");

      const fullPgn = generatePGNString(true, true); // Save the fully annotated game

      const backendUrl = getApiBaseUrl();
      if (!backendUrl) {
        throw new Error("Backend URL not configured");
      }

      const res = await fetch(apiUrl("/games"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pgn: fullPgn,
          whiteAccuracy: whiteAcc,
          blackAccuracy: blackAcc,
          whiteCpl,
          blackCpl,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      setSaveStatus("Saved to Library!");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err: any) {
      console.error(err);
      setSaveStatus("Failed to Save");
      setTimeout(() => setSaveStatus(""), 2000);
    }
  }

  return (
    <div className="w-[85%] flex flex-col gap-3 justify-center pb-6">
      <div className="text-foreground font-extrabold text-lg border-b border-neutral-700/40 pb-1 mt-2">
        Export & Share
      </div>

      {/* Options */}
      <div className="flex flex-row justify-between gap-4 text-xs text-foregroundGrey">
        <label className="flex items-center gap-2 cursor-pointer select-none hover:text-foreground transition-colors">
          <input
            type="checkbox"
            checked={includeEval}
            onChange={(e) => setIncludeEval(e.target.checked)}
            className="accent-highlightGreat cursor-pointer"
          />
          <span>Include Evaluations</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none hover:text-foreground transition-colors">
          <input
            type="checkbox"
            checked={includeComments}
            onChange={(e) => setIncludeComments(e.target.checked)}
            className="accent-highlightGreat cursor-pointer"
          />
          <span>Include Comments</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex flex-row gap-2 w-full">
          <button
            type="button"
            onClick={downloadPGN}
            className="flex-1 text-xs font-bold py-2 rounded-borderRoundness bg-highlightGreat text-white hover:bg-highlightGreat/90 active:scale-95 transition-all cursor-pointer text-center"
          >
            Download PGN
          </button>
          <button
            type="button"
            onClick={copyPGN}
            className="flex-1 text-xs font-bold py-2 rounded-borderRoundness bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover text-foreground active:scale-95 transition-all cursor-pointer text-center border border-neutral-700/30"
          >
            {copyStatus || "Copy PGN"}
          </button>
        </div>
        <button
          type="button"
          onClick={copyShareLink}
          className="w-full text-xs font-bold py-2 rounded-borderRoundness bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover text-foreground active:scale-95 transition-all cursor-pointer text-center border border-neutral-700/30"
        >
          {shareStatus || "Copy Shareable Link"}
        </button>
        <button
          type="button"
          onClick={saveToLibrary}
          className="w-full text-xs font-bold py-2 rounded-borderRoundness bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 transition-all cursor-pointer text-center font-extrabold"
        >
          {!user ? "Log in to Save" : saveStatus || "Save to Library"}
        </button>
      </div>
    </div>
  );
}
