"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { AnalyzeContext } from "@/context/analyze";
import { Chess } from "chess.js";

export default function PlayComputer() {
  const analyzeContext = useContext(AnalyzeContext);

  const [playConfig] = analyzeContext.playConfig;
  const [playerColor] = analyzeContext.playerColor;
  const [computerThinking] = analyzeContext.computerThinking;
  const [chatHistory, setChatHistory] = analyzeContext.chatHistory;
  const [game, setGame] = analyzeContext.game;
  const [, setPageState] = analyzeContext.pageState;
  const [result, setResult] = analyzeContext.result;
  const [moveNumber] = analyzeContext.moveNumber;

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to chat end
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, computerThinking]);

  const lastMove = game[game.length - 1];
  const currentFen =
    lastMove?.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const chess = new Chess(currentFen);
  const isGameOver = chess.isGameOver() || Boolean(result);

  const opponentName =
    playConfig.opponent === "stockfish"
      ? `Stockfish Level ${playConfig.level}`
      : playConfig.personality;

  const opponentAvatar =
    playConfig.opponent === "stockfish"
      ? "🤖"
      : playConfig.personality === "The Tactician"
        ? "🎯"
        : playConfig.personality === "The Iron Wall"
          ? "🛡️"
          : "💬";

  const opponentDesc =
    playConfig.opponent === "stockfish"
      ? "Local Stockfish Chess Engine"
      : playConfig.personality === "The Tactician"
        ? "Aggressive tactician looking for sacrifices."
        : playConfig.personality === "The Iron Wall"
          ? "Solid positional defensive player."
          : "Talkative educational coach.";

  const isPlayerTurn = !isGameOver && chess.turn() === playerColor;

  function handleResign() {
    if (isGameOver) return;
    if (window.confirm("Are you sure you want to resign?")) {
      // 玩家认输，设结果为对手赢
      const gameResult = playerColor === "w" ? "0-1" : "1-0";
      setResult(gameResult);
      setChatHistory((prev: any) => [
        ...prev,
        { role: "system", text: "You resigned. Game over.", name: "System" },
      ]);
    }
  }

  function handleOfferDraw() {
    if (isGameOver) return;

    setChatHistory((prev: any) => [
      ...prev,
      { role: "user", text: "I offer a draw.", name: "Player" },
    ]);

    setTimeout(() => {
      // 简单的求和接受逻辑：如果局面评估在 [-0.5, 0.5] 之间，或者是 Coach，AI 可能会同意。
      // 为了趣味性，我们根据 AI 棋风随机回复
      let accepted = false;
      let replyText = "";

      if (playConfig.opponent === "stockfish") {
        accepted = Math.random() > 0.6; // 40% 概率同意
        replyText = accepted
          ? "Stockfish accepted the draw."
          : "Stockfish declined the draw.";
      } else {
        const rand = Math.random();
        if (playConfig.personality === "The Tactician") {
          accepted = rand > 0.8;
          replyText = accepted
            ? "Fine, this battlefield has grown stale. Draw accepted."
            : "No draw! The tactics are just getting interesting!";
        } else if (playConfig.personality === "The Iron Wall") {
          accepted = rand > 0.4; // 铁壁更容易和棋
          replyText = accepted
            ? "My fortress is unbreakable, and yours is solid. I accept the draw."
            : "I can still fortify my position further. Request declined.";
        } else {
          // Chatty Coach
          accepted = rand > 0.5;
          replyText = accepted
            ? "Excellent choice. This is an equal endgame, a draw is very educational! Accepted."
            : "Let's keep playing! There is still so much to learn from this position.";
        }
      }

      setChatHistory((prev: any) => [
        ...prev,
        { role: "ai", text: replyText, name: opponentName },
      ]);

      if (accepted) {
        setResult("1/2-1/2");
        setChatHistory((prev: any) => [
          ...prev,
          { role: "system", text: "Game drawn by agreement.", name: "System" },
        ]);
      }
    }, 1000);
  }

  return (
    <div className="flex flex-col h-full w-full justify-between p-4 bg-backgroundBox border-t border-neutral-800 animate-fadeIn">
      {/* Opponent Info Header */}
      <div className="flex flex-row items-center gap-3 p-3 bg-backgroundBoxBox rounded-borderRoundness border border-neutral-800 shadow-md">
        <div className="text-3xl p-2 bg-neutral-800 rounded-full">
          {opponentAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-foreground text-lg truncate">
            {opponentName}
          </h3>
          <p className="text-xs text-foregroundGrey truncate">{opponentDesc}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {computerThinking ? (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          ) : isPlayerTurn ? (
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
              Your Turn
            </span>
          ) : (
            <span className="text-xs font-bold text-foregroundGrey bg-neutral-800 px-2 py-0.5 rounded-full">
              Waiting...
            </span>
          )}
        </div>
      </div>

      {/* Chat Logs Area */}
      <div className="flex-1 my-4 overflow-y-auto min-h-[250px] max-h-[380px] p-2 bg-backgroundBoxBox/30 rounded-borderRoundness border border-neutral-800/50 flex flex-col gap-3 scrollbar-thin">
        {chatHistory.map((chat, idx) => {
          if (chat.role === "system") {
            return (
              <div
                key={idx}
                className="text-center text-xs text-foregroundGrey/60 italic my-1"
              >
                {chat.text}
              </div>
            );
          }

          const isUser = chat.role === "user";
          return (
            <div
              key={idx}
              className={`flex flex-col max-w-[80%] ${
                isUser ? "self-end items-end" : "self-start items-start"
              } animate-slideIn`}
            >
              <span className="text-[10px] text-foregroundGrey mb-0.5 px-1">
                {chat.name}
              </span>
              <div
                className={`p-3 rounded-2xl text-sm font-semibold shadow-sm leading-relaxed border ${
                  isUser
                    ? "bg-backgroundBoxBoxHighlighted border-neutral-700 text-foreground rounded-tr-none"
                    : "bg-backgroundBoxBox border-neutral-800 text-foreground/90 rounded-tl-none"
                }`}
              >
                {chat.text}
              </div>
            </div>
          );
        })}
        {computerThinking && (
          <div className="self-start flex flex-col items-start animate-pulse">
            <span className="text-[10px] text-foregroundGrey mb-0.5 px-1">
              {opponentName}
            </span>
            <div className="p-3 bg-backgroundBoxBox border border-neutral-800 text-foregroundGrey rounded-2xl rounded-tl-none text-xs flex gap-1.5 items-center">
              <span>Thinking</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-foregroundGrey animate-bounce"></span>
                <span className="w-1 h-1 rounded-full bg-foregroundGrey animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 rounded-full bg-foregroundGrey animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Gameplay Actions Panel */}
      <div className="flex flex-col gap-2">
        {isGameOver ? (
          <div className="text-center p-3 bg-neutral-800/30 rounded-borderRoundness border border-neutral-800 text-sm font-bold text-foregroundGrey">
            The game has ended.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleOfferDraw}
              className="py-3 px-4 rounded-borderRoundness font-bold text-sm bg-backgroundBoxBox border border-neutral-800 hover:bg-backgroundBoxBoxHover text-foregroundGrey hover:text-foreground transition-all flex justify-center items-center gap-1.5"
            >
              🤝 Offer Draw
            </button>
            <button
              onClick={handleResign}
              className="py-3 px-4 rounded-borderRoundness font-bold text-sm bg-red-950/20 border border-red-900/40 hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-all flex justify-center items-center gap-1.5"
            >
              🏳️ Resign
            </button>
          </div>
        )}
        <button
          onClick={() => setPageState("default")}
          className="w-full py-3 rounded-borderRoundness font-bold text-sm bg-backgroundBoxBox border border-neutral-800 hover:bg-backgroundBoxBoxHover text-foregroundGrey hover:text-foreground transition-all mt-1"
        >
          Exit Game
        </button>
      </div>
    </div>
  );
}
