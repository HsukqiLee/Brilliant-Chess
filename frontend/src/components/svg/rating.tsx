import { moveRating } from "@/engine/stockfish";
import { Dataset, getPropsDataset } from "./piece";

function Brilliant({ size }: { size: number }) {
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
                fill: "#04b8ad",
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
            <g id="layer3" transform="matrix(1.0629456,0,0,1,-2.2030973,-5)">
            <g id="layer4">
                <g
                id="g13717"
                style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                }}
                transform="translate(0,3)"
                >
                <rect
                    style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    }}
                    id="rect5486"
                    width={15}
                    height={15}
                    x={36}
                    y={82.5}
                    rx={1.5}
                    ry={1.5}
                />
                <path
                    style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    strokeWidth: 0,
                    strokeLinecap: "butt",
                    strokeLinejoin: "bevel",
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                    }}
                    d="m 37.467037,75 h 12 a 1.5337037,1.5337037 135.63652 0 0 1.533325,-1.49963 l 0.93335,-42.00074 A 1.467037,1.467037 45.636515 0 0 50.467037,30 h -14 a 1.467037,1.467037 134.36348 0 0 -1.466675,1.49963 l 0.93335,42.00074 A 1.5337037,1.5337037 44.363485 0 0 37.467037,75 Z"
                    id="path10068"
                />
                </g>
                <rect
                style={{
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "none",
                }}
                id="rect13713"
                width={15}
                height={15}
                x={36}
                y={82.5}
                rx={1.5}
                ry={1.5}
                />
                <path
                style={{
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "none",
                    strokeWidth: 0,
                    strokeLinecap: "butt",
                    strokeLinejoin: "bevel",
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                }}
                d="m 37.467037,75 h 12 a 1.5337037,1.5337037 135.63652 0 0 1.533325,-1.49963 l 0.93335,-42.00074 A 1.467037,1.467037 45.636515 0 0 50.467037,30 h -14 a 1.467037,1.467037 134.36348 0 0 -1.466675,1.49963 l 0.93335,42.00074 A 1.5337037,1.5337037 44.363485 0 0 37.467037,75 Z"
                id="path13715"
                />
            </g>
            <g id="g17427" transform="translate(30.105023)">
                <g
                id="g17421"
                style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                }}
                transform="translate(0,3)"
                >
                <rect
                    style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    }}
                    id="rect17417"
                    width={15}
                    height={15}
                    x={36}
                    y={82.5}
                    rx={1.5}
                    ry={1.5}
                />
                <path
                    style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    strokeWidth: 0,
                    strokeLinecap: "butt",
                    strokeLinejoin: "bevel",
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                    }}
                    d="m 37.467037,75 h 12 a 1.5337037,1.5337037 135.63652 0 0 1.533325,-1.49963 l 0.93335,-42.00074 A 1.467037,1.467037 45.636515 0 0 50.467037,30 h -14 a 1.467037,1.467037 134.36348 0 0 -1.466675,1.49963 l 0.93335,42.00074 A 1.5337037,1.5337037 44.363485 0 0 37.467037,75 Z"
                    id="path17419"
                />
                </g>
                <rect
                style={{
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "none",
                }}
                id="rect17423"
                width={15}
                height={15}
                x={36}
                y={82.5}
                rx={1.5}
                ry={1.5}
                />
                <path
                style={{
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "none",
                    strokeWidth: 0,
                    strokeLinecap: "butt",
                    strokeLinejoin: "bevel",
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                }}
                d="m 37.467037,75 h 12 a 1.5337037,1.5337037 135.63652 0 0 1.533325,-1.49963 l 0.93335,-42.00074 A 1.467037,1.467037 45.636515 0 0 50.467037,30 h -14 a 1.467037,1.467037 134.36348 0 0 -1.466675,1.49963 l 0.93335,42.00074 A 1.5337037,1.5337037 44.363485 0 0 37.467037,75 Z"
                id="path17425"
                />
            </g>
            </g>
        </svg>
    )
}

function Great({ size }: { size: number }) {
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
                fill: "#5c8bb0",
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
            <g id="layer4" transform="matrix(1.0629456,0,0,1,13.796904,-0.25)">
            <g
                id="g13717"
                style={{
                fill: "#000000",
                fillOpacity: 0.4,
                }}
                transform="translate(0,3)"
            >
                <rect
                style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                }}
                id="rect5486"
                width={15}
                height={15}
                x={36}
                y={82.5}
                rx={1.5}
                ry={1.5}
                />
                <path
                style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    strokeWidth: 0,
                    strokeLinecap: "butt",
                    strokeLinejoin: "bevel",
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                }}
                d="m 37.467037,75 h 12 a 1.5275206,1.5275206 135.52081 0 0 1.527268,-1.499752 L 51.939769,21.499752 A 1.4729752,1.4729752 45.520813 0 0 50.467037,20 h -14 a 1.4729752,1.4729752 134.47919 0 0 -1.472732,1.499752 l 0.945464,52.000496 A 1.5275206,1.5275206 44.479187 0 0 37.467037,75 Z"
                id="path10068"
                />
            </g>
            <rect
                style={{
                fill: "#ffffff",
                fillOpacity: 1,
                stroke: "none",
                }}
                id="rect13713"
                width={15}
                height={15}
                x={36}
                y={82.5}
                rx={1.5}
                ry={1.5}
            />
            <path
                style={{
                fill: "#ffffff",
                fillOpacity: 1,
                stroke: "none",
                strokeWidth: 0,
                strokeLinecap: "butt",
                strokeLinejoin: "bevel",
                strokeDasharray: "none",
                strokeOpacity: 1,
                }}
                d="m 37.467037,75 h 12 a 1.5275206,1.5275206 135.52081 0 0 1.527268,-1.499752 L 51.939769,21.499752 A 1.4729752,1.4729752 45.520813 0 0 50.467037,20 h -14 a 1.4729752,1.4729752 134.47919 0 0 -1.472732,1.499752 l 0.945464,52.000496 A 1.5275206,1.5275206 44.479187 0 0 37.467037,75 Z"
                id="path13715"
            />
            </g>
        </svg>
    )
}

