"use client";

import { AllGameArrows } from "@/components/game/game";
import { move, result, square } from "@/engine/stockfish";
import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  useRef,
  useEffect,
} from "react";

export type players = {
  name: string;
  elo: string;
}[];

export interface Data {
  format: "pgn" | "fen";
  string: string;
}

export interface Controller {
  back: () => void;
  forward: () => void;
  first: () => void;
  last: () => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
}

export interface CustomLine {
  baseMoveNumber: number;
  moveNumber: number;
  moves: move[];
  arrows: AllGameArrows;
}

export interface VariationLine {
  id: string;
  name: string;
  baseMoveNumber: number;
  moveNumber: number;
  moves: move[];
  arrows: AllGameArrows;
  createdAt: number;
}

export interface ReviewState {
  active: boolean;
  mistakeIndex: number;
  solved: boolean;
  wrong: boolean;
  playedMove: square[] | null;
  theme: string;
  explanation: string;
  loadingExplanation: boolean;
}

export interface PlayConfig {
  color: "w" | "b" | "random";
  opponent: "stockfish" | "ai";
  level: number;
  personality: string;
}

type pageState =
  | "default"
  | "loading"
  | "analyze"
  | "analyzeCustom"
  | "playComputer";

type tabs =
  | "analyze"
  | "selectGame"
  | "summary"
  | "moves"
  | "mistakes"
  | "library"
  | "profile";

const abortControllerInstance = new AbortController();

export const AnalyzeContext = createContext<{
  data: [Data, Dispatch<SetStateAction<Data>>];
  pageState: [pageState, Dispatch<SetStateAction<pageState>>];
  game: [move[], Dispatch<SetStateAction<move[]>>];
  players: [players, Dispatch<SetStateAction<players>>];
  moveNumber: [number, Dispatch<SetStateAction<number>>];
  forward: [boolean, Dispatch<SetStateAction<boolean>>];
  animation: [boolean, Dispatch<SetStateAction<boolean>>];
  white: [boolean, Dispatch<SetStateAction<boolean>>];
  playing: [boolean, Dispatch<SetStateAction<boolean>>];
  time: [number, Dispatch<SetStateAction<number>>];
  materialAdvantage: [number, Dispatch<SetStateAction<number>>];
  result: [result, Dispatch<SetStateAction<result>>];
  progress: [number, Dispatch<SetStateAction<number>>];
  tab: [tabs, Dispatch<SetStateAction<tabs>>];
  availableModels: [
    { id: string; name: string }[],
    Dispatch<SetStateAction<{ id: string; name: string }[]>>,
  ];
  selectedModelId: [string, Dispatch<SetStateAction<string>>];
  analyzeController: [
    AbortController,
    Dispatch<SetStateAction<AbortController>>,
  ];
  customLine: [CustomLine, Dispatch<SetStateAction<CustomLine>>];
  variations: [VariationLine[], Dispatch<SetStateAction<VariationLine[]>>];
  returnedToNormalGame: [
    square[] | null,
    Dispatch<SetStateAction<square[] | null>>,
  ];
  analyzingMove: [boolean, Dispatch<SetStateAction<boolean>>];
  depth: [number, Dispatch<SetStateAction<number>>];
  reviewState: [ReviewState, Dispatch<SetStateAction<ReviewState>>];
  evalWorker: [Worker | null, Dispatch<SetStateAction<Worker | null>>];
  evalWorker2: [Worker | null, Dispatch<SetStateAction<Worker | null>>];
  playConfig: [PlayConfig, Dispatch<SetStateAction<PlayConfig>>];
  playerColor: ["w" | "b", Dispatch<SetStateAction<"w" | "b">>];
  computerThinking: [boolean, Dispatch<SetStateAction<boolean>>];
  chatHistory: [
    { role: "user" | "ai" | "system"; text: string; name: string }[],
    Dispatch<
      SetStateAction<
        { role: "user" | "ai" | "system"; text: string; name: string }[]
      >
    >,
  ];
  gameController: Controller;
}>({
  data: [{ format: "fen", string: "" }, () => {}],
  pageState: ["analyze", () => {}],
  game: [[], () => {}],
  players: [[], () => {}],
  moveNumber: [0, () => {}],
  forward: [true, () => {}],
  animation: [false, () => {}],
  white: [true, () => {}],
  playing: [false, () => {}],
  time: [0, () => {}],
  materialAdvantage: [0, () => {}],
  result: ["", () => {}],
  progress: [0, () => {}],
  tab: ["analyze", () => {}],
  availableModels: [[], () => {}],
  selectedModelId: ["", () => {}],
  analyzeController: [abortControllerInstance, () => {}],
  customLine: [
    { baseMoveNumber: 0, moveNumber: -1, moves: [], arrows: {} },
    () => {},
  ],
  variations: [[], () => {}],
  returnedToNormalGame: [null, () => {}],
  analyzingMove: [false, () => {}],
  depth: [18, () => {}],
  reviewState: [
    {
      active: false,
      mistakeIndex: -1,
      solved: false,
      wrong: false,
      playedMove: null,
      theme: "",
      explanation: "",
      loadingExplanation: false,
    },
    () => {},
  ],
  evalWorker: [null, () => {}],
  evalWorker2: [null, () => {}],
  playConfig: [
    {
      color: "w",
      opponent: "stockfish",
      level: 1,
      personality: "The Chatty Coach",
    },
    () => {},
  ],
  playerColor: ["w", () => {}],
  computerThinking: [false, () => {}],
  chatHistory: [[], () => {}],
  gameController: {
    back: () => {},
    forward: () => {},
    last: () => {},
    first: () => {},
    play: () => {},
    pause: () => {},
    togglePlay: () => {},
  },
});

