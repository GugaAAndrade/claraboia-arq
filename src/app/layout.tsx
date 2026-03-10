import type { Metadata } from 'next'
import './globals.css'
import { Forum, Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

const forum = Forum({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-forum',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Claraboia Arquitetura',
    template: '%s | Claraboia Arquitetura',
  },
  description: 'Arquitetura que transforma espaços em experiências. Projetos residenciais, comerciais e de interiores com identidade e excelência.',
  keywords: ['arquitetura', 'projetos', 'design', 'interiores', 'residencial', 'comercial'],
  openGraph: {
    siteName: 'Claraboia Arquitetura',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${forum.variable} ${montserrat.variable}`}>
      <body className="min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
