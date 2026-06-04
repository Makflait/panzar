import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Panzar — Open-source analytics for modern businesses',
    template: '%s · Panzar',
  },
  description:
    'Self-hosted, open-source analytics platform. Track events, measure revenue, understand your users. Works with any tech stack via webhooks.',
  keywords: ['analytics', 'open source', 'self-hosted', 'events', 'revenue', 'users', 'webhook'],
  authors: [{ name: 'Panzar Contributors' }],
  openGraph: {
    title: 'Panzar — Open-source analytics',
    description: 'Track anything. Understand everything. Self-hosted and free forever.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Panzar — Open-source analytics',
    description: 'Track anything. Understand everything. Self-hosted and free forever.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
