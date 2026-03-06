import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Project, Architect } from '@/types'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: projectsBase }, { data: architects }] = await Promise.all([
    supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(24),
    supabase.from('architects').select('*').order('name'),
  ])

  const architectById = new Map((architects || []).map((a) => [a.id as string, a.name as string]))

  const featuredProjects = ((projectsBase || []) as Project[])
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 6)
    .map((project) => ({
      ...project,
      architects: project.architect_id
        ? { name: architectById.get(project.architect_id) || '' }
        : null,
    })) as (Project & {
    architects: { name: string } | null
    project_architects?: { architects: { name: string } | null }[]
  })[]

  const { data: links } = await supabase
    .from('project_architects')
    .select('project_id, architects(name)')
    .in('project_id', featuredProjects.map((p) => p.id))

  if (links?.length) {
    const linksByProject = links.reduce<Record<string, { architects: { name: string } | null }[]>>((acc, link) => {
      const key = link.project_id as string
      if (!acc[key]) acc[key] = []
      const rawArchitect = (link as { architects: { name: string } | { name: string }[] | null }).architects
      const architect = Array.isArray(rawArchitect) ? (rawArchitect[0] || null) : rawArchitect
      acc[key].push({ architects: architect })
      return acc
    }, {})

    for (const project of featuredProjects) {
      project.project_architects = linksByProject[project.id] || []
    }
  }

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-[760px] pt-36 pb-20 px-6 lg:px-14 overflow-hidden bg-[#F5F2EB]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_18%,rgba(122,45,58,0.16),transparent_42%),radial-gradient(circle_at_16%_86%,rgba(23,23,23,0.08),transparent_38%)]" />
          <div className="absolute left-[8%] top-[18%] h-[320px] w-px bg-black/12" />
          <div className="absolute left-[8%] top-[18%] h-px w-[26vw] bg-black/12 max-w-[340px]" />
          <div className="absolute right-[9%] top-[20%] h-[300px] w-px bg-gold/40 hidden lg:block" />
          <div className="absolute right-[9%] top-[20%] h-px w-[20vw] bg-gold/40 max-w-[280px] hidden lg:block" />
          <div className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <div className="absolute left-0 bottom-0 w-full h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4 mb-9">
              <span className="block w-12 h-px bg-gold" />
              <p className="font-sans text-[9px] font-light tracking-[0.55em] uppercase text-black/45">
                Aracaju, Sergipe · Estúdio fundado em 2026
              </p>
            </div>

            <h1 className="font-[Georgia,'Times_New_Roman',serif] text-[52px] md:text-[86px] lg:text-[112px] text-[#171717] leading-[0.91] md:leading-[0.89] lg:leading-[0.9] tracking-[-0.02em] mb-8 [font-variant-caps:normal] normal-case">
              Linhas precisas.
              <br />
              Espaços com alma.
            </h1>

            <p className="font-sans text-[14px] md:text-[15px] text-black/55 leading-[1.95] max-w-2xl mb-10">
              Projetos residenciais e interiores conduzidos por um coletivo de arquitetas que une sensibilidade estética,
              estratégia de layout e execução técnica de alto nível.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Link
                href="/projetos"
                className="group inline-flex items-center gap-3 bg-[#171717] text-white px-9 py-4 font-sans text-[10px] font-light tracking-[0.32em] uppercase hover:bg-wine transition-all duration-300 cursor-pointer"
              >
                Ver portfólio
                <ArrowRight size={13} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contato"
                className="inline-flex items-center gap-2 font-sans text-[10px] font-light tracking-[0.3em] uppercase text-black/60 hover:text-black transition-colors pb-px border-b border-black/25 hover:border-black cursor-pointer"
              >
                Iniciar projeto
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 lg:pl-10">
            <div className="border-t border-black/15 pt-6 space-y-6">
              {[
                ['Direção criativa', 'Conceito, materialidade e atmosfera alinhados ao seu estilo de vida.'],
                ['Planejamento técnico', 'Compatibilização e detalhamento para obra sem ruído.'],
                ['Acompanhamento', 'Curadoria de escolhas e suporte em todas as etapas.'],
              ].map(([title, text]) => (
                <div key={title}>
                  <p className="font-sans text-[9px] tracking-[0.32em] uppercase text-gold mb-2">{title}</p>
                  <p className="font-sans text-[12px] leading-[1.9] text-black/50">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ────────────────────────────────────────── */}
      <section className="py-36 px-6 lg:px-14 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          {/* Texto */}
          <div className="lg:col-span-5">
            <span className="block w-10 h-px bg-gold mb-8" />
            <p className="font-sans text-[9px] font-light tracking-[0.5em] uppercase text-black/35 mb-7">Quem somos</p>
            <h2 className="font-serif text-5xl md:text-6xl text-[#171717] leading-[1.05] mb-8">
              Um olhar
              <br />feminino
              <br />
              <span className="text-wine">sobre o espaço</span>
            </h2>
            <p className="font-sans text-[13px] font-light leading-[2] text-black/50 mb-10 max-w-sm">
              A Claraboia é um coletivo de arquitetas comprometidas com projetos que vão além da estética — criamos experiências que tocam quem os vive.
            </p>
            <Link
              href="/sobre"
              className="group inline-flex items-center gap-2 font-sans text-[10px] font-light tracking-[0.3em] uppercase text-black border-b border-black pb-px hover:border-gold hover:text-gold transition-all duration-300 cursor-pointer"
            >
              Conheça a equipe
              <ArrowUpRight size={12} strokeWidth={1.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Bloco visual — duas imagens deslocadas */}
          <div className="lg:col-span-7 lg:col-start-6 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] overflow-hidden bg-stone-100">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80')" }}
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden bg-stone-100 mt-14">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80')" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJETOS ─────────────────────────────────────────── */}
      {featuredProjects && featuredProjects.length > 0 && (
        <section className="py-28 px-6 lg:px-14 bg-[#F8F8F6]">
          <div className="max-w-7xl mx-auto">
            {/* Header seção */}
            <div className="flex items-end justify-between mb-16">
              <div>
                <span className="block w-10 h-px bg-gold mb-7" />
                <p className="font-sans text-[9px] font-light tracking-[0.5em] uppercase text-black/30 mb-5">Portfólio selecionado</p>
                <h2 className="font-serif text-5xl md:text-6xl text-[#171717] leading-none">
                  Projetos em
                  <br />destaque
                </h2>
              </div>
              <Link
                href="/projetos"
                className="hidden md:inline-flex items-center gap-2 font-sans text-[10px] font-light tracking-[0.3em] uppercase text-black/40 hover:text-black transition-colors border-b border-black/15 pb-px cursor-pointer"
              >
                Ver todos
                <ArrowUpRight size={12} strokeWidth={1.5} />
              </Link>
            </div>

            {/* Grid editorial — tamanhos variados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-200/60">
              {featuredProjects.map((project, i) => {
                const linkedNames = (project.project_architects || [])
                  .map((item) => item.architects?.name)
                  .filter(Boolean) as string[]
                const architectsLabel = linkedNames.length
                  ? linkedNames.join(', ')
                  : (project.architects?.name || '')
                return (
                <Link
                  key={project.id}
                  href={`/projetos/${encodeURIComponent(project.slug || slugify(project.title))}`}
                  className={`group relative overflow-hidden bg-stone-100 cursor-pointer ${
                    i === 0 ? 'md:row-span-2 md:col-span-1' : ''
                  }`}
                >
                  <div className={`relative overflow-hidden ${i === 0 ? 'aspect-[3/4] md:h-full' : 'aspect-[4/3]'}`}>
                    {project.cover_url ? (
                      <Image
                        src={project.cover_url}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                        <span className="font-serif text-6xl text-stone-400/60">{project.title.charAt(0)}</span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    {/* Info bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-7 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="font-sans text-[9px] font-light tracking-[0.4em] uppercase text-gold mb-2">
                        {project.typology} · {project.year}
                      </p>
                      <h3 className="font-serif text-xl text-white group-hover:text-gold transition-colors leading-snug">
                        {project.title}
                      </h3>
                      {architectsLabel && (
                        <p className="font-sans text-[11px] font-light text-white/40 mt-1">{architectsLabel}</p>
                      )}
                    </div>

                    {/* Arrow hover */}
                    <div className="absolute top-5 right-5 w-9 h-9 bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight size={14} strokeWidth={1.5} className="text-white" />
                    </div>
                  </div>
                </Link>
              )})}
            </div>

            <div className="text-center mt-10 md:hidden">
              <Link
                href="/projetos"
                className="inline-flex items-center gap-2 font-sans text-[10px] font-light text-black/45 tracking-[0.3em] uppercase cursor-pointer"
              >
                Ver todos os projetos <ArrowRight size={12} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── EQUIPE PREVIEW ───────────────────────────────────── */}
      {architects && architects.length > 0 && (
        <section className="py-32 px-6 lg:px-14 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-18">
              <div className="flex items-center justify-center gap-5 mb-7">
                <span className="block w-10 h-px bg-gold" />
                <p className="font-sans text-[9px] font-light tracking-[0.5em] uppercase text-black/30">A equipe</p>
                <span className="block w-10 h-px bg-gold" />
              </div>
              <h2 className="font-serif text-5xl md:text-6xl text-[#171717]">As arquitetas</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
              {(architects as Architect[]).map((arch) => (
                <div key={arch.id} className="group relative overflow-hidden bg-stone-50">
                  <div className="aspect-[3/4] bg-stone-200 relative overflow-hidden">
                    {arch.photo_url ? (
                      <Image
                        src={arch.photo_url}
                        alt={arch.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                        <span className="font-serif text-8xl text-stone-300">{arch.name.charAt(0)}</span>
                      </div>
                    )}
                    {/* Overlay sutil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  {/* Info */}
                  <div className="p-7 bg-white border-t border-gold/40">
                    {arch.specialty && (
                      <p className="font-sans text-[9px] font-light tracking-[0.4em] uppercase text-gold mb-2">{arch.specialty}</p>
                    )}
                    <p className="font-serif text-xl text-[#171717]">{arch.name}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-14">
              <Link
                href="/sobre"
                className="group inline-flex items-center gap-2 font-sans text-[10px] font-light tracking-[0.3em] uppercase text-black border-b border-black pb-px hover:border-gold hover:text-gold transition-all duration-300 cursor-pointer"
              >
                Conheça mais sobre a equipe
                <ArrowUpRight size={12} strokeWidth={1.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA FINAL ─────────────────────────────────────────── */}
      <section className="relative py-44 px-6 overflow-hidden bg-[#F8F8F6]">
        {/* Elemento decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1920&q=30')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-5 mb-10">
            <span className="block w-10 h-px bg-gold" />
            <p className="font-sans text-[9px] font-light tracking-[0.55em] uppercase text-black/30">Vamos conversar</p>
            <span className="block w-10 h-px bg-gold" />
          </div>
          <h2 className="font-serif text-5xl md:text-7xl text-[#171717] mb-6 leading-none">
            Seu projeto
            <br />
            <em className="text-wine not-italic">começa aqui</em>
          </h2>
          <p className="font-sans text-[13px] font-light text-black/40 mb-14 max-w-lg mx-auto leading-[2]">
            Conte-nos sobre o seu espaço, seus sonhos e deixe-nos transformar tudo isso em realidade.
          </p>
          <div className="flex justify-center">
            <Link
              href="/contato"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 border border-black/20 text-black font-sans font-light tracking-[0.2em] uppercase text-[10px] hover:bg-[#171717] hover:text-white hover:border-[#171717] transition-all duration-300 cursor-pointer"
            >
              Formulário de contato
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