function Best({ size }: { size: number }) {
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
            <circle
                style={{
                fill: "#96bc4b",
                fillOpacity: 1,
                stroke: "none",
                strokeWidth: 1.00135,
                }}
                id="path111"
                cx={60}
                cy={60}
                r={60}
            />
            </g>
            <g id="layer2">
            <path
                style={{
                fill: "#ffffff",
                fillOpacity: 1,
                stroke: "#000000",
                strokeWidth: 5.72162,
                strokeLinecap: "butt",
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 0.4,
                }}
                id="path16741"
                d="M 66.776277,45.238689 75.263044,67.935161 99.471227,68.992963 80.508155,84.077954 86.982866,107.42818 66.776276,94.054749 46.569684,107.42818 53.044396,84.077954 34.081325,68.992961 58.289507,67.935161 Z"
                transform="matrix(1.1250069,0,0,1.1250069,-15.123769,-26.437045)"
            />
            <path
                style={{
                fill: "#ffffff",
                fillOpacity: 1,
                stroke: "#ffffff",
                strokeWidth: 5.72162,
                strokeLinecap: "butt",
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 1,
                }}
                id="path7975"
                d="M 66.776277,45.238689 75.263044,67.935161 99.471227,68.992963 80.508155,84.077954 86.982866,107.42818 66.776276,94.054749 46.569684,107.42818 53.044396,84.077954 34.081325,68.992961 58.289507,67.935161 Z"
                transform="matrix(1.1250069,0,0,1.1250069,-15.123769,-29.875923)"
            />
            </g>
        </svg>
    )
}

function Excellent({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            id="svg5"
            xmlSpace="preserve"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs id="defs2" />
            <g
            id="layer1"
            style={{
                display: "inline",
            }}
            >
            <circle
                style={{
                fill: "#96bc4b",
                fillOpacity: 1,
                stroke: "none",
                strokeWidth: 1.00135,
                }}
                id="path111"
                cx={60}
                cy={60}
                r={60}
            />
            </g>
            <g
            id="g31996"
            transform="translate(-1.617908,3.1807846)"
            style={{
                fill: "#000000",
                fillOpacity: 0.4,
            }}
            >
            <path
                style={{
                fill: "#000000",
                fillOpacity: 0.4,
                stroke: "#000000",
                strokeWidth: 0,
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 0.4,
                }}
                d="m 47.37902,51.908793 c 11.080052,-8.625904 22.551638,-18.332397 22.551638,-30.469116 13.018296,-7.253311 9.590358,16.034594 7.51367,21.497879 -0.815753,6.708204 5.315057,5.912592 13.358129,5.561976 7.467461,-1.542733 8.807047,6.274402 5.976401,11.281572 2.476894,4.388739 1.98924,8.519712 -1.879967,11.799609 3.310759,4.736985 0.47502,7.428659 -3.686437,10.688287 1.69328,14.541232 -36.529435,3.584955 -43.914017,3.204706 z"
                id="path31992"
            />
            <rect
                style={{
                fill: "#000000",
                fillOpacity: 0.4,
                stroke: "#000000",
                strokeWidth: 0,
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 0.4,
                }}
                id="rect31994"
                width={17.808558}
                height={37.697556}
                x={24.933908}
                y={50.083008}
                ry={3.3236432}
            />
            </g>
            <g id="layer4" transform="translate(-1.617908,-0.05254178)">
            <path
                style={{
                fill: "#ffffff",
                stroke: "#000000",
                strokeWidth: 0,
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 0.4,
                }}
                d="m 47.37902,51.908793 c 11.080052,-8.625904 22.551638,-18.332397 22.551638,-30.469116 13.018296,-7.253311 9.590358,16.034594 7.51367,21.497879 -0.815753,6.708204 5.315057,5.912592 13.358129,5.561976 7.467461,-1.542733 8.807047,6.274402 5.976401,11.281572 2.476894,4.388739 1.98924,8.519712 -1.879967,11.799609 3.310759,4.736985 0.47502,7.428659 -3.686437,10.688287 1.69328,14.541232 -36.529435,3.584955 -43.914017,3.204706 z"
                id="path31972"
            />
            <rect
                style={{
                fill: "#ffffff",
                stroke: "#000000",
                strokeWidth: 0,
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 0.4,
                }}
                id="rect5260"
                width={17.808558}
                height={37.697556}
                x={24.933908}
                y={50.083008}
                ry={3.3236432}
            />
            </g>
        </svg>
    )
}

function Good({ size }: { size: number }) {
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
            <circle
                style={{
                fill: "#95af8a",
                fillOpacity: 1,
                stroke: "none",
                strokeWidth: 1.00135,
                }}
                id="path111"
                cx={60}
                cy={60}
                r={60}
            />
            </g>
            <g id="layer3">
            <path
                style={{
                fill: "#ffffff",
                fillOpacity: 0,
                stroke: "#000000",
                strokeWidth: 4.8378,
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 0.4,
                }}
                d="M 31.204526,57.722584 48.905704,76.466308 89.252302,38.363832 96.994586,46.562114 48.449706,92.406873 23.006245,65.464867 Z"
                id="path32391-3"
            />
            </g>
            <g id="layer2">
            <path
                style={{
                fill: "#ffffff",
                fillOpacity: 1,
                stroke: "#ffffff",
                strokeWidth: 4.83869,
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 1,
                }}
                d="M 31.204026,54.135255 48.905204,72.878979 89.251802,34.776503 96.994086,42.974785 48.449206,88.819544 23.005745,61.877538 Z"
                id="path32391"
            />
            </g>
        </svg>
    )
}

