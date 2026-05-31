import type { Metadata } from "next"
import "./globals.css"

import { Roboto } from 'next/font/google'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
})

export const metadata: Metadata = {
  title: "Brilliant Chess - Free Chess Analyzer",
  description: "Analyze your chess games and improve your skills completely free.",
  keywords: ["chess", "chess analysis", "free chess analyzer", "free chess.com analyzer", "analyze chess for free", "analyze chess games", "brilliant move chess", "brilliant chess", "brilliant-chess"],
  authors: [{ name: 'Delo', url: "https://github.com/wdeloo" }],
  applicationName: "Brilliant Chess",

  icons: {
    icon: "favicon.ico"
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html>
      <body className={`flex navTop:flex-row flex-col items-center justify-start h-screen w-screen overflow-x-hidden ${roboto.className}`}>
        {children}
      </body>
    </html>
  )
}
