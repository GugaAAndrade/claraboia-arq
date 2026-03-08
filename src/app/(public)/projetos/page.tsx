import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const TYPOLOGIES = ['Todos', 'Residencial', 'Comercial', 'Interiores', 'Urbanismo', 'Outros']
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

export const metadata = {
  title: 'Projetos · Claraboia Arquitetura',
  description: 'Projetos da Claraboia Arquitetura — residenciais, comerciais e de interiores.',
}

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipologia?: string; arquiteta?: string }>
}) {
  const { tipologia, arquiteta } = await searchParams
  const supabase = await createClient()

  const [{ data: projectsRaw }, { data: architects }] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .order('year', { ascending: false }),
    supabase.from('architects').select('id, name').order('name'),
  ])
  const architectById = new Map((architects || []).map((a) => [a.id as string, a.name as string]))

  const allProjects = (projectsRaw || []) as Project[]
  const projectIds = allProjects.map((p) => p.id)
  const { data: links } = projectIds.length
    ? await supabase
      .from('project_architects')
      .select('project_id, architect_id')
      .in('project_id', projectIds)
    : { data: null }

  const linkedArchitectIdsByProject = (links || []).reduce<Record<string, string[]>>((acc, link) => {
    const key = link.project_id as string
    if (!acc[key]) acc[key] = []
    acc[key].push(link.architect_id as string)
    return acc
  }, {})

  const projects = allProjects.filter((project) => {
    if (tipologia && tipologia !== 'Todos' && project.typology !== tipologia) return false
    if (arquiteta) {
      const linkedIds = linkedArchitectIdsByProject[project.id] || []
      if (project.architect_id !== arquiteta && !linkedIds.includes(arquiteta)) return false
    }
    return true
  }).map((project) => {
    const linkedIds = linkedArchitectIdsByProject[project.id] || []
    const linkedNames = linkedIds.map((id) => architectById.get(id)).filter(Boolean) as string[]
    const fallbackName = project.architect_id ? architectById.get(project.architect_id) : null
    const architectsLabel = linkedNames.length ? linkedNames.join(', ') : (fallbackName || '')
    return {
      ...project,
      architectsLabel,
    }
  })

  const activeTypology = tipologia || 'Todos'
  return (
    <>
      {/* Hero */}
      <section className="bg-wine py-20 lg:py-28 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
  
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-cream leading-[0.96]">
            Projetos
          </h1>
          <p className="text-cream/60 text-sm mt-5 max-w-md leading-relaxed">
            Espaços desenhados com precisão, atmosfera e identidade.
          </p>
        </div>
      </section>

      {/* Filtros — faixa sticky minimalista
      <section className="sticky top-[72px] z-40 bg-[#FAF5EA]/95 backdrop-blur-md border-y border-wine/10 py-5 px-6 lg:px-14">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 items-center">
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase text-moss/45 mr-3">Filtrar</span>

          {TYPOLOGIES.map((t) => (
            <Link
              key={t}
              href={t === 'Todos' ? '/projetos' : `/projetos?tipologia=${t}${arquiteta ? `&arquiteta=${arquiteta}` : ''}`}
              className={`px-5 py-1.5 font-sans text-[9px] font-light tracking-[0.25em] uppercase border transition-all duration-200 cursor-pointer ${
                activeTypology === t
                  ? 'bg-moss text-cream border-moss'
                  : 'border-wine/20 text-moss/65 hover:border-wine/45 hover:text-wine'
              }`}
            >
              {t}
            </Link>
          ))}

          {architects && architects.length > 0 && (
            <>
              <span className="font-sans text-[9px] tracking-[0.4em] uppercase text-moss/45 ml-4 mr-2">Arquiteta</span>
              {architects.map((a) => (
                <Link
                  key={a.id}
                  href={`/projetos?${tipologia && tipologia !== 'Todos' ? `tipologia=${tipologia}&` : ''}arquiteta=${arquiteta === a.id ? '' : a.id}`}
                  className={`px-5 py-1.5 font-sans text-[9px] font-light tracking-[0.25em] uppercase border transition-all duration-200 cursor-pointer ${
                    arquiteta === a.id
                      ? 'bg-wine text-cream border-wine'
                      : 'border-wine/20 text-moss/65 hover:border-wine/60 hover:text-wine'
                  }`}
                >
                  {a.name.split(' ')[0]}
                </Link>
              ))}
            </>
          )}
        </div>
      </section> */}

      {/* Grid de projetos */}
      <section className="py-16 px-6 lg:px-14 bg-[#FAF5EA] min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          {!projects || projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-36 text-center">
              <p className="font-serif text-4xl text-moss/35 mb-4">Nenhum projeto encontrado</p>
              <p className="font-sans text-[12px] font-light text-moss/55 mb-8">Tente remover os filtros para ver todos os projetos.</p>
              <Link
                href="/projetos"
                className="font-sans text-[10px] font-light tracking-[0.3em] uppercase border-b border-wine/30 pb-px hover:border-gold hover:text-gold cursor-pointer transition-colors"
              >
                Ver todos os projetos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-wine/10">
              {projects.map((project) => {
                return (
                <Link
                  key={project.id}
                  href={`/projetos/${encodeURIComponent(project.slug || slugify(project.title))}`}
                  className="group relative overflow-hidden bg-[#FFFDF8] cursor-pointer h-full flex flex-col"
                >
                  {/* Imagem */}
                  <div className="aspect-[4/3] bg-cream/35 relative overflow-hidden">
                    {project.cover_url ? (
                      <Image
                        src={project.cover_url}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-cream/45 to-background flex items-center justify-center">
                        <span className="font-serif text-7xl text-gold/45">{project.title.charAt(0)}</span>
                      </div>
                    )}

                    {/* Overlay com info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-moss/80 via-moss/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                      <p className="font-sans text-[9px] text-gold tracking-[0.4em] uppercase mb-2">{project.typology}</p>
                      <p className="font-serif text-cream text-lg">{project.title}</p>
                    </div>

                    {/* Arrow */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-cream/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight size={13} strokeWidth={1.5} className="text-moss" />
                    </div>
                  </div>

                  {/* Info abaixo */}
                  <div className="p-6 bg-moss border-t border-cream/10 min-h-[178px] flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-sans text-[8px] font-light tracking-[0.4em] uppercase text-gold">{project.typology}</p>
                      <p className="font-sans text-[10px] font-light text-cream/55 shrink-0">{project.year}</p>
                    </div>
                    <h2 className="font-serif text-lg text-cream group-hover:text-gold transition-colors min-h-[56px] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                      {project.title}
                    </h2>
                    <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      {project.architectsLabel && (
                        <p className="font-sans text-[11px] font-light text-cream/75 min-h-[56px] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
                          {project.architectsLabel}
                        </p>
                      )}
                      {project.location && (
                        <p className="font-sans text-[10px] font-light text-cream/55 text-right whitespace-pre-line">
                          {project.location}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )})}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
