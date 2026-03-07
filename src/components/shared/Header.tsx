'use client'

import { BrandLogo } from '@/components/shared/BrandLogo'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/projetos', label: 'Projetos' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-[#FAF5EA]/95 backdrop-blur-md border-b border-wine/10 shadow-[0_1px_14px_rgba(108,50,51,0.08)] transition-all duration-300'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-14 h-18 flex items-center justify-between gap-8">
        {/* Logo */}
        <BrandLogo
          href="/"
          variant="burgundy"
          className="shrink-0"
          imageClassName="w-[180px] md:w-[220px] translate-y-[8px] md:translate-y-[10px]"
          priority
        />

        {/* Nav Desktop */}
        <nav className="hidden md:flex items-center gap-10 ml-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative font-sans text-[10px] font-light tracking-[0.3em] uppercase transition-colors duration-300 group cursor-pointer',
                'text-moss/60 hover:text-wine',
                pathname === link.href && 'text-wine'
              )}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px bg-gold transition-all duration-500 w-0 group-hover:w-full" />
            </Link>
          ))}

        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'md:hidden p-1 transition-colors cursor-pointer',
            'text-wine'
          )}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden bg-moss overflow-hidden transition-all duration-400',
          open ? 'max-h-screen border-t border-cream/10' : 'max-h-0'
        )}
      >
        <nav className="flex flex-col px-6 pt-6 pb-8 gap-0">
          {[{ href: '/', label: 'Início' }, ...navLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-sans text-[11px] font-light tracking-[0.3em] uppercase text-cream/70 hover:text-cream transition-colors py-4 border-b border-cream/10 last:border-0 cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
