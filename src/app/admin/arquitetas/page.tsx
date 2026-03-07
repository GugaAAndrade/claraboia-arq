import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Architect } from '@/types'
import { Plus, Pencil } from 'lucide-react'
import { BrandLogo } from '@/components/shared/BrandLogo'

export default async function AdminArquitetasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: architects } = await supabase.from('architects').select('*').order('name')
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-moss md:min-h-screen shrink-0">
        <div className="p-6 border-b border-cream/10">
          <BrandLogo href="/admin" variant="light" imageClassName="w-[150px]" />
        </div>
        <nav className="py-3 md:py-6 flex md:block overflow-x-auto md:overflow-visible border-t border-cream/10 md:border-t-0">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/projetos', label: 'Projetos' },
            { href: '/admin/arquitetas', label: 'Arquitetas', active: true },
            { href: '/admin/contatos', label: 'Contatos' },
            { href: '/admin/configuracoes', label: 'Configurações' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`block whitespace-nowrap px-4 md:px-6 py-3 text-sm ${item.active ? 'bg-gold/20 text-gold' : 'text-cream/60 hover:text-cream'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 md:px-6 py-4 border-t border-cream/10">
          <Link href="/" target="_blank" className="text-xs text-cream/60 hover:text-gold tracking-wider uppercase">
            Ver site público ↗
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h2 className="font-serif text-3xl text-moss">Arquitetas</h2>
          <Link href="/admin/arquitetas/nova" className="flex items-center gap-2 px-5 py-2.5 bg-wine text-cream text-sm uppercase tracking-wider hover:bg-rose transition-colors">
            <Plus size={16} /> Nova arquiteta
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(architects as Architect[])?.map((arch) => (
            <div key={arch.id} className="bg-white border border-moss/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-wine/10 border border-wine/20 flex items-center justify-center font-serif text-wine text-2xl">
                  {arch.name.charAt(0)}
                </div>
                <Link href={`/admin/arquitetas/${arch.id}`} className="text-moss/30 hover:text-wine transition-colors">
                  <Pencil size={14} />
                </Link>
              </div>
              <h3 className="font-serif text-lg text-moss">{arch.name}</h3>
              {arch.specialty && <p className="text-xs text-gold mt-1">{arch.specialty}</p>}
              {arch.bio && <p className="text-xs text-moss/50 mt-3 line-clamp-3">{arch.bio}</p>}
            </div>
          ))}

          {!architects?.length && (
            <div className="col-span-3 text-center py-16">
              <p className="text-moss/40 mb-4">Nenhuma arquiteta cadastrada.</p>
              <Link href="/admin/arquitetas/nova" className="text-wine underline text-sm">Cadastrar a primeira</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
