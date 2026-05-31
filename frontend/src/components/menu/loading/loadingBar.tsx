export default function LoadingBar(props: { progress: number, transitionTime: number }) {
    return (
        <div style={{ width: `${props.progress}%`, transition: `width ${props.transitionTime}ms linear` }} className="absolute left-0 bottom-0 bg-white h-1" />
    )
}