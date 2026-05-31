import { useEffect, useRef, useState, useContext } from "react";
import Arrow from "../../svg/arrow";
import Image from "next/image";
import { Data, AnalyzeContext } from "@/context/analyze";
import { platform } from "../menu";

type format = [string, string, string];

export const FORMATS: format[] = [
  [
    "Chess.com",
    `${process.env.NEXT_PUBLIC_BASE_PATH}/images/chesscom.svg`,
    "platform",
  ],
  [
    "Lichess.org",
    `${process.env.NEXT_PUBLIC_BASE_PATH}/images/lichess.svg`,
    "platform",
  ],
  ["PGN", `${process.env.NEXT_PUBLIC_BASE_PATH}/images/pgn.svg`, "format"],
  ["FEN", `${process.env.NEXT_PUBLIC_BASE_PATH}/images/json.svg`, "format"],
];

type type = [string, string, number];

export const TYPES: type[] = [
  ["Quick", `${process.env.NEXT_PUBLIC_BASE_PATH}/images/quick.svg`, 15],
  ["Basic", `${process.env.NEXT_PUBLIC_BASE_PATH}/images/standard.svg`, 18],
  ["Deep", `${process.env.NEXT_PUBLIC_BASE_PATH}/images/deep.svg`, 21],
];

export default function Form(props: {
  setData: (data: Data) => void;
  selectGame: (username: string, platform: platform) => void;
  depth: [number, (depth: number) => void];
  selected: [number, (selected: number) => void];
}) {
  const { setData, selectGame } = props;

  const [isSelecting, setSelecting] = useState(false);
  const [value, setValue] = useState("");
  const [selected, select] = props.selected;
  const [depth, setDepth] = props.depth;

  const analyzeContext = useContext(AnalyzeContext);
  const [availableModels] = analyzeContext.availableModels;
  const [selectedModelId, setSelectedModelId] = analyzeContext.selectedModelId;

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const shiftPressed = useRef(false);

  useEffect(() => {
    const previousDepth = localStorage.getItem("depth");
    if (!previousDepth) return;

    const previousDepthNumber = Number(previousDepth);

    if (TYPES.some((type) => type[2] === previousDepthNumber)) {
      setDepth(previousDepthNumber);
    } else {
      setDepth(18);
      localStorage.setItem("depth", String(18));
    }
  }, []);

  useEffect(() => {
    const previousSelected = localStorage.getItem("format");
    if (!previousSelected) return;

    const previousSelectedNumber = Number(previousSelected);

    if (FORMATS[previousSelectedNumber] != null) {
      select(previousSelectedNumber);
    } else {
      select(0);
      localStorage.setItem("format", String(0));
    }
  }, []);

  useEffect(() => {
    setValue("");
    setSelecting(false);
  }, []);

  useEffect(() => {
    switch (FORMATS[selected][0]) {
      case "Chess.com":
        const previousChesscomUserName = localStorage.getItem("chesscom") ?? "";
        setValue(previousChesscomUserName);
        break;
      case "Lichess.org":
        const previousLichessorgUserName =
          localStorage.getItem("lichessorg") ?? "";
        setValue(previousLichessorgUserName);
        break;
      default:
        setValue("");
    }
  }, [selected]);

  function analyze(e: React.FormEvent) {
    e.preventDefault();

    switch (FORMATS[selected][0]) {
      case "Chess.com":
        localStorage.setItem("chesscom", value);
        selectGame(value, "chessCom");
        break;
      case "Lichess.org":
        localStorage.setItem("lichessorg", value);
        selectGame(value, "lichessOrg");
        break;
      case "PGN":
        setData({ format: "pgn", string: value });
        break;
      case "FEN":
        setData({ format: "fen", string: value });
        break;
    }
  }

  function changeSelected(i: number) {
    select(i);
    setSelecting(false);

    localStorage.setItem("format", String(i));

    const input = inputRef.current;
    input?.focus();
  }

  function changeDepth(depth: number) {
    setDepth(depth);

    localStorage.setItem("depth", String(depth));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !shiftPressed.current) {
      e.preventDefault();
      formRef.current?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    }
    if (e.key === "Shift") {
      shiftPressed.current = true;
    }
  }

  function handleKeyUp(e: React.KeyboardEvent) {
    if (e.key === "Shift") {
      shiftPressed.current = false;
    }
  }

  function isAPlatform(i: number) {
    return FORMATS[i][2] === "platform";
  }

  const inputPlaceholder = isAPlatform(selected)
    ? `Enter your ${FORMATS[selected][0]} user here`
    : `Paste your ${FORMATS[selected][0]} code here`;

  const analyzeValue = isAPlatform(selected) ? "List games" : "Analyze";

  return (
    <form
      ref={formRef}
      onSubmit={analyze}
      className="flex flex-col items-center gap-4"
    >
      <textarea
        spellCheck={false}
        rows={1}
        value={value}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setValue(e?.currentTarget.value)
        }
        ref={inputRef}
        placeholder={inputPlaceholder}
        className="w-[85%] px-2 py-[13px] flex items-center transition-colors text-xl font-bold rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none placeholder:text-placeholder placeholder:font-normal resize-none"
      />
      <div className="w-[85%] flex flex-col gap-2">
        <button
          type="button"
          className="flex flex-row gap-1 items-center justify-center w-full h-14 rounded-borderRoundness text-xl bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover hover:text-foregroundHighlighted transition-colors font-bold relative"
          onClick={(e) => {
            e.preventDefault();
            setSelecting((isSelecting) => !isSelecting);
          }}
        >
          <Image
            draggable={false}
            alt="icon"
            src={FORMATS[selected][1]}
            width={28}
            height={28}
          />
          {FORMATS[selected][0]}
          <div
            className={`absolute h-full right-6 top-0 flex flex-row items-center ${isSelecting ? "" : "rotate-180"}`}
          >
            <Arrow class="fill-foregroundGrey" />
          </div>
        </button>
        <div
          className="flex flex-col gap-2"
          style={{ display: isSelecting ? "" : "none" }}
        >
          <h6 className="mt-2 font-bold flex flex-row gap-1">
            <Image
              alt="depth"
              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/formats.svg`}
              width={18}
              height={18}
            />
            Game Formats
          </h6>
          <ul className="grid grid-cols-2 gap-3">
            {FORMATS.map((format, i) => {
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => changeSelected(i)}
                    style={{ gap: i !== 0 ? ".4rem" : "0" }}
                    className="flex flex-row items-center justify-center h-12 w-full hover:text-foregroundHighlighted rounded-borderRoundness text-md bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover transition-colors font-bold"
                  >
                    <Image
                      draggable={false}
                      alt="format"
                      src={format[1]}
                      width={150}
                      height={0}
                      className="h-6 w-fit"
                      priority
                    />
                    {format[0]}
                  </button>
                </li>
              );
            })}
          </ul>
          <h6 className="mt-2 font-bold flex flex-row gap-2">
            <Image
              priority
              alt="depth"
              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/type.svg`}
              width={20}
              height={0}
            />
            Analysis Type
          </h6>
          <ul className="grid grid-cols-3 gap-3">
            {TYPES.map((type, i) => {
              return (
                <li key={i}>
                  <button
                    title={`Depth: ${type[2]}`}
                    type="button"
                    onClick={() => changeDepth(type[2])}
                    style={{ gap: i !== 0 ? ".4rem" : "0" }}
                    className={`flex flex-row items-center justify-center h-10 w-full hover:text-foregroundHighlighted rounded-borderRoundness text-md bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover transition-colors font-bold border-backgroundBoxBoxHighlighted ${depth === type[2] ? "border-[2px]" : ""}`}
                  >
                    <Image
                      draggable={false}
                      alt="format"
                      src={type[1]}
                      width={150}
                      height={0}
                      className="h-5 w-fit"
                      priority
                    />
                    {type[0]}
                  </button>
                </li>
              );
            })}
          </ul>
          {availableModels.length > 0 && (
            <>
              <h6 className="mt-2 font-bold flex flex-row gap-2">
                <Image
                  priority
                  alt="engine"
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/settings.svg`}
                  width={20}
                  height={20}
                />
                Stockfish Model
              </h6>
              <ul className="grid grid-cols-1 gap-2">
                {availableModels.map((model) => (
                  <li key={model.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedModelId(model.id)}
                      className={`flex flex-row items-center justify-between px-4 h-10 w-full hover:text-foregroundHighlighted rounded-borderRoundness text-md bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover transition-colors font-bold border-backgroundBoxBoxHighlighted ${selectedModelId === model.id ? "border-[2px]" : ""}`}
                    >
                      <span>{model.name}</span>
                      {selectedModelId === model.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-foreground" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      <input
        type="submit"
        className="w-[85%] h-16 cursor-pointer rounded-borderExtraRoundness text-2xl bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover transition-all font-extrabold hover:shadow-shadowBoxBoxHighlighted"
        value={analyzeValue}
      />
    </form>
  );
}
