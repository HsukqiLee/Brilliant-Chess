import { Dataset, getPropsDataset } from "./piece"

export type ResultName = "victory" | "draw" | "defeat"

function Victory({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            id="svg5"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs id="defs2" />
            <g id="layer1">
            <ellipse
                style={{
                fill: "#83b84f",
                fillOpacity: 1,
                stroke: "none",
                strokeWidth: 0.999462,
                }}
                id="path111"
                cx={60}
                cy={59.773922}
                rx={60}
                ry={59.773922}
            />
            </g>
            <g id="layer5">
            <path
                style={{
                display: "inline",
                fill: "#ffffff",
                fillOpacity: 1,
                stroke: "none",
                strokeWidth: 21.6141,
                strokeLinecap: "butt",
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 1,
                }}
                d="M 25.492186,80.777068 20.5625,39.303716 43.264292,52.38658 59.99998,30.117829 76.73567,52.38658 99.43746,39.303716 94.507774,80.777068 c 0,0 -35.841521,10.436463 -69.015588,0 z"
                id="path4"
            />
            </g>
        </svg>
    )
}

function Draw({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            id="svg5"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs id="defs2" />
            <g
            id="layer1"
            style={{
                display: "inline",
            }}
            >
            <ellipse
                style={{
                fill: "#545250",
                fillOpacity: 1,
                stroke: "none",
                strokeWidth: 0.999462,
                }}
                id="path111"
                cx={60}
                cy={60.385693}
                rx={60}
                ry={59.773922}
            />
            </g>
            <g id="layer2">
            <path
                d="M 38.375904,65.969456 H 28.196036 V 44.916429 h -8.38342 V 38.60399 q 4.303988,0 6.848955,-1.213931 2.544967,-1.248615 2.844375,-3.81521 h 8.869958 z M 74.454548,33.401431 45.075154,85.357662 h -9.88046 L 64.574091,33.401431 Z m 22.979553,51.956231 h -29.60395 v -6.555226 q 2.61982,-1.4914 5.277062,-3.121536 2.69467,-1.630135 4.640822,-3.052168 3.892301,-2.87875 5.015082,-4.647621 1.122779,-1.803553 1.122779,-3.884578 0,-2.011656 -1.534462,-3.121535 -1.497039,-1.10988 -4.341413,-1.10988 -2.61982,0 -5.164788,1.040512 -2.544967,1.005828 -3.929728,1.734187 h -0.860798 v -8.220044 q 2.619819,-0.83241 5.838455,-1.456718 3.256057,-0.65899 7.073507,-0.65899 6.886381,0 10.516705,2.566596 3.630316,2.566596 3.630316,7.352951 0,3.017485 -1.422187,5.584081 -1.422187,2.566597 -5.539045,6.000286 -1.272484,1.040512 -2.769523,2.081024 -1.497039,1.005828 -3.443191,2.323809 h 15.494357 z"
                id="text3"
                style={{
                fontWeight: "bold",
                fontSize: 96,
                lineHeight: 0,
                fontFamily: "Tahoma",
                whiteSpace: "pre",
                fillOpacity: 0.4,
                strokeWidth: 13.0634,
                strokeLinejoin: "round",
                }}
                aria-label="\xBD"
            />
            </g>
            <g
            id="layer5"
            style={{
                display: "inline",
            }}
            >
            <path
                style={{
                fontWeight: "bold",
                fontSize: 96,
                lineHeight: 0,
                fontFamily: "Tahoma",
                whiteSpace: "pre",
                fill: "#ffffff",
                strokeWidth: 13.0634,
                strokeLinejoin: "round",
                }}
                d="M 38.375904,63.76256 H 28.196036 V 42.709535 h -8.38342 v -6.312439 q 4.303988,0 6.848955,-1.213931 2.544967,-1.248615 2.844375,-3.815211 h 8.869958 z M 74.454548,31.194536 45.075154,83.150767 h -9.88046 L 64.574091,31.194536 Z m 22.979553,51.956231 h -29.60395 v -6.555226 q 2.61982,-1.4914 5.277062,-3.121536 2.69467,-1.630135 4.640822,-3.052168 3.892301,-2.87875 5.015082,-4.64762 1.122779,-1.803554 1.122779,-3.884578 0,-2.011657 -1.534462,-3.121537 -1.497039,-1.109879 -4.341413,-1.109879 -2.61982,0 -5.164788,1.040512 -2.544967,1.005829 -3.929728,1.734186 h -0.860798 v -8.220043 q 2.619819,-0.832409 5.838455,-1.456717 3.256057,-0.658991 7.073507,-0.658991 6.886381,0 10.516705,2.566596 3.630316,2.566597 3.630316,7.352951 0,3.017486 -1.422187,5.584081 -1.422187,2.566597 -5.539045,6.000286 -1.272484,1.040512 -2.769523,2.081024 -1.497039,1.005829 -3.443191,2.32381 h 15.494357 z"
                id="text2"
                aria-label="\xBD"
            />
            </g>
        </svg>
    )
}