function Book({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            id="svg5"
            xmlSpace="preserve"
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
                display: "inline",
                fill: "#a98866",
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
            <g id="layer2">
            <g id="layer3">
                <path
                style={{
                    display: "inline",
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    strokeWidth: 4.34391,
                    strokeLinejoin: "round",
                }}
                d="m 20.448744,32.537329 c 17.662962,-0.803674 28.965997,1.545309 34.307091,6.849663 V 94.068041 C 47.199259,90.203754 36.868563,87.470164 20.448744,87.218371 Z"
                id="path6305"
                />
                <path
                style={{
                    display: "inline",
                    fill: "#fefefd",
                    fillOpacity: 1,
                    stroke: "none",
                    strokeWidth: 4.18857,
                    strokeLinejoin: "round",
                }}
                d="m 24.565815,27.793565 c 16.422272,-0.803673 26.931354,1.545309 31.897276,6.849663 V 89.324276 C 49.437307,85.459993 39.832265,82.726397 24.565815,82.474609 Z"
                id="path23455"
                />
            </g>
            <g id="layer4">
                <path
                style={{
                    display: "inline",
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    strokeWidth: 4.34391,
                    strokeLinejoin: "round",
                }}
                d="M 99.551451,32.537329 C 81.888489,31.733655 70.585454,34.082638 65.24436,39.386992 v 54.681044 c 7.556576,-3.86428 17.887272,-6.59787 34.307091,-6.84967 z"
                id="path29297"
                />
                <path
                style={{
                    display: "inline",
                    fill: "#fefefd",
                    fillOpacity: 1,
                    stroke: "none",
                    strokeWidth: 4.18857,
                    strokeLinejoin: "round",
                }}
                d="m 95.434569,27.793565 c -16.42227,-0.803673 -26.931353,1.545309 -31.897275,6.849663 v 54.681048 c 7.025785,-3.864283 16.630827,-6.597879 31.897275,-6.849667 z"
                id="path6305-6"
                />
            </g>
            </g>
        </svg>
    )
}

