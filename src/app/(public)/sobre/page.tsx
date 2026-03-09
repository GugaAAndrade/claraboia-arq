import { createClient } from '@/lib/supabase/server'
import { Architect } from '@/types'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ArchitectsGrid } from '@/components/public/ArchitectsGrid'

export const metadata = {
  title: 'Sobre',
  description: 'Conheça as arquitetas da Claraboia — um coletivo de profissionais apaixonadas por criar espaços que transformam.',
}

export default async function SobrePage() {
  const supabase = await createClient()
  const [{ data: architects }, { data: aboutSettings, error: aboutSettingsError }] = await Promise.all([
    supabase.from('architects').select('*').order('name'),
    supabase
      .from('site_settings')
      .select('key, value_text')
      .in('key', ['about_team_photo_url', 'about_identity_visual_image_url']),
  ])

  const siteSettingsMissing =
    aboutSettingsError?.code === 'PGRST205' ||
    aboutSettingsError?.message?.toLowerCase().includes("could not find the table 'public.site_settings'") ||
    false
  const aboutSettingsMap = new Map((aboutSettings || []).map((item) => [item.key as string, item.value_text as string]))
  const aboutTeamPhotoUrl = siteSettingsMissing ? '' : (aboutSettingsMap.get('about_team_photo_url') || '')
  const aboutIdentityVisualImageUrl = siteSettingsMissing
    ? ''
    : (aboutSettingsMap.get('about_identity_visual_image_url') || aboutTeamPhotoUrl)

  return (
    <>
      {/* ── HEADER ───────────────────────────────────────── */}
      <section className="pt-24 lg:pt-28 pb-20 lg:pb-24 bg-wine overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          <div>
            <p className="font-serif text-[20px] tracking-[0.35em] uppercase text-cream mb-4">Nossa origem</p>
            <div className="border-l border-cream/25 pl-6 space-y-4 font-sans text-[14px] leading-[1.85] text-cream/75">
              <p>
                O nome Claraboia vem do elemento arquitetônico que permite a entrada de luz natural pelos tetos
                e coberturas, iluminando os ambientes de forma suave e valorizando os espaços.
              </p>
              <p>
                Na arquitetura, a luz natural é essencial para criar conforto, destacar materiais e transformar
                a experiência de quem vive o ambiente.
              </p>
              <p>
                O escritório nasceu da união de seis amigas que, ao longo da formação em arquitetura, compartilharam
                experiências, aprendizados e o desejo de construir algo juntas.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden border border-cream/20">
              {aboutTeamPhotoUrl ? (
                <Image
                  src={aboutTeamPhotoUrl}
                  alt="Equipe Claraboia"
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-moss/90 to-wine/60 flex items-center justify-center px-8">
                  <p className="font-serif text-3xl text-cream/80 text-center">Claraboia Arquitetura</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-moss/35 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ────────────────────────────────────── */}
      <section className="py-20 lg:py-24 px-6 lg:px-12 bg-[#FFFDF8] border-b border-wine/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14">
          <div className="lg:col-span-7">
            <p className="font-sans text-[16px] tracking-[0.35em] uppercase text-gold mb-4">Manifesto</p>
            <h2 className="font-serif text-[34px] md:text-[44px] text-charcoal leading-[1.08] mb-8">
              Acreditamos que a arquitetura deve iluminar os espaços, as relações e a forma como vivemos.
            </h2>
            <div className="space-y-4 font-sans text-[14px] leading-[1.9] text-moss/75">
              <p>
                Somos seis mulheres criativas que enxergam a arquitetura como ferramenta de transformação urbana,
                ambiental e cotidiana. Inspiradas pela arquitetura moderna e contemporânea, projetamos com linhas
                claras, volumetrias bem definidas e integração com o entorno.
              </p>
              <p>
                Assim como a claraboia rompe a cobertura para permitir a entrada da luz, nossos projetos rompem
                padrões superficiais para revelar o essencial.
              </p>
              <p>Projetamos com intenção. Projetamos com consciência. Projetamos para gerar impacto.</p>
            </div>
          </div>
          <div className="lg:col-span-5">
            
          </div>
        </div>
      </section>


      {/* ── IDENTIDADE VISUAL ───────────────────────────── */}
      <section className="py-20 lg:py-24 px-6 lg:px-12 bg-background border-b border-wine/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative aspect-[4/3] overflow-hidden border border-wine/15 bg-white">
              {aboutIdentityVisualImageUrl ? (
                <Image
                  src={aboutIdentityVisualImageUrl}
                  alt="Claraboia Arquitetura"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(140deg,#F7F3ED_0%,#EAE5DD_100%)] flex items-center justify-center px-8">
                  <p className="font-serif text-2xl text-moss/45 text-center">Claraboia Arquitetura</p>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <p className="font-sans text-[16px] tracking-[0.35em] uppercase text-gold mb-4">Identidade visual</p>
            <h2 className="font-serif text-[34px] md:text-[44px] text-charcoal leading-[1.08] mb-8">
              A marca como extensão da filosofia projetual
            </h2>
            <div className="space-y-4 font-sans text-[14px] leading-[1.9] text-moss/75">
              <p>
                A identidade visual da Claraboia Arquitetura foi desenhada para refletir a luz como elemento central
                que transforma os espaços.
              </p>
              <p>
                As letras “a” possuem desenho alongado e hastes abertas, simbolizando as aberturas das claraboias e
                a entrada de ventilação e claridade. A letra “i” surge levemente inclinada, remetendo aos planos
                diagonais dos telhados e coberturas.
              </p>
              <p>
                Sobre o “i”, o ponto se transforma em um sol com 6 feixes de luz, representando as 6 integrantes do
                escritório. A letra “o” achatada equilibra a composição e reforça o caráter moderno e sofisticado da marca.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOSSA ESSÊNCIA ──────────────────────────────── */}
      <section className="py-20 lg:py-24 px-6 lg:px-12 bg-[#FFFDF8] border-b border-wine/10">
        <div className="max-w-7xl mx-auto">
          <p className="font-sans text-[16px] tracking-[0.35em] uppercase text-gold mb-3">Nossa essência</p>
          <h2 className="font-serif text-[34px] md:text-[44px] text-charcoal leading-[1.08]">
            Princípios que sustentam cada etapa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                num: '01',
                title: 'Escuta ativa',
                text: 'Cada projeto nasce do entendimento profundo do cliente, do espaço e do contexto vivido.',
              },
              {
                num: '02',
                title: 'Identidade coletiva',
                text: 'A pluralidade de olhares fortalece as decisões e enriquece cada detalhe projetual.',
              },
              {
                num: '03',
                title: 'Excelência técnica',
                text: 'Rigor nas entregas, atenção ao detalhe e compromisso com qualidade em todas as etapas.',
              },
            ].map((v) => (
              <div key={v.num} className="border-t-2 border-wine pt-6">
                <p className="font-serif text-4xl text-gold/65 mb-4 select-none">{v.num}</p>
                <h3 className="font-serif text-[30px] leading-none text-charcoal">{v.title}</h3>
                <p className="font-sans text-[14px] leading-[1.85] text-moss/75 mt-4">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARQUITETAS ───────────────────────────────────── */}
      {architects && architects.length > 0 && (
        <section className="py-24 px-6 lg:px-12 bg-background border-y border-wine/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-8 h-px bg-wine" />
              <p className="text-[16px] tracking-[0.35em] uppercase text-moss/60">A equipe</p>
            </div>

            <ArchitectsGrid architects={architects as Architect[]} />
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-[#FFFDF8] border-t border-wine/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px bg-wine" />
              <p className="text-[16px] tracking-[0.35em] uppercase text-moss/60">Próximo passo</p>
            </div>
            <h2 className="font-serif text-5xl md:text-6xl text-charcoal leading-tight">
              Vamos criar<br /><em className="text-wine not-italic">juntos?</em>
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="text-moss/75 mb-8 max-w-sm leading-relaxed text-sm">
              Conte-nos sobre o seu espaço e transformamos sua ideia em realidade.
            </p>
            <Link
              href="/contato"
              className="group inline-flex items-center gap-3 bg-wine text-white px-10 py-4 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-moss transition-all duration-300"
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
