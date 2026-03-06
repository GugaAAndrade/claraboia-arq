'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { ImageUpload } from '@/components/ui/ImageUpload'

interface FormData {
  name: string
  specialty: string
  bio: string
  photo_url: string
  instagram: string
}

export default function ArquitetaFormPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'nova'
  const supabase = createClient()

  const [form, setForm] = useState<FormData>({ name: '', specialty: '', bio: '', photo_url: '', instagram: '' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) {
      setLoading(true)
      supabase.from('architects').select('*').eq('id', params.id).single().then(({ data }) => {
        if (data) setForm({
          name: data.name || '',
          specialty: data.specialty || '',
          bio: data.bio || '',
          photo_url: data.photo_url || '',
          instagram: data.instagram || '',
        })
        setLoading(false)
      })
    }
  }, [params.id])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const { error: err } = isNew
      ? await supabase.from('architects').insert([form])
      : await supabase.from('architects').update(form).eq('id', params.id)
    if (err) { setError(err.message); setSaving(false) }
    else router.push('/admin/arquitetas')
  }

  const handleDelete = async () => {
    if (!confirm('Excluir esta arquiteta?')) return
    await supabase.from('architects').delete().eq('id', params.id)
    router.push('/admin/arquitetas')
  }

  if (loading) return <div className="p-8 text-moss/40">Carregando...</div>

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
            { href: '/admin/arquitetas', label: 'Arquitetas', active: true },
            { href: '/admin/contatos', label: 'Contatos' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`block whitespace-nowrap px-4 md:px-6 py-3 text-sm ${item.active ? 'bg-gold/20 text-gold' : 'text-cream/60 hover:text-cream'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/arquitetas" className="text-moss/40 hover:text-moss"><ArrowLeft size={20} /></Link>
          <h2 className="font-serif text-3xl text-moss">{isNew ? 'Nova arquiteta' : 'Editar arquiteta'}</h2>
        </div>

        <div className="max-w-xl">
          <div className="grid grid-cols-1 gap-5">
            {/* Foto */}
            <ImageUpload
              label="Foto da arquiteta"
              value={form.photo_url}
              onChange={(url) => setForm((f) => ({ ...f, photo_url: url }))}
              bucket="images"
              folder="arquitetas"
              aspect="3/4"
            />

            {[
              { label: 'Nome *', field: 'name', placeholder: 'Nome completo' },
              { label: 'Especialidade', field: 'specialty', placeholder: 'Ex: Design de Interiores' },
              { label: 'Instagram', field: 'instagram', placeholder: '@usuario' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">{label}</label>
                <input type="text" value={form[field as keyof FormData]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                  placeholder={placeholder} />
              </div>
            ))}

            <div>
              <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Bio</label>
              <textarea rows={5} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine resize-none"
                placeholder="Escreva sobre a arquiteta, sua trajetória e paixões..." />
            </div>

            {error && <p className="text-rose text-sm">{error}</p>}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-moss/10">
              {!isNew && (
                <button onClick={handleDelete} className="flex items-center gap-2 text-sm text-rose/70 hover:text-rose">
                  <Trash2 size={14} /> Excluir
                </button>
              )}
              <div className="flex gap-3 ml-0 sm:ml-auto">
                <Link href="/admin/arquitetas" className="px-5 py-2.5 border border-moss/20 text-moss text-sm hover:bg-moss/5">Cancelar</Link>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-wine text-cream text-sm hover:bg-rose disabled:opacity-60">
                  <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