function Inaccuracy({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            id="svg5"
            xmlSpace="preserve"
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
                fill: "#f7c045",
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
            <g id="layer3" transform="matrix(1.0629456,0,0,1,-2.2030973,-5)">
            <g id="layer4" transform="matrix(0.94078192,0,0,1,2.0726341,5)">
                <g
                aria-label="?"
                id="text78741"
                style={{
                    fontSize: "89.1793px",
                    fontFamily: "'DejaVu Sans Mono'",
                    fill: "#ffffff",
                    stroke: "#ffffff",
                    strokeWidth: 4.77487,
                    strokeLinejoin: "round",
                    strokeOpacity: 0.952941,
                }}
                transform="matrix(0.93350948,0,0,0.93350948,5.6864311,1.662263)"
                >
                <path
                    d="m 32.721105,70.75057 c 0,-2.972643 0.624255,-5.469664 1.872766,-7.491061 1.24851,-2.021398 3.388813,-4.131975 6.420909,-6.331731 2.675379,-1.902491 4.57787,-3.537445 5.707475,-4.904861 1.189057,-1.426869 1.783586,-3.091549 1.783586,-4.994041 0,-1.902491 -0.713434,-3.32936 -2.140303,-4.280606 -1.367416,-1.010699 -3.299634,-1.516048 -5.796654,-1.516048 -2.497021,0 -4.964315,0.386444 -7.401882,1.159331 -2.437567,0.772887 -4.934588,1.813312 -7.491061,3.121275 l -4.726503,-9.542185 c 2.913191,-1.605227 6.064193,-2.91319 9.453006,-3.923889 3.388813,-1.010699 7.104617,-1.516048 11.147412,-1.516048 6.183098,0 10.969054,1.486322 14.357867,4.458965 3.448266,2.972643 5.172399,6.7479 5.172399,11.325771 0,2.437567 -0.386444,4.548144 -1.159331,6.33173 -0.772887,1.783586 -1.932218,3.448266 -3.477992,4.994041 -1.545775,1.486321 -3.477993,3.091549 -5.796655,4.815682 -1.724133,1.24851 -3.061822,2.318662 -4.013068,3.210455 -0.951246,0.891793 -1.605228,1.753859 -1.961945,2.586199 -0.297264,0.83234 -0.445896,1.872765 -0.445896,3.121276 v 2.586199 h -11.50413 z"
                    style={{
                    fontWeight: "bold",
                    fontFamily: "'Droid Sans Fallback'",
                    display: "inline",
                    fill: "none",
                    stroke: "#000000",
                    strokeWidth: 4.77446,
                    strokeDasharray: "none",
                    strokeOpacity: 0.4,
                    }}
                    id="path90676"
                />
                <rect
                    style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    strokeWidth: 5.27349,
                    }}
                    id="rect17417-0"
                    width={17.07983}
                    height={16.068396}
                    x={30.152634}
                    y={84.453064}
                    rx={1.7079831}
                    ry={1.6068397}
                />
                <rect
                    style={{
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "none",
                    strokeWidth: 5.27349,
                    }}
                    id="rect17423-8"
                    width={17.07983}
                    height={16.068396}
                    x={30.152634}
                    y={81.239388}
                    rx={1.7079831}
                    ry={1.6068397}
                />
                <path
                    d="m 32.721105,67.607299 c 0,-2.972643 0.624255,-5.469664 1.872766,-7.491061 1.24851,-2.021398 3.388813,-4.131975 6.420909,-6.331731 2.675379,-1.902491 4.57787,-3.537445 5.707475,-4.904861 1.189057,-1.426869 1.783586,-3.091549 1.783586,-4.994041 0,-1.902491 -0.713434,-3.32936 -2.140303,-4.280606 -1.367416,-1.010699 -3.299634,-1.516048 -5.796654,-1.516048 -2.497021,0 -4.964315,0.386444 -7.401882,1.159331 -2.437567,0.772887 -4.934588,1.813312 -7.491061,3.121275 l -4.726503,-9.542185 c 2.913191,-1.605227 6.064193,-2.91319 9.453006,-3.923889 3.388813,-1.010699 7.104617,-1.516048 11.147412,-1.516048 6.183098,0 10.969054,1.486322 14.357867,4.458965 3.448266,2.972643 5.172399,6.7479 5.172399,11.325771 0,2.437567 -0.386444,4.548144 -1.159331,6.33173 -0.772887,1.783586 -1.932218,3.448266 -3.477992,4.994041 -1.545775,1.486321 -3.477993,3.091549 -5.796655,4.815682 -1.724133,1.24851 -3.061822,2.318662 -4.013068,3.210455 -0.951246,0.891793 -1.605228,1.753859 -1.961945,2.586199 -0.297264,0.83234 -0.445896,1.872765 -0.445896,3.121276 v 2.586199 h -11.50413 z"
                    style={{
                    fontWeight: "bold",
                    fontFamily: "'Droid Sans Fallback'",
                    display: "inline",
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "#ffffff",
                    strokeWidth: 4.77446,
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                    }}
                    id="path90788"
                />
                </g>
            </g>
            <g id="g17427" transform="translate(30.105023)">
                <g
                id="g17421"
                style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                }}
                transform="translate(0,3)"
                >
                <rect
                    style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    }}
                    id="rect17417"
                    width={15}
                    height={15}
                    x={39.749226}
                    y={82.5}
                    rx={1.5}
                    ry={1.5}
                />
                <path
                    style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    strokeWidth: 0,
                    strokeLinecap: "butt",
                    strokeLinejoin: "bevel",
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                    }}
                    d="m 41.216268,75 h 12 a 1.5337037,1.5337037 135.63652 0 0 1.533325,-1.49963 l 0.93335,-42.00074 A 1.467037,1.467037 45.636515 0 0 54.216268,30 h -14 a 1.467037,1.467037 134.36348 0 0 -1.466675,1.49963 l 0.93335,42.00074 A 1.5337037,1.5337037 44.363485 0 0 41.216268,75 Z"
                    id="path17419"
                />
                </g>
                <rect
                style={{
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "none",
                }}
                id="rect17423"
                width={15}
                height={15}
                x={39.749226}
                y={82.5}
                rx={1.5}
                ry={1.5}
                />
                <path
                style={{
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "none",
                    strokeWidth: 0,
                    strokeLinecap: "butt",
                    strokeLinejoin: "bevel",
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                }}
                d="m 41.216268,75 h 12 a 1.5337037,1.5337037 135.63652 0 0 1.533325,-1.49963 l 0.93335,-42.00074 A 1.467037,1.467037 45.636515 0 0 54.216268,30 h -14 a 1.467037,1.467037 134.36348 0 0 -1.466675,1.49963 l 0.93335,42.00074 A 1.5337037,1.5337037 44.363485 0 0 41.216268,75 Z"
                id="path17425"
                />
            </g>
            </g>
        </svg>
    )
}

