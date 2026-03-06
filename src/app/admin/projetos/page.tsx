import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Plus, Pencil, Star } from 'lucide-react'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

export default async function AdminProjetosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [{ data: projects }, { data: architects }] = await Promise.all([
    supabase.from('projects')
      .select('id, title, slug, typology, year, featured, architect_id')
      .order('created_at', { ascending: false }),
    supabase.from('architects').select('id, name'),
  ])

  const architectById = new Map((architects || []).map((a) => [a.id as string, a.name as string]))

  const projectIds = (projects || []).map((p) => p.id as string)
  const { data: links } = projectIds.length
    ? await supabase
      .from('project_architects')
      .select('project_id, architect_id')
      .in('project_id', projectIds)
    : { data: null }
  const linkedNamesByProject = (links || []).reduce<Record<string, string[]>>((acc, link) => {
    const projectId = link.project_id as string
    const architectName = architectById.get(link.architect_id as string)
    if (!architectName) return acc
    if (!acc[projectId]) acc[projectId] = []
    if (!acc[projectId].includes(architectName)) acc[projectId].push(architectName)
    return acc
  }, {})

  const normalizedProjects = (projects || []).map((project) => {
    const linkedNames = linkedNamesByProject[project.id as string] || []
    const fallbackName = project.architect_id ? architectById.get(project.architect_id as string) : null
    return {
      ...project,
      architectsLabel: linkedNames.length ? linkedNames.join(', ') : (fallbackName || '—'),
    }
  })

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar simples */}
      <aside className="w-full md:w-64 bg-moss md:min-h-screen shrink-0">
        <div className="p-6 border-b border-cream/10">
          <Link href="/admin" className="font-serif text-xl text-cream">Claraboia</Link>
        </div>
        <nav className="py-3 md:py-6 flex md:block overflow-x-auto md:overflow-visible border-t border-cream/10 md:border-t-0">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/projetos', label: 'Projetos', active: true },
            { href: '/admin/arquitetas', label: 'Arquitetas' },
            { href: '/admin/contatos', label: 'Contatos' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block whitespace-nowrap px-4 md:px-6 py-3 text-sm ${item.active ? 'bg-gold/20 text-gold' : 'text-cream/60 hover:text-cream'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h2 className="font-serif text-3xl text-moss">Projetos</h2>
          <Link
            href="/admin/projetos/novo"
            className="flex items-center gap-2 px-5 py-2.5 bg-wine text-cream text-sm uppercase tracking-wider hover:bg-rose transition-colors"
          >
            <Plus size={16} />
            Novo projeto
          </Link>
        </div>

        <div className="bg-white border border-moss/10 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-moss/5 border-b border-moss/10">
              <tr>
                {['Título', 'Tipologia', 'Ano', 'Arquiteta', 'Destaque', 'Ações'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-moss/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {normalizedProjects?.map((p) => {
                return (
                <tr key={p.id} className="border-b border-moss/5 hover:bg-cream/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-moss">{p.title}</td>
                  <td className="px-4 py-3 text-xs text-moss/50">{p.typology}</td>
                  <td className="px-4 py-3 text-xs text-moss/50">{p.year}</td>
                  <td className="px-4 py-3 text-xs text-moss/50">{p.architectsLabel}</td>
                  <td className="px-4 py-3">
                    {p.featured && <Star size={14} className="text-gold" fill="currentColor" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/projetos/${p.id}`} className="text-moss/40 hover:text-wine transition-colors"><Pencil size={14} /></Link>
                      <Link href={`/projetos/${encodeURIComponent((p.slug as string) || slugify(p.title as string))}`} target="_blank" className="text-moss/30 hover:text-gold transition-colors text-xs">↗</Link>
                    </div>
                  </td>
                </tr>
              )})}
              {!normalizedProjects?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-moss/40">
                    Nenhum projeto ainda.{' '}
                    <Link href="/admin/projetos/novo" className="text-wine underline">Criar o primeiro</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </main>
    </div>
  )
}
