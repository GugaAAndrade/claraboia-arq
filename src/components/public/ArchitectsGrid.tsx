'use client'

import { Architect } from '@/types'
import { Instagram, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface ArchitectsGridProps {
  architects: Architect[]
}

export function ArchitectsGrid({ architects }: ArchitectsGridProps) {
  const [selectedArchitect, setSelectedArchitect] = useState<Architect | null>(null)
  const modalTitleId = selectedArchitect ? `architect-modal-title-${selectedArchitect.id}` : undefined

  useEffect(() => {
    if (!selectedArchitect) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedArchitect(null)
    }

    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedArchitect])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {architects.map((arch) => (
          <button
            key={arch.id}
            type="button"
            onClick={() => setSelectedArchitect(arch)}
            className="group bg-white border border-wine/10 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left"
          >
            <div className="aspect-[3/4] relative overflow-hidden bg-cream/35">
              {arch.photo_url ? (
                <Image
                  src={arch.photo_url}
                  alt={arch.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={68}
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-cream/35">
                  <span className="font-serif text-8xl text-gold/45">{arch.name.charAt(0)}</span>
                </div>
              )}
            </div>

            <div className="p-8">
              {arch.specialty && (
                <p className="text-[10px] tracking-[0.3em] uppercase text-wine mb-2">{arch.specialty}</p>
              )}
              <h3 className="font-serif text-2xl text-charcoal mb-3">{arch.name}</h3>
              <div className="w-6 h-px bg-gold/55 mb-4" />
              {arch.bio && (
                <p className="text-moss/75 text-sm leading-relaxed mb-5 line-clamp-3">{arch.bio}</p>
              )}
              {arch.instagram && (
                <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-wine">
                  <Instagram size={12} />
                  {arch.instagram}
                </span>
              )}
              <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-moss/45 group-hover:text-wine transition-colors">
                Clique para ver perfil completo
              </p>
            </div>
          </button>
        ))}
      </div>

      {selectedArchitect && (
        <div
          className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4 md:p-6"
          onClick={() => setSelectedArchitect(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FFFDF8] border border-wine/15 shadow-[0_28px_70px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 md:px-4 md:sticky md:top-0 md:z-10 bg-[#FFFDF8]/95 border-b border-wine/10">
              <p className="text-[10px] tracking-[0.28em] uppercase text-moss/50">Resumo completo</p>
              <button
                type="button"
                aria-label="Fechar modal"
                onClick={() => setSelectedArchitect(null)}
                className="w-9 h-9 border border-wine/20 flex items-center justify-center text-moss/70 hover:text-wine hover:border-wine/35 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-[350px] md:min-h-[560px] md:h-auto bg-cream/40">
                {selectedArchitect.photo_url ? (
                  <Image
                    src={selectedArchitect.photo_url}
                    alt={selectedArchitect.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={72}
                    className="object-cover object-top md:object-center"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif text-8xl text-gold/45">{selectedArchitect.name.charAt(0)}</span>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-9">
                {selectedArchitect.specialty && (
                  <p className="text-[10px] tracking-[0.3em] uppercase text-wine mb-3">{selectedArchitect.specialty}</p>
                )}
                <h3 id={modalTitleId} className="font-serif text-3xl md:text-[38px] text-charcoal mb-4">
                  {selectedArchitect.name}
                </h3>
                <div className="w-10 h-px bg-gold/55 mb-6" />
                {selectedArchitect.bio ? (
                  <p className="text-moss/80 text-[15px] leading-[1.95] whitespace-pre-line text-justify">{selectedArchitect.bio}</p>
                ) : (
                  <p className="text-moss/60 text-sm">Resumo não informado.</p>
                )}

                {selectedArchitect.instagram && (
                  <a
                    href={`https://instagram.com/${selectedArchitect.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-wine hover:text-rose transition-colors"
                  >
                    <Instagram size={12} />
                    {selectedArchitect.instagram}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
