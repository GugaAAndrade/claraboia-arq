import { BrandLogo } from '@/components/shared/BrandLogo'
import { Instagram, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-moss text-cream">
      {/* Linha dourada topo */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-14 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">

          {/* Identidade */}
          <div className="md:col-span-5">
            <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-gold mb-5">Est. 2026</p>
            <BrandLogo
              variant="light"
              imageClassName="w-[260px] md:w-[320px] mb-8"
            />
            <p className="font-sans text-[12px] text-justify font-light leading-[1.9] text-cream/55 max-w-[260px]">
              Um escritório que acredita na arquitetura como forma de revelar, conectar e transformar espaços.
            </p>
            {/* Redes */}
            <div className="flex gap-3 mt-8">
              <a
                href="https://www.instagram.com/claraboia.arquitetura?igsh=ZndleDFreHR5b25s"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-cream/20 flex items-center justify-center text-cream/50 hover:border-gold hover:text-gold transition-all duration-300 cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram size={13} strokeWidth={1.5} />
              </a>
              <a
                href="mailto:estudioclaraboia.arq@gmail.com"
                className="w-9 h-9 border border-cream/20 flex items-center justify-center text-cream/50 hover:border-gold hover:text-gold transition-all duration-300 cursor-pointer"
                aria-label="E-mail"
              >
                <Mail size={13} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="font-sans text-[9px] tracking-[0.4em] uppercase text-gold mb-7">Navegação</h4>
            <nav className="flex flex-col gap-3">
              {[
                ['/', 'Início'],
                ['/projetos', 'Projetos'],
                ['/sobre', 'Sobre'],
                ['/contato', 'Contato'],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="font-sans text-[12px] font-light text-cream/55 hover:text-cream transition-colors duration-200 cursor-pointer"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contato */}
          <div className="md:col-span-3">
            <h4 className="font-sans text-[9px] tracking-[0.4em] uppercase text-gold mb-7">Fale conosco</h4>
            <div className="flex flex-col gap-4">
              <a
                href="mailto:estudioclaraboia.arq@gmail.com"
                className="flex items-start gap-3 font-sans text-[12px] font-light text-cream/55 hover:text-cream transition-colors group cursor-pointer"
              >
                <Mail size={12} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <span>estudioclaraboia.arq@gmail.com</span>
              </a>
              <a
                href="https://www.instagram.com/claraboia.arquitetura?igsh=ZndleDFreHR5b25s"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 font-sans text-[12px] font-light text-cream/55 hover:text-cream transition-colors cursor-pointer"
              >
                <Instagram size={12} strokeWidth={1.5} className="shrink-0" />
                @claraboia.arquitetura
              </a>
              <div className="flex items-start gap-3 font-sans text-[12px] font-light text-cream/35">
                <MapPin size={12} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <span>Aracaju, Sergipe — Brasil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[10px] font-light text-cream/35 tracking-widest">
            © {new Date().getFullYear()} Claraboia Arquitetura. Todos os direitos reservados.
          </p>
          <Link
            href="/admin"
            className="font-sans text-[10px] font-light text-cream/30 hover:text-cream/70 transition-colors tracking-widest cursor-pointer"
          >
            Área restrita
          </Link>
        </div>
      </div>
    </footer>
  )
}