function Mistake({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            id="svg5"
            xmlSpace="preserve"
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
                fill: "#e58f2a",
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
            <g id="layer3" transform="matrix(1.0629456,0,0,1,-2.2030973,-5)">
            <g id="layer4" transform="matrix(0.94078192,0,0,1,2.0726341,5)">
                <g
                aria-label="?"
                id="text78741"
                style={{
                    fontSize: "89.1793px",
                    fontFamily: "'DejaVu Sans Mono'",
                    fill: "#ffffff",
                    stroke: "#ffffff",
                    strokeWidth: 4.77487,
                    strokeLinejoin: "round",
                    strokeOpacity: 0.952941,
                }}
                transform="matrix(0.99309791,0,0,0.99309791,19.268334,-2.3276514)"
                >
                <path
                    d="m 32.721105,70.75057 c 0,-2.972643 0.624255,-5.469664 1.872766,-7.491061 1.24851,-2.021398 3.388813,-4.131975 6.420909,-6.331731 2.675379,-1.902491 4.57787,-3.537445 5.707475,-4.904861 1.189057,-1.426869 1.783586,-3.091549 1.783586,-4.994041 0,-1.902491 -0.713434,-3.32936 -2.140303,-4.280606 -1.367416,-1.010699 -3.299634,-1.516048 -5.796654,-1.516048 -2.497021,0 -4.964315,0.386444 -7.401882,1.159331 -2.437567,0.772887 -4.934588,1.813312 -7.491061,3.121275 l -4.726503,-9.542185 c 2.913191,-1.605227 6.064193,-2.91319 9.453006,-3.923889 3.388813,-1.010699 7.104617,-1.516048 11.147412,-1.516048 6.183098,0 10.969054,1.486322 14.357867,4.458965 3.448266,2.972643 5.172399,6.7479 5.172399,11.325771 0,2.437567 -0.386444,4.548144 -1.159331,6.33173 -0.772887,1.783586 -1.932218,3.448266 -3.477992,4.994041 -1.545775,1.486321 -3.477993,3.091549 -5.796655,4.815682 -1.724133,1.24851 -3.061822,2.318662 -4.013068,3.210455 -0.951246,0.891793 -1.605228,1.753859 -1.961945,2.586199 -0.297264,0.83234 -0.445896,1.872765 -0.445896,3.121276 v 2.586199 h -11.50413 z"
                    style={{
                    fontWeight: "bold",
                    fontFamily: "'Droid Sans Fallback'",
                    display: "inline",
                    fill: "none",
                    stroke: "#000000",
                    strokeWidth: 4.77446,
                    strokeDasharray: "none",
                    strokeOpacity: 0.4,
                    }}
                    id="path90676"
                />
                <rect
                    style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    strokeWidth: 5.27349,
                    }}
                    id="rect17417-0"
                    width={17.07983}
                    height={16.068396}
                    x={30.152634}
                    y={84.453064}
                    rx={1.7079831}
                    ry={1.6068397}
                />
                <rect
                    style={{
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "none",
                    strokeWidth: 5.27349,
                    }}
                    id="rect17423-8"
                    width={17.07983}
                    height={16.068396}
                    x={30.152634}
                    y={81.239388}
                    rx={1.7079831}
                    ry={1.6068397}
                />
                <path
                    d="m 32.721105,67.607299 c 0,-2.972643 0.624255,-5.469664 1.872766,-7.491061 1.24851,-2.021398 3.388813,-4.131975 6.420909,-6.331731 2.675379,-1.902491 4.57787,-3.537445 5.707475,-4.904861 1.189057,-1.426869 1.783586,-3.091549 1.783586,-4.994041 0,-1.902491 -0.713434,-3.32936 -2.140303,-4.280606 -1.367416,-1.010699 -3.299634,-1.516048 -5.796654,-1.516048 -2.497021,0 -4.964315,0.386444 -7.401882,1.159331 -2.437567,0.772887 -4.934588,1.813312 -7.491061,3.121275 l -4.726503,-9.542185 c 2.913191,-1.605227 6.064193,-2.91319 9.453006,-3.923889 3.388813,-1.010699 7.104617,-1.516048 11.147412,-1.516048 6.183098,0 10.969054,1.486322 14.357867,4.458965 3.448266,2.972643 5.172399,6.7479 5.172399,11.325771 0,2.437567 -0.386444,4.548144 -1.159331,6.33173 -0.772887,1.783586 -1.932218,3.448266 -3.477992,4.994041 -1.545775,1.486321 -3.477993,3.091549 -5.796655,4.815682 -1.724133,1.24851 -3.061822,2.318662 -4.013068,3.210455 -0.951246,0.891793 -1.605228,1.753859 -1.961945,2.586199 -0.297264,0.83234 -0.445896,1.872765 -0.445896,3.121276 v 2.586199 h -11.50413 z"
                    style={{
                    fontWeight: "bold",
                    fontFamily: "'Droid Sans Fallback'",
                    display: "inline",
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "#ffffff",
                    strokeWidth: 4.77446,
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                    }}
                    id="path90788"
                />
                </g>
            </g>
            </g>
        </svg>
    )
}

function Miss({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            id="svg5"
            xmlSpace="preserve"
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
                fill: "#ee6b55",
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
                mixBlendMode: "normal",
                fill: "none",
                fillOpacity: 0.4,
                stroke: "#000000",
                strokeWidth: 4.457,
                strokeLinecap: "butt",
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 0.4,
                }}
                d="M 81.271867,31.490925 91.858943,42.117017 70.606758,63.291167 91.78091,84.543351 81.154817,95.130427 59.980667,73.878242 38.728483,95.052394 28.141408,84.426301 49.393592,63.252151 28.21944,41.999967 38.845533,31.412892 60.019683,52.665076 Z"
                id="path114280"
            />
            <path
                style={{
                fill: "#ffffff",
                fillOpacity: 1,
                stroke: "#ffffff",
                strokeWidth: 4.457,
                strokeLinecap: "butt",
                strokeLinejoin: "round",
                strokeDasharray: "none",
                strokeOpacity: 1,
                }}
                d="M 81.271867,28.219441 91.858943,38.845533 70.606758,60.019683 91.78091,81.271867 81.154817,91.858943 59.980667,70.606758 38.728483,91.78091 28.141408,81.154817 49.393592,59.980667 28.21944,38.728483 38.845533,28.141408 60.019683,49.393592 Z"
                id="path31371"
            />
            </g>
        </svg>
    )
}

