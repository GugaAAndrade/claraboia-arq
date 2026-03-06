import Link from 'next/link'
import { Instagram, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      {/* Linha dourada topo */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-14 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">

          {/* Identidade */}
          <div className="md:col-span-5">
            <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-gold mb-5">Est. 2026</p>
            <h3 className="font-serif text-[32px] text-white leading-tight mb-1">
              Claraboia
            </h3>
            <p className="font-serif text-[32px] text-gold leading-tight mb-8">
              Arquitetura
            </p>
            <p className="font-sans text-[12px] font-light leading-[1.9] text-white/40 max-w-[260px]">
              Transformamos espaços em experiências únicas, com olhar feminino, rigor técnico e profundo cuidado com o habitar.
            </p>
            {/* Redes */}
            <div className="flex gap-3 mt-8">
              <a
                href="https://www.instagram.com/claraboia.arquitetura?igsh=ZndleDFreHR5b25s"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/30 hover:border-gold hover:text-gold transition-all duration-300 cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram size={13} strokeWidth={1.5} />
              </a>
              <a
                href="mailto:contato@clarabolaarquitetura.com"
                className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/30 hover:border-gold hover:text-gold transition-all duration-300 cursor-pointer"
                aria-label="E-mail"
              >
                <Mail size={13} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/20 mb-7">Navegação</h4>
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
                  className="font-sans text-[12px] font-light text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contato */}
          <div className="md:col-span-3">
            <h4 className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/20 mb-7">Fale conosco</h4>
            <div className="flex flex-col gap-4">
              <a
                href="mailto:contato@clarabolaarquitetura.com"
                className="flex items-start gap-3 font-sans text-[12px] font-light text-white/40 hover:text-white transition-colors group cursor-pointer"
              >
                <Mail size={12} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <span>contato@clarabolaarquitetura.com</span>
              </a>
              <a
                href="https://www.instagram.com/claraboia.arquitetura?igsh=ZndleDFreHR5b25s"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 font-sans text-[12px] font-light text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <Instagram size={12} strokeWidth={1.5} className="shrink-0" />
                @claraboia.arquitetura
              </a>
              <div className="flex items-start gap-3 font-sans text-[12px] font-light text-white/25">
                <MapPin size={12} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <span>Aracaju, Sergipe — Brasil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[10px] font-light text-white/20 tracking-widest">
            © {new Date().getFullYear()} Claraboia Arquitetura. Todos os direitos reservados.
          </p>
          <Link
            href="/admin"
            className="font-sans text-[10px] font-light text-white/10 hover:text-white/30 transition-colors tracking-widest cursor-pointer"
          >
            Área restrita
          </Link>
        </div>
      </div>
    </footer>
  )
}
