import { result } from "@/engine/stockfish"

const COMMENTS = {
    win: [
        "__WINNER__ claimed victory after a well-fought game. Let's analyze __LOSER__'s key mistakes and __WINNER__'s critical moves.",
        "A strong performance by __WINNER__ secured the win. Let's explore how __LOSER__ could have defended better.",
        "__WINNER__ emerged victorious, showcasing strategic play. Let's review the moments that defined __LOSER__'s downfall.",
        "__WINNER__ secured a hard-earned win through precise play. Let's analyze where __LOSER__ could have improved.",
        "__WINNER__ capitalized on key opportunities to claim victory. Let's analyze how __LOSER__ could have countered.",
        "A decisive win for __WINNER__, who navigated the complexities of the position expertly. Let's review __LOSER__'s critical moments.",
        "__LOSER__ fought hard but couldn't hold off __WINNER__'s attack. Let's explore how __WINNER__ secured the win.",
        "__WINNER__'s persistence paid off, resulting in a well-deserved victory. Let's analyze how __LOSER__'s defense fell short.",
    ],
    draw: [
        "Neither __WINNER__ nor __LOSER__ managed to break through, resulting in a draw. Let's explore missed opportunities on both sides.",
        "The game stabilized into a draw after intense play from both __WINNER__ and __LOSER__. Let's revisit the critical decisions.",
        "An exciting battle between __WINNER__ and __LOSER__ ended in a draw. Let's analyze what each side could have done differently.",
        "Despite intense efforts from both sides, the game concluded in a draw. Let's examine the moments where __WINNER__ and __LOSER__ missed opportunities.",
        "__WINNER__ and __LOSER__ reached a draw after an exciting battle with chances for both. Let's analyze the critical moves.",
        "After an intense struggle, neither __WINNER__ nor __LOSER__ could gain the upper hand, resulting in a draw. Let's break down the decisive moments.",
        "After a dynamic game, neither __WINNER__ nor __LOSER__ could secure the win, resulting in a draw. Let's review the critical phases.",
        "__WINNER__ and __LOSER__ showed strong play throughout, but the game concluded in a draw. Let's explore the key decisions.",
    ],
    unknown: [
        "An intense game between __WINNER__ and __LOSER__. Let's analyze the key moments that shaped the outcome.",
        "A well-fought battle between __WINNER__ and __LOSER__. Let's break down the critical moves and decisions.",
        "A complex and engaging game took place. Let's dive into the strategies employed by __WINNER__ and __LOSER__.",
        "Both __WINNER__ and __LOSER__ displayed strong play. Let's review the turning points that defined the match.",
        "A game full of strategic moments and tactical battles. Let's analyze the key positions and ideas.",
        "An intriguing contest unfolded between __WINNER__ and __LOSER__. Let's explore the critical junctures of the game.",
        "Both players showcased their skills in an engaging match. Let's take a closer look at their key moves.",
        "A fascinating encounter between __WINNER__ and __LOSER__. Let's analyze how the game developed and the decisions made.",
    ],
}

export default function getOverallGameComment(playerNames: [string, string], result: result) {
    const [ white, black ] = playerNames

    const getComment = (commentList: string[], winner: string, loser: string) => {
        const tab = [`<span class="font-extrabold" style="color: var(--foregroundBlackDark);">`, `</span>`]

        return commentList[Math.floor(Math.random() * commentList.length)].replace(/__WINNER__/g, tab[0] + winner + tab[1]).replace(/__LOSER__/g, tab[0] + loser + tab[1])
    }

    let comment: string, randomBool: boolean
    switch (result) {
        case '1-0':
            comment = getComment(COMMENTS.win, white, black)
            break
        case '0-1':
            comment = getComment(COMMENTS.win, black, white)
            break
        case '1/2-1/2':
            randomBool = Boolean(Math.floor(Math.random() * 2))
            comment = getComment(COMMENTS.draw, randomBool ? white : black, randomBool ? black : white)
            break
        case '*': case '':
            randomBool = Boolean(Math.floor(Math.random() * 2))
            comment = getComment(COMMENTS.unknown, randomBool ? white : black, randomBool ? black : white)
            break
    }

    return comment
}