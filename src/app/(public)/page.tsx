import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types'
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

  const [{ data: projectsBase }, { data: architects }, { data: manifestoPhotosSettings, error: manifestoPhotosSettingsError }] = await Promise.all([
    supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(24),
    supabase.from('architects').select('*').order('name'),
    supabase
      .from('site_settings')
      .select('key, value_text')
      .in('key', ['home_manifesto_photo_1_url', 'home_manifesto_photo_2_url']),
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

  const siteSettingsMissing =
    manifestoPhotosSettingsError?.code === 'PGRST205' ||
    manifestoPhotosSettingsError?.message?.toLowerCase().includes("could not find the table 'public.site_settings'") ||
    false
  const manifestoPhotosMap = new Map((manifestoPhotosSettings || []).map((item) => [item.key as string, item.value_text as string]))
  const manifestoPhoto1 = siteSettingsMissing
    ? ''
    : (manifestoPhotosMap.get('home_manifesto_photo_1_url') || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80")
  const manifestoPhoto2 = siteSettingsMissing
    ? ''
    : (manifestoPhotosMap.get('home_manifesto_photo_2_url') || "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&q=80")

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-[760px] px-6 lg:px-14 pb-16 md:pb-20 overflow-hidden bg-moss flex items-end">
        <Image
          src="/brand/hero-identity.jpg"
          alt="Claraboia Arquitetura"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_18%,rgba(108,50,51,0.22),transparent_42%),radial-gradient(circle_at_16%_86%,rgba(57,57,30,0.25),transparent_38%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-moss/85 via-moss/40 to-moss/45" />
          <div className="absolute left-[8%] top-[18%] h-[320px] w-px bg-cream/25" />
          <div className="absolute left-[8%] top-[18%] h-px w-[26vw] bg-cream/25 max-w-[340px]" />
          <div className="absolute right-[9%] top-[20%] h-[300px] w-px bg-gold/40 hidden lg:block" />
          <div className="absolute right-[9%] top-[20%] h-px w-[20vw] bg-gold/40 max-w-[280px] hidden lg:block" />
          <div className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <div className="absolute left-0 bottom-0 w-full h-px bg-gradient-to-r from-transparent via-cream/35 to-transparent" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4 mb-7">
              <span className="block w-12 h-px bg-gold" />
              <p className="font-sans text-[9px] font-light tracking-[0.55em] uppercase text-cream/75">
                Aracaju, Sergipe · Estúdio fundado em 2026
              </p>
            </div>

            <p className="font-serif text-[22px] md:text-[28px] text-cream leading-[1.25] max-w-md mb-10">
              Arquitetura autoral com luz, matéria e propósito.
            </p>
          </div>

          <div className="lg:col-span-4 lg:pl-10">
            <div className="space-y-3 md:space-y-4 topics-group">
              {[
                ['Direção criativa', 'Conceito, materialidade e atmosfera alinhados ao seu estilo de vida.'],
                ['Planejamento técnico', 'Compatibilização e detalhamento para obra sem ruído.'],
                ['Acompanhamento', 'Curadoria de escolhas e suporte em todas as etapas.'],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="topic-card border border-cream/22 bg-moss/45 backdrop-blur-[2px] p-4 md:p-5 transition-all duration-300 hover:bg-moss/65 hover:border-gold/40 hover:shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
                >
                  <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-rose mb-2">{title}</p>
                  <p className="font-sans text-[14px] leading-[1.7] text-cream">{text}</p>
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
            <p className="font-sans text-[12px] md:text-[13px] font-medium tracking-[0.28em] uppercase text-gold mb-7">Quem somos</p>
            <h2 className="font-serif text-5xl md:text-6xl text-[#171717] leading-[1.05] mb-8">
              Um olhar
              <br />feminino
              <br />
              <span className="text-wine">sobre o espaço</span>
            </h2>
            <p className="font-sans text-[13px] font-light leading-[2] text-black/50 mb-10 max-w-sm">
              O escritório nasceu da união de seis amigas, que ao longo da formação em arquitetura compartilharam experiências, aprendizados e o desejo de construir algo juntas. A Claraboia surge dessa parceria e da vontade de transformar ideias em projetos que façam sentido para as pessoas e para os lugares onde se inserem.
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
                  style={{ backgroundImage: `url('${manifestoPhoto1}')` }}
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden bg-stone-100 mt-14">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
                  style={{ backgroundImage: `url('${manifestoPhoto2}')` }}
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
                <p className="font-sans text-[12px] md:text-[13px] font-medium tracking-[0.28em] uppercase text-gold">Projetos</p>
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
