import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Architect } from '@/types'
import { Plus, Pencil } from 'lucide-react'
import { AboutTeamPhotoSettings } from '@/components/admin/AboutTeamPhotoSettings'

export default async function AdminArquitetasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: architects } = await supabase.from('architects').select('*').order('name')
  const { data: aboutTeamPhoto } = await supabase
    .from('site_settings')
    .select('value_text')
    .eq('key', 'about_team_photo_url')
    .maybeSingle()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-moss min-h-screen">
        <div className="p-6 border-b border-cream/10">
          <Link href="/admin" className="font-serif text-xl text-cream">Claraboia</Link>
        </div>
        <nav className="py-6">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/projetos', label: 'Projetos' },
            { href: '/admin/arquitetas', label: 'Arquitetas', active: true },
            { href: '/admin/contatos', label: 'Contatos' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`block px-6 py-3 text-sm ${item.active ? 'bg-gold/20 text-gold' : 'text-cream/60 hover:text-cream'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl text-moss">Arquitetas</h2>
          <Link href="/admin/arquitetas/nova" className="flex items-center gap-2 px-5 py-2.5 bg-wine text-cream text-sm uppercase tracking-wider hover:bg-rose transition-colors">
            <Plus size={16} /> Nova arquiteta
          </Link>
        </div>

        <AboutTeamPhotoSettings initialUrl={aboutTeamPhoto?.value_text || ''} />

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
