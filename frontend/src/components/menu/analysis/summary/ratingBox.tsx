export default function RatingBox(props: {children: React.ReactNode, white?: boolean, width?: number, fontSize?: number, paddingY?: number}) {
    return (
        <div style={{ width: props.width, fontSize: props.fontSize, paddingTop: props.paddingY, paddingBottom: props.paddingY }} className={`w-20 py-2 rounded-borderRoundness text-2xl font-bold ${props.white ? "bg-evaluationBarWhite text-evaluationBarBlack" : "bg-evaluationBarBlack text-evaluationBarWhite"} text-center`}>
            {props.children}
        </div>
    )
}