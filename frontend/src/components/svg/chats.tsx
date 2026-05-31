export default function Chats(props: { class: string, size: number, draggable?: boolean }) {
    return (
        <div draggable={props.draggable}>
            <svg className={props.class} width={props.size} height={props.size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 1H4V11H8L10 13L12 11H16V1Z" />
                <path d="M2 5V13H7.17157L8.70711 14.5355L7.29289 15.9497L6.34315 15H0V5H2Z" />
            </svg>
        </div>
    )
}