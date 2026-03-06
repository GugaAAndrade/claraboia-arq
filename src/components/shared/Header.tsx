'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        'fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-200 shadow-[0_1px_18px_rgba(0,0,0,0.05)] transition-all duration-300'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-14 h-[72px] flex items-center justify-between gap-8">

        {/* Logo */}
        <Link
          href="/"
          className={cn(
            'font-serif text-[13px] tracking-[0.22em] uppercase transition-colors duration-300 shrink-0',
            'text-[#171717]'
          )}
        >
          Claraboia{' '}
          <span className="text-gold">Arquitetura</span>
        </Link>

        {/* Nav Desktop */}
        <nav className="hidden md:flex items-center gap-10 ml-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative font-sans text-[10px] font-light tracking-[0.3em] uppercase transition-colors duration-300 group cursor-pointer',
                'text-black/60 hover:text-black',
                pathname === link.href && 'text-black'
              )}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px bg-gold transition-all duration-500 w-0 group-hover:w-full" />
            </Link>
          ))}

          <Link
            href="/contato"
            className={cn(
              'ml-4 px-7 py-2.5 font-sans text-[10px] font-light tracking-[0.25em] uppercase transition-all duration-400 cursor-pointer',
              'border border-[#171717]/30 text-[#171717] hover:bg-[#171717] hover:text-white'
            )}
          >
            Iniciar projeto
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'md:hidden p-1 transition-colors cursor-pointer',
            'text-black'
          )}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden bg-white overflow-hidden transition-all duration-400',
          open ? 'max-h-screen border-t border-stone-100' : 'max-h-0'
        )}
      >
        <nav className="flex flex-col px-6 pt-6 pb-8 gap-0">
          {[{ href: '/', label: 'Início' }, ...navLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-sans text-[11px] font-light tracking-[0.3em] uppercase text-black/50 hover:text-black transition-colors py-4 border-b border-stone-50 last:border-0 cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contato"
            onClick={() => setOpen(false)}
            className="mt-6 text-center bg-[#171717] text-white font-sans text-[10px] font-light tracking-[0.3em] uppercase py-4 cursor-pointer"
          >
            Iniciar projeto
          </Link>
        </nav>
      </div>
    </header>
  )
}
