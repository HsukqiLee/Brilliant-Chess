"use client"

import Image from "next/image"
import GitHub from "../svg/github"
import { useContext, useEffect, useRef } from "react"
import Licenses from "../svg/license"
import Settings from "./settings/settings"
import { ConfigContext } from "@/context/config"
import Link from "next/link"

export const DONATE_URL = "https://www.paypal.com/donate/?hosted_button_id=S8SWJBNYZ2WFW"

export default function Nav() {
    const configContext = useContext(ConfigContext)

    const [openedMenu, setOpenedMenu] = configContext.openedMenu
    const boardMenuSettingsRef = configContext.boardMenuSettingsRef

    const topLinksRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    interface TopLink {
        label: string,
        click?: () => void,
        hover?: () => void,
        unHover?: () => void,
        icon: string,
        role: "button"|"link",
    }

    const topLinks: TopLink[] = [
        { label: "Settings", hover: openSettings, icon: `${process.env.NEXT_PUBLIC_BASE_PATH}/images/setting.svg`, role: "button" },
    ]

    interface BotLinks {
        label: string,
        href: string,
        icon: (props: {className: string}) => React.ReactNode,
    }

    const botLinks: BotLinks[] = [
        { label: "Source Code", href: "https://github.com/wdeloo/Brilliant-Chess", icon: (props: {className: string}) => <GitHub class={props.className} /> },
        { label: "Attributions", href: "/attributions", icon: (props: {className: string}) => <Licenses class={props.className} /> },
    ]

    function openSettings() {
        setOpenedMenu("settings")
    }

    function closeMenu() {
        setOpenedMenu(null)
    }

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                !menuRef.current?.contains(e.target as Node)
                &&
                !topLinksRef.current?.contains(e.target as Node)
                &&
                !boardMenuSettingsRef.current?.contains(e.target as Node)
            ) {
                closeMenu()
            }
        }

        document.addEventListener('mousedown', handleClick)

        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
        <nav className="flex flex-col navTop:h-screen navTop:w-max w-screen relative">
            <div className="navTop:pt-1 navTop:pb-6 navTop:h-full w-full overflow-y-auto bg-backgroundBox flex navTop:flex-col flex-row justify-between select-none navTop:items-start items-stretch">
                <div ref={topLinksRef} className="flex navTop:flex-col flex-row">
                    <Link draggable={false} onMouseEnter={() => setOpenedMenu(null)} href="/" className="flex flex-row gap-1 font-extrabold text-xl navTop:p-3 p-1.5 transition-colors hover:bg-backgroundBoxHover hover:text-foregroundHighlighted">
                        <Image draggable={false} height={30} width={30} alt="logo" src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/logo.svg`} className="navTop:mt-[-2px]" />
                        <div className="h-fit w-fit reduceNav:block hidden">Brilliant<span className="text-sm font-light">Chess</span></div>
                    </Link>
                    {topLinks.map((link, i) => {
                        return (
                            <button onClick={link?.click} onMouseEnter={link?.hover} onMouseLeave={link?.unHover} type="button" key={i} className="text-lg outline-none font-bold navTop:px-3 navTop:py-2 p-1.5 hover:bg-backgroundBoxHover hover:text-foregroundHighlighted transition-colors flex flex-row gap-2">
                                <Image draggable={false} height={30} width={30} alt={link.label} src={link.icon} className="transition-colors" />
                                <div className="h-fit w-fit reduceNav:block hidden">{link.label}</div>
                            </button>
                        )
                    })}
                </div>
                <div className="flex navTop:flex-col flex-row text-sm font-bold navTop:w-full navTop:h-fit">
                    {botLinks.map((link, i) => {
                        return (
                            <Link draggable={false} key={i} target="_blank" href={link.href} className="flex flex-row gap-2 h-full navTop:h-fit reduceNav:px-3 reduceNav:justify-start justify-center items-center navTop:py-2 p-2 group hover:bg-backgroundBoxHover text-foregroundGrey hover:text-foregroundHighlighted transition-colors">
                                <link.icon className="fill-foregroundGrey transition-colors group-hover:fill-foregroundHighlighted" />
                                <span className="reduceNav:block hidden">{link.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>
            <div ref={menuRef} style={{display: openedMenu ? '' : 'none'}} className="navTop:h-full h-fit max-h-[calc(100vh-42px)] navTop:max-h-full z-[500] p-2 bg-backgroundBoxDarker absolute navTop:left-full top-full navTop:top-0 select-none navTop:w-fit w-fit min-w-[300px] overflow-y-auto">
                <Settings hidden={openedMenu !== 'settings'} />
            </div>
        </nav>
    )
}