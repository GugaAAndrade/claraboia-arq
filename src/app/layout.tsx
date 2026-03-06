import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="pt-BR">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
