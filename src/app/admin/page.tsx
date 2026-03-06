import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LayoutGrid, Users, Mail, LogOut, Plus } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [
    { count: projectsCount },
    { count: architectsCount },
    { count: contactsCount },
    { data: recentContacts },
    { data: recentProjects },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('architects').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('projects').select('id, title, typology, year, featured').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-moss min-h-screen flex flex-col">
        <div className="p-6 border-b border-cream/10">
          <h1 className="font-serif text-xl text-cream">Claraboia</h1>
          <p className="text-cream/40 text-xs mt-1">Painel administrativo</p>
        </div>

        <nav className="flex-1 py-6">
          {[
            { href: '/admin', icon: LayoutGrid, label: 'Dashboard', active: true },
            { href: '/admin/projetos', icon: LayoutGrid, label: 'Projetos' },
            { href: '/admin/arquitetas', icon: Users, label: 'Arquitetas' },
            { href: '/admin/contatos', icon: Mail, label: 'Contatos' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                item.active ? 'bg-gold/20 text-gold' : 'text-cream/60 hover:text-cream hover:bg-white/5'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-cream/10">
          <p className="text-cream/40 text-xs mb-3 truncate">{user.email}</p>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-cream/60 hover:text-rose transition-colors"
            >
              <LogOut size={14} />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h2 className="font-serif text-3xl text-moss mb-8">Bom dia! 👋</h2>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Projetos', count: projectsCount || 0, icon: LayoutGrid, href: '/admin/projetos', color: 'bg-wine' },
            { label: 'Arquitetas', count: architectsCount || 0, icon: Users, href: '/admin/arquitetas', color: 'bg-gold' },
            { label: 'Contatos', count: contactsCount || 0, icon: Mail, href: '/admin/contatos', color: 'bg-moss' },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="bg-white p-6 border border-moss/10 hover:border-wine/30 transition-colors group">
              <div className={`w-10 h-10 ${s.color} flex items-center justify-center text-cream mb-4`}>
                <s.icon size={18} />
              </div>
              <p className="text-3xl font-serif text-moss">{s.count}</p>
              <p className="text-sm text-moss/50 mt-1">{s.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projetos recentes */}
          <div className="bg-white border border-moss/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-moss">Projetos recentes</h3>
              <Link href="/admin/projetos/novo" className="flex items-center gap-1 text-xs text-wine hover:text-rose uppercase tracking-wider">
                <Plus size={12} /> Novo
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentProjects?.map((p) => (
                <Link key={p.id} href={`/admin/projetos/${p.id}`} className="flex items-center justify-between py-2 border-b border-moss/5 hover:border-gold/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-moss">{p.title}</p>
                    <p className="text-xs text-moss/40">{p.typology} · {p.year}</p>
                  </div>
                  {p.featured && (
                    <span className="text-xs bg-gold/20 text-gold px-2 py-0.5">Destaque</span>
                  )}
                </Link>
              ))}
              {!recentProjects?.length && (
                <p className="text-sm text-moss/40">Nenhum projeto ainda.</p>
              )}
            </div>
          </div>

          {/* Contatos recentes */}
          <div className="bg-white border border-moss/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-moss">Mensagens recentes</h3>
              <Link href="/admin/contatos" className="text-xs text-wine hover:text-rose uppercase tracking-wider">Ver todos</Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentContacts?.map((c) => (
                <div key={c.id} className="py-2 border-b border-moss/5">
                  <p className="text-sm font-medium text-moss">{c.name}</p>
                  <p className="text-xs text-moss/40">{c.email}</p>
                  <p className="text-xs text-moss/60 mt-1 line-clamp-1">{c.message}</p>
                </div>
              ))}
              {!recentContacts?.length && (
                <p className="text-sm text-moss/40">Nenhuma mensagem ainda.</p>
              )}
            </div>
          </div>
        </div>

        {/* Link rápido site */}
        <div className="mt-8 text-right">
          <Link href="/" target="_blank" className="text-xs text-moss/40 hover:text-wine tracking-wider uppercase underline underline-offset-4">
            Ver site público ↗
          </Link>
        </div>
      </main>
    </div>
  )
}
