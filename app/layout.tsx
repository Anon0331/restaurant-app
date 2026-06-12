import type { Metadata } from 'next'
import { Playfair_Display, Lora } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '一生モノの一皿',
  description: '人生で一番おいしかったお店をみんなでシェアするアプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${playfair.variable} ${lora.variable}`}>
      <body className="bg-paper text-ink font-body antialiased">
        {children}
      </body>
    </html>
  )
}
