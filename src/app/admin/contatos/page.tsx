import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminContatosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-moss md:min-h-screen shrink-0">
        <div className="p-6 border-b border-cream/10">
          <Link href="/admin" className="font-serif text-xl text-cream">Claraboia</Link>
        </div>
        <nav className="py-3 md:py-6 flex md:block overflow-x-auto md:overflow-visible border-t border-cream/10 md:border-t-0">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/projetos', label: 'Projetos' },
            { href: '/admin/arquitetas', label: 'Arquitetas' },
            { href: '/admin/contatos', label: 'Contatos', active: true },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`block whitespace-nowrap px-4 md:px-6 py-3 text-sm ${item.active ? 'bg-gold/20 text-gold' : 'text-cream/60 hover:text-cream'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h2 className="font-serif text-3xl text-moss">Mensagens de contato</h2>
          <span className="text-sm text-moss/40">{contacts?.length || 0} mensagens</span>
        </div>

        <div className="flex flex-col gap-4">
          {contacts?.map((c) => (
            <div key={c.id} className="bg-white border border-moss/10 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-medium text-moss">{c.name}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-1">
                    <a href={`mailto:${c.email}`} className="text-sm text-wine hover:underline">{c.email}</a>
                    {c.phone && <a href={`tel:${c.phone}`} className="text-sm text-moss/50 hover:text-wine">{c.phone}</a>}
                  </div>
                </div>
                <p className="text-xs text-moss/30">
                  {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <p className="text-sm text-moss/70 leading-relaxed">{c.message}</p>
              <div className="flex gap-3 mt-4">
                <a href={`mailto:${c.email}`} className="px-4 py-2 text-xs bg-wine/10 text-wine hover:bg-wine/20 transition-colors uppercase tracking-wider">
                  Responder por email
                </a>
              </div>
            </div>
          ))}

          {!contacts?.length && (
            <div className="text-center py-16">
              <p className="text-moss/40">Nenhuma mensagem recebida ainda.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
