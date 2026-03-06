import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Calendar, ArrowLeft, Ruler, Home, UserRound } from 'lucide-react'
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
const toTitleGuess = (slug: string) =>
  decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const normalizedSlug = slugify(decodeURIComponent(slug))
  const titleGuess = toTitleGuess(slug)
  const fuzzyPattern = `%${normalizedSlug.replace(/-/g, '%')}%`
  const { data: direct } = await supabase
    .from('projects')
    .select('title, description, slug')
    .ilike('slug', normalizedSlug)
    .maybeSingle()
  let data = direct
  if (!data && titleGuess) {
    const { data: byTitle } = await supabase
      .from('projects')
      .select('title, description, slug')
      .ilike('title', titleGuess)
      .maybeSingle()
    data = byTitle
  }
  if (!data) {
    const { data: fuzzy } = await supabase
      .from('projects')
      .select('title, description, slug')
      .or(`slug.ilike.${fuzzyPattern},title.ilike.${fuzzyPattern}`)
      .limit(1)
      .maybeSingle()
    data = fuzzy
  }
  if (!data) {
    const { data: allProjects } = await supabase.from('projects').select('title, description, slug').limit(200)
    data = (allProjects || []).find((project) => slugify(project.slug || project.title || '') === normalizedSlug) || null
  }
  if (!data) return { title: 'Projeto não encontrado' }
  return {
    title: data.title,
    description: data.description ?? undefined,
  }
}