export default function AnalyzeContextProvider(props: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<Data>({ format: "fen", string: "" });
  const [pageState, setPageState] = useState<pageState>("default");
  const [game, setGame] = useState<move[]>([]);
  const [players, setPlayers] = useState<players>([
    { name: "White", elo: "?" },
    { name: "Black", elo: "?" },
  ]);
  const [moveNumber, setMoveNumber] = useState(0);
  const [forward, setForward] = useState(true);
  const [animation, setAnimation] = useState(true);
  const [white, setWhite] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [materialAdvantage, setMaterialAdvantage] = useState(0);
  const [result, setResult] = useState<result>("");
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState<tabs>("analyze");
  const [availableModels, setAvailableModels] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [analyzeController, setAnalyzeController] = useState<AbortController>(
    abortControllerInstance,
  );
  const [customLine, setCustomLine] = useState<CustomLine>({
    baseMoveNumber: 0,
    moveNumber: -1,
    moves: [],
    arrows: {},
  });
  const [variations, setVariations] = useState<VariationLine[]>([]);
  const [returnedToNormalGame, setReturnedToNormalGame] = useState<
    square[] | null
  >(null);
  const [analyzingMove, setAnalyzingMove] = useState(false);
  const [depth, setDepth] = useState(18);
  const [reviewState, setReviewState] = useState<ReviewState>({
    active: false,
    mistakeIndex: -1,
    solved: false,
    wrong: false,
    playedMove: null,
    theme: "",
    explanation: "",
    loadingExplanation: false,
  });
  const [evalWorker, setEvalWorker] = useState<Worker | null>(null);
  const [evalWorker2, setEvalWorker2] = useState<Worker | null>(null);
  const [playConfig, setPlayConfig] = useState<PlayConfig>({
    color: "w",
    opponent: "stockfish",
    level: 1,
    personality: "The Chatty Coach",
  });
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [computerThinking, setComputerThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "ai" | "system"; text: string; name: string }[]
  >([]);

  const moveNumberRef = useRef(moveNumber);
  const customLineRef = useRef(customLine);
  const gameLengthRef = useRef(game.length);

  useEffect(() => {
    customLineRef.current = customLine;
  }, [customLine]);

  useEffect(() => {
    moveNumberRef.current = moveNumber;
  }, [moveNumber]);

  useEffect(() => {
    gameLengthRef.current = game.length;
  }, [game.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem("variations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as VariationLine[];
        if (Array.isArray(parsed)) setVariations(parsed);
      } catch {
        setVariations([]);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const pgnParam = params.get("pgn");
    const fenParam = params.get("fen");

    if (pgnParam) {
      setData({ format: "pgn", string: decodeURIComponent(pgnParam) });
    } else if (fenParam) {
      setData({ format: "fen", string: decodeURIComponent(fenParam) });
    }
  }, []);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return;

    async function fetchModels() {
      try {
        const res = await fetch(`${backendUrl}/api/models`);
        if (res.ok) {
          const data = await res.json();
          setAvailableModels(data.models || []);
          const savedModelId = window.localStorage.getItem("selectedModelId");
          const isValidSaved = data.models?.some(
            (m: any) => m.id === savedModelId,
          );
          if (isValidSaved && savedModelId) {
            setSelectedModelId(savedModelId);
          } else if (data.default) {
            setSelectedModelId(data.default);
          }
        }
      } catch (err) {
        console.error("Failed to fetch Stockfish models:", err);
      }
    }
    fetchModels();
  }, []);

  useEffect(() => {
    if (selectedModelId) {
      window.localStorage.setItem("selectedModelId", selectedModelId);
    }
  }, [selectedModelId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("variations", JSON.stringify(variations));
  }, [variations]);

  const gameController: Controller = {
    back: () => {
      if (customLineRef.current.moveNumber > 0) {
        setForward(false);
        setAnimation(true);
        setReturnedToNormalGame(null);
        setCustomLine((prev) => ({ ...prev, moveNumber: prev.moveNumber - 1 }));
      } else if (customLineRef.current.moveNumber === 0) {
        setForward(false);
        setAnimation(true);
        setReturnedToNormalGame(
          customLineRef.current.moves[0].movement ?? null,
        );
        setCustomLine({
          baseMoveNumber: moveNumberRef.current,
          moveNumber: -1,
          moves: [],
          arrows: {},
        });
      } else if (moveNumberRef.current > 0) {
        setForward(false);
        setAnimation(true);
        setReturnedToNormalGame(null);
        setMoveNumber((prev) => prev - 1);
      }
    },
    forward: () => {
      setReturnedToNormalGame(null);
      if (customLineRef.current.moveNumber >= 0) {
        if (
          customLineRef.current.moveNumber <
          customLineRef.current.moves.length - 1
        ) {
          setForward(true);
          setAnimation(true);
          setCustomLine((prev) => ({
            ...prev,
            moveNumber: prev.moveNumber + 1,
          }));
        }
        return;
      } else if (moveNumberRef.current < gameLengthRef.current - 1) {
        setForward(true);
        setAnimation(true);
        setMoveNumber((prev) => prev + 1);
      }
    },
    first: () => {
      if (customLineRef.current.moveNumber >= 0) {
        setAnimation(false);
        setReturnedToNormalGame(
          customLineRef.current.moves[0].movement ?? null,
        );
        setCustomLine({
          baseMoveNumber: moveNumberRef.current,
          moveNumber: -1,
          moves: [],
          arrows: {},
        });
      } else {
        setAnimation(false);
        setReturnedToNormalGame(null);
        setMoveNumber(0);
      }
    },
    last: () => {
      setReturnedToNormalGame(null);
      if (customLineRef.current.moveNumber >= 0) {
        setAnimation(false);
        setCustomLine((prev) => ({
          ...prev,
          moveNumber: prev.moves.length - 1,
        }));
      } else {
        setAnimation(false);
        setMoveNumber(gameLengthRef.current - 1);
      }
    },
    togglePlay: () => {
      setPlaying((prev) => !prev);
    },
    play: () => {
      setPlaying(true);
    },
    pause: () => {
      setPlaying(false);
    },
  };

  return (
    <AnalyzeContext.Provider
      value={{
        data: [data, setData],
        pageState: [pageState, setPageState],
        game: [game, setGame],
        players: [players, setPlayers],
        moveNumber: [moveNumber, setMoveNumber],
        forward: [forward, setForward],
        white: [white, setWhite],
        animation: [animation, setAnimation],
        playing: [playing, setPlaying],
        time: [time, setTime],
        materialAdvantage: [materialAdvantage, setMaterialAdvantage],
        result: [result, setResult],
        progress: [progress, setProgress],
        tab: [tab, setTab],
        availableModels: [availableModels, setAvailableModels],
        selectedModelId: [selectedModelId, setSelectedModelId],
        analyzeController: [analyzeController, setAnalyzeController],
        customLine: [customLine, setCustomLine],
        variations: [variations, setVariations],
        returnedToNormalGame: [returnedToNormalGame, setReturnedToNormalGame],
        analyzingMove: [analyzingMove, setAnalyzingMove],
        depth: [depth, setDepth],
        reviewState: [reviewState, setReviewState],
        evalWorker: [evalWorker, setEvalWorker],
        evalWorker2: [evalWorker2, setEvalWorker2],
        playConfig: [playConfig, setPlayConfig],
        playerColor: [playerColor, setPlayerColor],
        computerThinking: [computerThinking, setComputerThinking],
        chatHistory: [chatHistory, setChatHistory],
        gameController,
      }}
    >
      {props.children}
    </AnalyzeContext.Provider>
  );
}