function Defeat({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            id="svg5"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs id="defs2" />
            <g id="layer1">
            <ellipse
                style={{
                fill: "#e02828",
                fillOpacity: 1,
                stroke: "none",
                strokeWidth: 0.999462,
                }}
                id="path111"
                cx={60}
                cy={59.773922}
                rx={60}
                ry={59.773922}
            />
            </g>
            <g id="layer4">
            <path
                style={{
                fill: "#000000",
                fillOpacity: 1,
                stroke: "none",
                strokeWidth: 14.1458,
                strokeLinecap: "butt",
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 1,
                }}
                d="M 41.715833,82.745398 31.661004,94.420662 v 6.810578 H 88.333675 V 94.420662 L 78.278846,82.745398 Z"
                id="path4"
            />
            </g>
            <g
            id="layer2"
            style={{
                display: "inline",
            }}
            >
            <path
                style={{
                display: "inline",
                fill: "#000000",
                fillOpacity: 1,
                stroke: "#4d4d4d",
                strokeWidth: 0,
                strokeLinecap: "round",
                strokeLinejoin: "round",
                }}
                d="m 53.071787,23.086221 v -9.238178 h 13.856672 v 9.238178 h 9.237784 V 36.942894 H 66.928459 V 91.225935 L 53.071787,91.572112 V 36.942894 H 43.834 V 23.086221 Z"
                id="path1"
            />
            </g>
            <g
            id="layer3"
            transform="translate(3.4432343)"
            style={{
                display: "inline",
            }}
            >
            <path
                style={{
                fill: "none",
                fillOpacity: 1,
                stroke: "#000000",
                strokeWidth: 15.996,
                strokeLinecap: "butt",
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 1,
                }}
                d="m 58.993978,95.892176 c 0,0 56.744932,-59.766856 -2.182497,-46.168221"
                id="path2"
            />
            <path
                style={{
                fill: "none",
                fillOpacity: 1,
                stroke: "#000000",
                strokeWidth: 15.996,
                strokeLinecap: "butt",
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 1,
                }}
                d="m 54.119502,95.892176 c 0,0 -56.744929,-59.766856 2.182497,-46.168221"
                id="path3"
            />
            </g>
        </svg>
    )
}

export default function ResultSVG({ result, size, dataset, draggable, className, style, title }: { result: ResultName, size: number, dataset?: Dataset, draggable?: boolean, className?: string, style?: React.CSSProperties, title?: string }) {
    const propsDataset = getPropsDataset(dataset ?? {})
    const ratingProps = {size}

    return (
        <div title={title} draggable={draggable} {...propsDataset} className={className} style={style}>
            {(() => {
                switch (result) {
                    case 'victory':
                        return <Victory {...ratingProps} />
                    case 'draw':
                        return <Draw {...ratingProps} />
                    case 'defeat':
                        return <Defeat {...ratingProps} />
                }
            })()}
        </div>
    )
}