export default async function ProjetoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const normalizedSlug = slugify(decodeURIComponent(slug))
  const titleGuess = toTitleGuess(slug)
  const fuzzyPattern = `%${normalizedSlug.replace(/-/g, '%')}%`

  const { data: directProject } = await supabase
    .from('projects')
    .select('*')
    .ilike('slug', normalizedSlug)
    .maybeSingle()
  let project = directProject
  if (!project && titleGuess) {
    const { data: byTitle } = await supabase
      .from('projects')
      .select('*')
      .ilike('title', titleGuess)
      .maybeSingle()
    project = byTitle
  }
  if (!project) {
    const { data: fuzzy } = await supabase
      .from('projects')
      .select('*')
      .or(`slug.ilike.${fuzzyPattern},title.ilike.${fuzzyPattern}`)
      .limit(1)
      .maybeSingle()
    project = fuzzy
  }
  if (!project) {
    const { data: allProjects } = await supabase.from('projects').select('*').limit(200)
    project = (allProjects || []).find((item) => slugify(item.slug || item.title || '') === normalizedSlug) || null
  }

  if (!project) notFound()

  const allImages = [
    ...(project.cover_url ? [project.cover_url] : []),
    ...(project.images || []).filter((img: string) => img !== project.cover_url),
  ]
  const floorPlans = Array.isArray(project.floor_plans) ? project.floor_plans.filter(Boolean) : []
  const descriptionBlocks = (project.description || '')
    .split(/\n\s*\n/)
    .map((block: string) => block.trim())
    .filter(Boolean)
  const [leadText, ...detailParagraphs] = descriptionBlocks
  const { data: mainArchitect } = project.architect_id
    ? await supabase.from('architects').select('*').eq('id', project.architect_id).maybeSingle()
    : { data: null }

  const { data: projectLinks } = await supabase
    .from('project_architects')
    .select('architect_id')
    .eq('project_id', project.id)

  const linkedArchitectIds = (projectLinks || []).map((item) => item.architect_id).filter(Boolean) as string[]
  const { data: linkedArchitectRows } = linkedArchitectIds.length
    ? await supabase.from('architects').select('*').in('id', linkedArchitectIds)
    : { data: [] }
  const linkedArchitects = (linkedArchitectRows || []) as {
    id: string
    name: string
    photo_url?: string | null
    specialty?: string | null
  }[]
  const projectArchitects = linkedArchitects.length
    ? linkedArchitects
    : (mainArchitect ? [mainArchitect] : [])

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-cream py-4 px-6 border-b border-gold/20">
        <div className="max-w-7xl mx-auto">
          <Link href="/projetos" className="inline-flex items-center gap-2 text-sm text-moss/50 hover:text-wine transition-colors">
            <ArrowLeft size={14} />
            Voltar aos projetos
          </Link>
        </div>
      </div>

      {/* Hero do projeto */}
      <section className="relative min-h-[65vh] bg-moss overflow-hidden flex items-end">
        {project.cover_url ? (
          <Image
            src={project.cover_url}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-wine/60 to-moss" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />
        <div className="relative w-full p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex flex-col bg-black/45 backdrop-blur-sm border border-white/15 px-6 py-5 md:px-8 md:py-7">
              <p className="text-gold text-[11px] tracking-[0.35em] uppercase mb-3">{project.typology || 'Projeto'}</p>
              <h1 className="font-serif text-4xl md:text-6xl !text-white leading-[0.95] [text-shadow:0_3px_22px_rgba(0,0,0,0.55)]">
                {project.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Descrição */}
          <div className="lg:col-span-2">
            <div className="mb-12">
              <p className="text-[10px] tracking-[0.35em] uppercase text-wine/70 mb-5">Narrativa do projeto</p>
              {leadText ? (
                <>
                  <p className="font-serif text-2xl md:text-3xl text-moss leading-[1.35] mb-7">{leadText}</p>
                  <div className="space-y-5">
                    {detailParagraphs.map((paragraph: string, index: number) => (
                      <p key={index} className="text-moss/75 text-[16px] leading-[1.9]">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-moss/60 text-lg leading-relaxed">
                  Em breve adicionaremos uma narrativa completa deste projeto.
                </p>
              )}
            </div>

            {/* Galeria */}
            {allImages.length > 0 && (
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-wine/70 mb-5">Galeria do projeto</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allImages.map((url: string, i: number) => (
                  <div key={i} className={`overflow-hidden bg-stone-100 ${i === 0 ? 'sm:col-span-2' : ''}`}>
                    <div className={`relative ${i === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                      <Image
                        src={url}
                        alt={`${project.title} — imagem ${i + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}

            {/* Plantas */}
            {floorPlans.length > 0 && (
              <div className="mt-14">
                <p className="text-[10px] tracking-[0.35em] uppercase text-wine/70 mb-5">Plantas</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {floorPlans.map((url: string, i: number) => (
                    <div key={i} className="overflow-hidden bg-stone-100 border border-stone-200">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={url}
                          alt={`${project.title} — planta ${i + 1}`}
                          fill
                          className="object-contain bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mapa */}
            {project.map_embed_url && (
              <div className="mt-14">
                <p className="text-[10px] tracking-[0.35em] uppercase text-wine/70 mb-5">Localização no mapa</p>
                <div className="border border-stone-200 bg-white">
                  <div className="relative aspect-[16/9]">
                    <iframe
                      src={project.map_embed_url}
                      className="absolute inset-0 w-full h-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Mapa do projeto ${project.title}`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar info */}
          <div className="lg:col-span-1">
            <div className="bg-moss/5 p-8 sticky top-[90px]">
              <h3 className="font-serif text-xl text-moss mb-6">Detalhes</h3>

              <div className="flex flex-col gap-4 mb-8">
                {project.typology && (
                  <div className="flex items-center gap-2">
                    <Home size={14} className="text-gold" />
                    <div>
                    <p className="text-xs tracking-widest uppercase text-gold mb-1">Tipologia</p>
                    <p className="text-moss">{project.typology}</p>
                    </div>
                  </div>
                )}
                {project.year && (
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gold" />
                    <p className="text-moss">{project.year}</p>
                  </div>
                )}
                {project.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gold" />
                    <p className="text-moss">{project.location}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Ruler size={14} className="text-gold" />
                  <p className="text-moss/70 text-sm">{project.area_m2 ? `${project.area_m2} m²` : 'Área não informada'}</p>
                </div>
              </div>

              {(project.client_name || project.project_scope || project.project_status || project.materials || project.team_notes) && (
                <div className="border-t border-gold/20 pt-6 mb-8">
                  <p className="text-xs tracking-widest uppercase text-gold mb-4">Ficha técnica</p>
                  <div className="space-y-3 text-sm">
                    {project.client_name && (
                      <div>
                        <p className="text-moss/45 uppercase tracking-wider text-[10px]">Cliente</p>
                        <p className="text-moss">{project.client_name}</p>
                      </div>
                    )}
                    {project.project_status && (
                      <div>
                        <p className="text-moss/45 uppercase tracking-wider text-[10px]">Status</p>
                        <p className="text-moss">{project.project_status}</p>
                      </div>
                    )}
                    {project.project_scope && (
                      <div>
                        <p className="text-moss/45 uppercase tracking-wider text-[10px]">Escopo</p>
                        <p className="text-moss">{project.project_scope}</p>
                      </div>
                    )}
                    {project.materials && (
                      <div>
                        <p className="text-moss/45 uppercase tracking-wider text-[10px]">Materiais</p>
                        <p className="text-moss">{project.materials}</p>
                      </div>
                    )}
                    {project.team_notes && (
                      <div>
                        <p className="text-moss/45 uppercase tracking-wider text-[10px]">Equipe / Parceiros</p>
                        <p className="text-moss">{project.team_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Arquitetas */}
              {projectArchitects.length > 0 && (
                <div className="border-t border-gold/20 pt-6 mb-8">
                  <p className="text-xs tracking-widest uppercase text-gold mb-3">
                    {projectArchitects.length > 1 ? 'Arquitetas responsáveis' : 'Arquiteta responsável'}
                  </p>
                  <div className="flex flex-col gap-3">
                    {projectArchitects.map((architect: {
                      id: string
                      name: string
                      photo_url?: string | null
                      specialty?: string | null
                    }) => (
                      <div key={architect.id} className="flex items-center gap-3">
                        {architect.photo_url ? (
                          <Image
                            src={architect.photo_url}
                            alt={architect.name}
                            width={44}
                            height={44}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-wine/10 border border-wine/20 flex items-center justify-center font-serif text-wine">
                            {architect.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-moss">{architect.name}</p>
                          {architect.specialty && (
                            <p className="text-xs text-moss/50">{architect.specialty}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {projectArchitects.length === 0 && (
                <div className="border-t border-gold/20 pt-6 mb-8">
                  <p className="text-xs tracking-widest uppercase text-gold mb-3">Equipe</p>
                  <div className="flex items-center gap-2 text-moss/65">
                    <UserRound size={14} />
                    <p className="text-sm">Detalhes da equipe podem ser vinculados no admin.</p>
                  </div>
                </div>
              )}

              {/* CTA */}
              <Link
                href="/contato"
                className="w-full flex items-center justify-center gap-2 py-4 bg-wine text-cream text-sm font-medium tracking-wider uppercase hover:bg-rose transition-colors"
              >
                Solicitar atendimento
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
