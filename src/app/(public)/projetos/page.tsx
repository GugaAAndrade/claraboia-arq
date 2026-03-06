import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types'
import { ArrowUpRight } from 'lucide-react'

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
  description: 'Portfólio completo da Claraboia Arquitetura — projetos residenciais, comerciais e de interiores.',
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
      {/* Hero da página — estilo editorial */}
      <section className="pt-44 pb-24 px-6 lg:px-14 bg-white relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-stone-200 to-transparent hidden lg:block ml-14" />
        <div className="max-w-7xl mx-auto">
          <span className="block w-10 h-px bg-gold mb-8" />
          <p className="font-sans text-[9px] font-light tracking-[0.55em] uppercase text-black/30 mb-6">Portfólio</p>
          <h1 className="font-serif text-[64px] md:text-[88px] text-[#171717] leading-none tracking-tight mb-6">
            Nossos
            <br />
            <em className="text-wine not-italic">projetos</em>
          </h1>
          <p className="font-sans text-[13px] font-light text-black/45 max-w-xs leading-[2]">
            Cada espaço tem uma história. Cada projeto, uma alma.
          </p>
        </div>
      </section>

      {/* Filtros — faixa sticky minimalista */}
      <section className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md border-y border-stone-100 py-5 px-6 lg:px-14">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 items-center">
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase text-black/25 mr-3">Filtrar</span>

          {TYPOLOGIES.map((t) => (
            <Link
              key={t}
              href={t === 'Todos' ? '/projetos' : `/projetos?tipologia=${t}${arquiteta ? `&arquiteta=${arquiteta}` : ''}`}
              className={`px-5 py-1.5 font-sans text-[9px] font-light tracking-[0.25em] uppercase border transition-all duration-200 cursor-pointer ${
                activeTypology === t
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'border-stone-200 text-black/40 hover:border-black/40 hover:text-black'
              }`}
            >
              {t}
            </Link>
          ))}

          {architects && architects.length > 0 && (
            <>
              <span className="font-sans text-[9px] tracking-[0.4em] uppercase text-black/20 ml-4 mr-2">Arquiteta</span>
              {architects.map((a) => (
                <Link
                  key={a.id}
                  href={`/projetos?${tipologia && tipologia !== 'Todos' ? `tipologia=${tipologia}&` : ''}arquiteta=${arquiteta === a.id ? '' : a.id}`}
                  className={`px-5 py-1.5 font-sans text-[9px] font-light tracking-[0.25em] uppercase border transition-all duration-200 cursor-pointer ${
                    arquiteta === a.id
                      ? 'bg-wine text-white border-wine'
                      : 'border-stone-200 text-black/40 hover:border-wine/60 hover:text-wine'
                  }`}
                >
                  {a.name.split(' ')[0]}
                </Link>
              ))}
            </>
          )}
        </div>
      </section>

      {/* Grid de projetos */}
      <section className="py-16 px-6 lg:px-14 bg-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          {!projects || projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-36 text-center">
              <p className="font-serif text-4xl text-black/20 mb-4">Nenhum projeto encontrado</p>
              <p className="font-sans text-[12px] font-light text-black/30 mb-8">Tente remover os filtros para ver todos os projetos.</p>
              <Link
                href="/projetos"
                className="font-sans text-[10px] font-light tracking-[0.3em] uppercase border-b border-black/20 pb-px hover:border-gold hover:text-gold cursor-pointer transition-colors"
              >
                Ver todos os projetos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-100">
              {projects.map((project) => {
                return (
                <Link
                  key={project.id}
                  href={`/projetos/${encodeURIComponent(project.slug || slugify(project.title))}`}
                  className="group relative overflow-hidden bg-white cursor-pointer"
                >
                  {/* Imagem */}
                  <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                    {project.cover_url ? (
                      <Image
                        src={project.cover_url}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                        <span className="font-serif text-7xl text-stone-300">{project.title.charAt(0)}</span>
                      </div>
                    )}

                    {/* Overlay com info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                      <p className="font-sans text-[9px] text-gold tracking-[0.4em] uppercase mb-2">{project.typology}</p>
                      <p className="font-serif text-white text-lg">{project.title}</p>
                    </div>

                    {/* Arrow */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight size={13} strokeWidth={1.5} className="text-black" />
                    </div>
                  </div>

                  {/* Info abaixo */}
                  <div className="p-6 bg-[#171717] border-t border-white/10">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-sans text-[8px] font-light tracking-[0.4em] uppercase text-gold">{project.typology}</p>
                      <p className="font-sans text-[10px] font-light text-white/45 shrink-0">{project.year}</p>
                    </div>
                    <h2 className="font-serif text-lg text-white group-hover:text-gold transition-colors">
                      {project.title}
                    </h2>
                    <div className="flex items-center justify-between mt-2">
                      {project.architectsLabel && (
                        <p className="font-sans text-[11px] font-light text-white/65">{project.architectsLabel}</p>
                      )}
                      {project.location && (
                        <p className="font-sans text-[10px] font-light text-white/45">{project.location}</p>
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
