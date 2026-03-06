import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Architect } from '@/types'
import { Instagram, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Sobre',
  description: 'Conheça as arquitetas da Claraboia — um coletivo de profissionais apaixonadas por criar espaços que transformam.',
}

export default async function SobrePage() {
  const supabase = await createClient()
  const [{ data: architects }, { data: aboutTeamPhoto, error: aboutTeamPhotoError }] = await Promise.all([
    supabase.from('architects').select('*').order('name'),
    supabase
      .from('site_settings')
      .select('value_text')
      .eq('key', 'about_team_photo_url')
      .maybeSingle(),
  ])

  const siteSettingsMissing =
    aboutTeamPhotoError?.code === 'PGRST205' ||
    aboutTeamPhotoError?.message?.toLowerCase().includes("could not find the table 'public.site_settings'") ||
    false
  const aboutTeamPhotoUrl = siteSettingsMissing ? '' : (aboutTeamPhoto?.value_text || '')

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="pt-40 pb-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-wine" />
            <p className="text-[10px] tracking-[0.4em] uppercase text-black/30">Quem somos</p>
          </div>
          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl text-black font-normal leading-none tracking-tight max-w-3xl">
            Arquitetura<br />
            <em className="text-wine not-italic">com propósito</em>
          </h1>
        </div>
      </section>

      {/* ── MANIFESTO ────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-stone-50 border-y border-stone-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Citação */}
          <div className="lg:col-span-7">
            <div className="w-10 h-px bg-gold mb-8" />
            <blockquote className="font-serif text-2xl md:text-3xl text-black leading-snug">
              "Acreditamos que o espaço molda comportamentos,
              emoções e histórias. Nossa missão é criar ambientes
              que falam a língua de quem os habita."
            </blockquote>
          </div>

          {/* Texto de apoio */}
          <div className="lg:col-span-4 lg:col-start-9 pt-2">
            <div className="w-6 h-px bg-stone-300 mb-6" />
            <p className="text-black/50 leading-loose text-sm mb-5">
              Fundado em 2026, o coletivo Claraboia nasceu do desejo de criar uma arquitetura mais humana, feminina e autoral — onde cada projeto é único e profundamente ligado ao cliente.
            </p>
            <p className="text-black/50 leading-loose text-sm">
              Trabalhamos em colaboração, somando olhares e habilidades para que cada entrega supere expectativas.
            </p>

            <div className="mt-8 border border-stone-200 bg-white overflow-hidden">
              <div className="relative aspect-[4/3]">
                {aboutTeamPhotoUrl ? (
                  <Image
                    src={aboutTeamPhotoUrl}
                    alt="Equipe Claraboia"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(140deg,#F7F3ED_0%,#EAE5DD_100%)] flex items-center justify-center px-8">
                    <p className="font-serif text-2xl text-black/35 text-center">Foto da equipe</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALORES ──────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-8 h-px bg-wine" />
            <p className="text-[10px] tracking-[0.35em] uppercase text-black/30">Nossa essência</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-stone-100">
            {[
              {
                num: '01',
                title: 'Escuta ativa',
                text: 'Cada projeto nasce de um profundo entendimento do cliente, do espaço e do contexto vivido.',
              },
              {
                num: '02',
                title: 'Identidade coletiva',
                text: 'Somos um coletivo. A pluralidade de olhares enriquece cada decisão e cada detalhe projetual.',
              },
              {
                num: '03',
                title: 'Excelência técnica',
                text: 'Rigor nas entregas, atenção ao detalhe e compromisso com a qualidade em cada etapa.',
              },
            ].map((v) => (
              <div
                key={v.num}
                className="bg-white p-10 group hover:bg-stone-50 transition-colors duration-300"
              >
                <p className="font-serif text-4xl text-stone-200 mb-6 select-none">{v.num}</p>
                <div className="w-6 h-px bg-wine mb-5" />
                <h3 className="font-serif text-2xl text-black mb-4">{v.title}</h3>
                <p className="text-black/45 leading-relaxed text-sm">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARQUITETAS ───────────────────────────────────── */}
      {architects && architects.length > 0 && (
        <section className="py-24 px-6 lg:px-12 bg-stone-50 border-t border-stone-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-8 h-px bg-wine" />
              <p className="text-[10px] tracking-[0.35em] uppercase text-black/30">A equipe</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(architects as Architect[]).map((arch) => (
                <div key={arch.id} className="group bg-white border border-stone-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Foto */}
                  <div className="aspect-[3/4] relative overflow-hidden bg-stone-100">
                    {arch.photo_url ? (
                      <Image
                        src={arch.photo_url}
                        alt={arch.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                        <span className="font-serif text-8xl text-stone-300">{arch.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-8">
                    {arch.specialty && (
                      <p className="text-[10px] tracking-[0.3em] uppercase text-wine mb-2">{arch.specialty}</p>
                    )}
                    <h3 className="font-serif text-2xl text-black mb-3">{arch.name}</h3>
                    <div className="w-6 h-px bg-stone-200 mb-4" />
                    {arch.bio && (
                      <p className="text-black/50 text-sm leading-relaxed mb-5 line-clamp-3">{arch.bio}</p>
                    )}
                    {arch.instagram && (
                      <a
                        href={`https://instagram.com/${arch.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-black/35 hover:text-wine transition-colors"
                      >
                        <Instagram size={12} />
                        {arch.instagram}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px bg-wine" />
              <p className="text-[10px] tracking-[0.35em] uppercase text-black/30">Próximo passo</p>
            </div>
            <h2 className="font-serif text-5xl md:text-6xl text-black leading-tight">
              Vamos criar<br /><em className="text-wine not-italic">juntos?</em>
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="text-black/50 mb-8 max-w-sm leading-relaxed text-sm">
              Conte-nos sobre o seu espaço e transformamos sua ideia em realidade.
            </p>
            <Link
              href="/contato"
              className="group inline-flex items-center gap-3 bg-wine text-white px-10 py-4 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-black transition-all duration-300"
            >
              Fale conosco
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