function Blunder({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            id="svg5"
            xmlSpace="preserve"
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
                fill: "#ca3531",
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
            <g id="layer3" transform="matrix(1.0629456,0,0,1,-2.2030973,-5)">
            <g id="g17427" transform="translate(30.105023)">
                <g
                aria-label="?"
                id="g125666"
                style={{
                    fontSize: "89.1793px",
                    fontFamily: "'DejaVu Sans Mono'",
                    fill: "#ffffff",
                    stroke: "#ffffff",
                    strokeWidth: 4.77487,
                    strokeLinejoin: "round",
                    strokeOpacity: 0.952941,
                }}
                transform="matrix(0.87822884,0,0,0.93350948,9.8058461,6.662263)"
                >
                <path
                    d="m 32.721105,70.75057 c 0,-2.972643 0.624255,-5.469664 1.872766,-7.491061 1.24851,-2.021398 3.388813,-4.131975 6.420909,-6.331731 2.675379,-1.902491 4.57787,-3.537445 5.707475,-4.904861 1.189057,-1.426869 1.783586,-3.091549 1.783586,-4.994041 0,-1.902491 -0.713434,-3.32936 -2.140303,-4.280606 -1.367416,-1.010699 -3.299634,-1.516048 -5.796654,-1.516048 -2.497021,0 -4.964315,0.386444 -7.401882,1.159331 -2.437567,0.772887 -4.934588,1.813312 -7.491061,3.121275 l -4.726503,-9.542185 c 2.913191,-1.605227 6.064193,-2.91319 9.453006,-3.923889 3.388813,-1.010699 7.104617,-1.516048 11.147412,-1.516048 6.183098,0 10.969054,1.486322 14.357867,4.458965 3.448266,2.972643 5.172399,6.7479 5.172399,11.325771 0,2.437567 -0.386444,4.548144 -1.159331,6.33173 -0.772887,1.783586 -1.932218,3.448266 -3.477992,4.994041 -1.545775,1.486321 -3.477993,3.091549 -5.796655,4.815682 -1.724133,1.24851 -3.061822,2.318662 -4.013068,3.210455 -0.951246,0.891793 -1.605228,1.753859 -1.961945,2.586199 -0.297264,0.83234 -0.445896,1.872765 -0.445896,3.121276 v 2.586199 h -11.50413 z"
                    style={{
                    fontWeight: "bold",
                    fontFamily: "'Droid Sans Fallback'",
                    display: "inline",
                    fill: "none",
                    stroke: "#000000",
                    strokeWidth: 4.77446,
                    strokeDasharray: "none",
                    strokeOpacity: 0.4,
                    }}
                    id="path125658"
                />
                <rect
                    style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    strokeWidth: 5.27349,
                    }}
                    id="rect125660"
                    width={17.07983}
                    height={16.068396}
                    x={30.152634}
                    y={84.453064}
                    rx={1.7079831}
                    ry={1.6068397}
                />
                <rect
                    style={{
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "none",
                    strokeWidth: 5.27349,
                    }}
                    id="rect125662"
                    width={17.07983}
                    height={16.068396}
                    x={30.152634}
                    y={81.239388}
                    rx={1.7079831}
                    ry={1.6068397}
                />
                <path
                    d="m 32.721105,67.607299 c 0,-2.972643 0.624255,-5.469664 1.872766,-7.491061 1.24851,-2.021398 3.388813,-4.131975 6.420909,-6.331731 2.675379,-1.902491 4.57787,-3.537445 5.707475,-4.904861 1.189057,-1.426869 1.783586,-3.091549 1.783586,-4.994041 0,-1.902491 -0.713434,-3.32936 -2.140303,-4.280606 -1.367416,-1.010699 -3.299634,-1.516048 -5.796654,-1.516048 -2.497021,0 -4.964315,0.386444 -7.401882,1.159331 -2.437567,0.772887 -4.934588,1.813312 -7.491061,3.121275 l -4.726503,-9.542185 c 2.913191,-1.605227 6.064193,-2.91319 9.453006,-3.923889 3.388813,-1.010699 7.104617,-1.516048 11.147412,-1.516048 6.183098,0 10.969054,1.486322 14.357867,4.458965 3.448266,2.972643 5.172399,6.7479 5.172399,11.325771 0,2.437567 -0.386444,4.548144 -1.159331,6.33173 -0.772887,1.783586 -1.932218,3.448266 -3.477992,4.994041 -1.545775,1.486321 -3.477993,3.091549 -5.796655,4.815682 -1.724133,1.24851 -3.061822,2.318662 -4.013068,3.210455 -0.951246,0.891793 -1.605228,1.753859 -1.961945,2.586199 -0.297264,0.83234 -0.445896,1.872765 -0.445896,3.121276 v 2.586199 h -11.50413 z"
                    style={{
                    fontWeight: "bold",
                    fontFamily: "'Droid Sans Fallback'",
                    display: "inline",
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "#ffffff",
                    strokeWidth: 4.77446,
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                    }}
                    id="path125664"
                />
                </g>
            </g>
            <g id="layer2" transform="matrix(0.94078192,0,0,1,2.0726341,5)">
                <g
                aria-label="?"
                id="g362-3"
                style={{
                    fontSize: "89.1793px",
                    fontFamily: "'DejaVu Sans Mono'",
                    fill: "#ca3531",
                    fillOpacity: 1,
                    stroke: "#ca3531",
                    strokeWidth: 4.77536,
                    strokeLinejoin: "round",
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                }}
                transform="matrix(0.99226979,0,0,0.93350948,5.6313415,1.6620716)"
                >
                <path
                    d="m 32.721105,70.75057 c 0,-2.972643 0.624255,-5.469664 1.872766,-7.491061 1.24851,-2.021398 3.388813,-4.131975 6.420909,-6.331731 2.675379,-1.902491 4.57787,-3.537445 5.707475,-4.904861 1.189057,-1.426869 1.783586,-3.091549 1.783586,-4.994041 0,-1.902491 -0.713434,-3.32936 -2.140303,-4.280606 -1.367416,-1.010699 -3.299634,-1.516048 -5.796654,-1.516048 -2.497021,0 -4.964315,0.386444 -7.401882,1.159331 -2.437567,0.772887 -4.934588,1.813312 -7.491061,3.121275 l -4.726503,-9.542185 c 2.913191,-1.605227 6.064193,-2.91319 9.453006,-3.923889 3.388813,-1.010699 7.104617,-1.516048 11.147412,-1.516048 6.183098,0 10.969054,1.486322 14.357867,4.458965 3.448266,2.972643 5.172399,6.7479 5.172399,11.325771 0,2.437567 -0.386444,4.548144 -1.159331,6.33173 -0.772887,1.783586 -1.932218,3.448266 -3.477992,4.994041 -1.545775,1.486321 -3.477993,3.091549 -5.796655,4.815682 -1.724133,1.24851 -3.061822,2.318662 -4.013068,3.210455 -0.951246,0.891793 -1.605228,1.753859 -1.961945,2.586199 -0.297264,0.83234 -0.445896,1.872765 -0.445896,3.121276 v 2.586199 h -11.50413 z"
                    style={{
                    fontWeight: "bold",
                    fontFamily: "'Droid Sans Fallback'",
                    display: "inline",
                    fill: "#ca3531",
                    fillOpacity: 1,
                    stroke: "#ca3531",
                    strokeWidth: 4.77536,
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                    }}
                    id="path354-6"
                />
                <rect
                    style={{
                    fill: "#ca3531",
                    fillOpacity: 1,
                    stroke: "#ca3531",
                    strokeWidth: 4.77536,
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                    }}
                    id="rect356-7"
                    width={17.07983}
                    height={16.068396}
                    x={30.152634}
                    y={84.453064}
                    rx={1.7079831}
                    ry={1.6068397}
                />
                <rect
                    style={{
                    fill: "#ca3531",
                    fillOpacity: 1,
                    stroke: "#ca3531",
                    strokeWidth: 4.77536,
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                    }}
                    id="rect358-5"
                    width={17.07983}
                    height={16.068396}
                    x={30.152634}
                    y={81.239388}
                    rx={1.7079831}
                    ry={1.6068397}
                />
                <path
                    d="m 32.721105,67.607299 c 0,-2.972643 0.624255,-5.469664 1.872766,-7.491061 1.24851,-2.021398 3.388813,-4.131975 6.420909,-6.331731 2.675379,-1.902491 4.57787,-3.537445 5.707475,-4.904861 1.189057,-1.426869 1.783586,-3.091549 1.783586,-4.994041 0,-1.902491 -0.713434,-3.32936 -2.140303,-4.280606 -1.367416,-1.010699 -3.299634,-1.516048 -5.796654,-1.516048 -2.497021,0 -4.964315,0.386444 -7.401882,1.159331 -2.437567,0.772887 -4.934588,1.813312 -7.491061,3.121275 l -4.726503,-9.542185 c 2.913191,-1.605227 6.064193,-2.91319 9.453006,-3.923889 3.388813,-1.010699 7.104617,-1.516048 11.147412,-1.516048 6.183098,0 10.969054,1.486322 14.357867,4.458965 3.448266,2.972643 5.172399,6.7479 5.172399,11.325771 0,2.437567 -0.386444,4.548144 -1.159331,6.33173 -0.772887,1.783586 -1.932218,3.448266 -3.477992,4.994041 -1.545775,1.486321 -3.477993,3.091549 -5.796655,4.815682 -1.724133,1.24851 -3.061822,2.318662 -4.013068,3.210455 -0.951246,0.891793 -1.605228,1.753859 -1.961945,2.586199 -0.297264,0.83234 -0.445896,1.872765 -0.445896,3.121276 v 2.586199 h -11.50413 z"
                    style={{
                    fontWeight: "bold",
                    fontFamily: "'Droid Sans Fallback'",
                    display: "inline",
                    fill: "#ca3531",
                    fillOpacity: 1,
                    stroke: "#ca3531",
                    strokeWidth: 4.77536,
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                    }}
                    id="path360-3"
                />
                </g>
                <g
                aria-label="?"
                id="g362"
                style={{
                    fontSize: "89.1793px",
                    fontFamily: "'DejaVu Sans Mono'",
                    fill: "#ffffff",
                    stroke: "#ffffff",
                    strokeWidth: 4.77487,
                    strokeLinejoin: "round",
                    strokeOpacity: 0.952941,
                }}
                transform="matrix(0.99226979,0,0,0.93350948,2.1137056,1.6620716)"
                >
                <path
                    d="m 32.721105,70.75057 c 0,-2.972643 0.624255,-5.469664 1.872766,-7.491061 1.24851,-2.021398 3.388813,-4.131975 6.420909,-6.331731 2.675379,-1.902491 4.57787,-3.537445 5.707475,-4.904861 1.189057,-1.426869 1.783586,-3.091549 1.783586,-4.994041 0,-1.902491 -0.713434,-3.32936 -2.140303,-4.280606 -1.367416,-1.010699 -3.299634,-1.516048 -5.796654,-1.516048 -2.497021,0 -4.964315,0.386444 -7.401882,1.159331 -2.437567,0.772887 -4.934588,1.813312 -7.491061,3.121275 l -4.726503,-9.542185 c 2.913191,-1.605227 6.064193,-2.91319 9.453006,-3.923889 3.388813,-1.010699 7.104617,-1.516048 11.147412,-1.516048 6.183098,0 10.969054,1.486322 14.357867,4.458965 3.448266,2.972643 5.172399,6.7479 5.172399,11.325771 0,2.437567 -0.386444,4.548144 -1.159331,6.33173 -0.772887,1.783586 -1.932218,3.448266 -3.477992,4.994041 -1.545775,1.486321 -3.477993,3.091549 -5.796655,4.815682 -1.724133,1.24851 -3.061822,2.318662 -4.013068,3.210455 -0.951246,0.891793 -1.605228,1.753859 -1.961945,2.586199 -0.297264,0.83234 -0.445896,1.872765 -0.445896,3.121276 v 2.586199 h -11.50413 z"
                    style={{
                    fontWeight: "bold",
                    fontFamily: "'Droid Sans Fallback'",
                    display: "inline",
                    fill: "none",
                    stroke: "#000000",
                    strokeWidth: 4.77446,
                    strokeDasharray: "none",
                    strokeOpacity: 0.4,
                    }}
                    id="path354"
                />
                <rect
                    style={{
                    fill: "#000000",
                    fillOpacity: 0.4,
                    stroke: "none",
                    strokeWidth: 5.27349,
                    }}
                    id="rect356"
                    width={17.07983}
                    height={16.068396}
                    x={30.152634}
                    y={84.453064}
                    rx={1.7079831}
                    ry={1.6068397}
                />
                <rect
                    style={{
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "none",
                    strokeWidth: 5.27349,
                    }}
                    id="rect358"
                    width={17.07983}
                    height={16.068396}
                    x={30.152634}
                    y={81.239388}
                    rx={1.7079831}
                    ry={1.6068397}
                />
                <path
                    d="m 32.721105,67.607299 c 0,-2.972643 0.624255,-5.469664 1.872766,-7.491061 1.24851,-2.021398 3.388813,-4.131975 6.420909,-6.331731 2.675379,-1.902491 4.57787,-3.537445 5.707475,-4.904861 1.189057,-1.426869 1.783586,-3.091549 1.783586,-4.994041 0,-1.902491 -0.713434,-3.32936 -2.140303,-4.280606 -1.367416,-1.010699 -3.299634,-1.516048 -5.796654,-1.516048 -2.497021,0 -4.964315,0.386444 -7.401882,1.159331 -2.437567,0.772887 -4.934588,1.813312 -7.491061,3.121275 l -4.726503,-9.542185 c 2.913191,-1.605227 6.064193,-2.91319 9.453006,-3.923889 3.388813,-1.010699 7.104617,-1.516048 11.147412,-1.516048 6.183098,0 10.969054,1.486322 14.357867,4.458965 3.448266,2.972643 5.172399,6.7479 5.172399,11.325771 0,2.437567 -0.386444,4.548144 -1.159331,6.33173 -0.772887,1.783586 -1.932218,3.448266 -3.477992,4.994041 -1.545775,1.486321 -3.477993,3.091549 -5.796655,4.815682 -1.724133,1.24851 -3.061822,2.318662 -4.013068,3.210455 -0.951246,0.891793 -1.605228,1.753859 -1.961945,2.586199 -0.297264,0.83234 -0.445896,1.872765 -0.445896,3.121276 v 2.586199 h -11.50413 z"
                    style={{
                    fontWeight: "bold",
                    fontFamily: "'Droid Sans Fallback'",
                    display: "inline",
                    fill: "#ffffff",
                    fillOpacity: 1,
                    stroke: "#ffffff",
                    strokeWidth: 4.77446,
                    strokeDasharray: "none",
                    strokeOpacity: 1,
                    }}
                    id="path360"
                />
                </g>
            </g>
            </g>
        </svg>
    )
}

function Forced({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            id="svg5"
            xmlSpace="preserve"
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
                display: "inline",
                fill: "#95af8a",
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
            <g id="layer3">
            <path
                style={{
                display: "inline",
                fill: "none",
                fillOpacity: 1,
                stroke: "#000000",
                strokeWidth: 5.11214,
                strokeLinejoin: "round",
                strokeOpacity: 0.4,
                }}
                d="m 28.63107,52.099592 h 33.369041 v -16.68452 l 33.36904,27.807534 -33.36904,27.807536 V 74.345619 H 28.63107 Z"
                id="path396"
            />
            </g>
            <g id="layer2">
            <path
                style={{
                display: "inline",
                fill: "#ffffff",
                fillOpacity: 1,
                stroke: "#ffffff",
                strokeWidth: 5.11214,
                strokeLinejoin: "round",
                strokeOpacity: 1,
                }}
                d="M 28.63107,48.8768 H 62.000111 V 32.19228 l 33.36904,27.807534 -33.36904,27.807533 V 71.122827 H 28.63107 Z"
                id="path3988"
            />
            </g>
        </svg>
    )
}

export default function RatingSVG({ rating, size, dataset, draggable, className, style, title }: { rating: moveRating, size: number, dataset?: Dataset, draggable?: boolean, className?: string, style?: React.CSSProperties, title?: string }) {
    const propsDataset = getPropsDataset(dataset ?? {})
    const ratingProps = {size}

    return (
        <div title={title} draggable={draggable} {...propsDataset} className={className} style={style}>
            {(() => {
                switch (rating) {
                    case 'brilliant':
                        return <Brilliant {...ratingProps} />
                    case 'great':
                        return <Great {...ratingProps} />
                    case 'best':
                        return <Best {...ratingProps} />
                    case 'excellent':
                        return <Excellent {...ratingProps} />
                    case 'good':
                        return <Good {...ratingProps} />
                    case 'book':
                        return <Book {...ratingProps} />
                    case 'inaccuracy':
                        return <Inaccuracy {...ratingProps} />
                    case 'mistake':
                        return <Mistake {...ratingProps} />
                    case 'miss':
                        return <Miss {...ratingProps} />
                    case 'blunder':
                        return <Blunder {...ratingProps} />
                    case 'forced':
                        return <Forced {...ratingProps} />
                }
            })()}
        </div>
    )
}