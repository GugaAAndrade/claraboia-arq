'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { ImageUpload } from '@/components/ui/ImageUpload'

const TYPOLOGIES = ['Residencial', 'Comercial', 'Interiores', 'Urbanismo', 'Outros']
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

interface FormData {
  title: string
  slug: string
  description: string
  gallery_images: string[]
  floor_plans: string[]
  typology: string
  year: string
  location: string
  client_name: string
  area_m2: string
  project_scope: string
  project_status: string
  materials: string
  team_notes: string
  map_embed_url: string
  architect_ids: string[]
  cover_url: string
  featured: boolean
}

export default function ProjetoFormPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'novo'
  const supabase = createClient()

  const [form, setForm] = useState<FormData>({
    title: '', slug: '', description: '', gallery_images: [], floor_plans: [], typology: '', year: new Date().getFullYear().toString(),
    location: '', client_name: '', area_m2: '', project_scope: '', project_status: '', materials: '', team_notes: '', map_embed_url: '',
    architect_ids: [], cover_url: '', featured: false,
  })
  const [architects, setArchitects] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const [{ data: archs }, { data: proj }] = await Promise.all([
        supabase.from('architects').select('id, name').order('name'),
        !isNew ? supabase.from('projects').select('*').eq('id', params.id).single() : Promise.resolve({ data: null }),
      ])
      const { data: links } = !isNew
        ? await supabase.from('project_architects').select('architect_id').eq('project_id', params.id)
        : { data: [] as { architect_id: string }[] }
      if (archs) setArchitects(archs)
      if (proj) setForm({
        title: proj.title || '',
        slug: proj.slug || '',
        description: proj.description || '',
        gallery_images: Array.isArray(proj.images) ? proj.images : [],
        floor_plans: Array.isArray(proj.floor_plans) ? proj.floor_plans : [],
        typology: proj.typology || '',
        year: String(proj.year || new Date().getFullYear()),
        location: proj.location || '',
        client_name: proj.client_name || '',
        area_m2: proj.area_m2 ? String(proj.area_m2) : '',
        project_scope: proj.project_scope || '',
        project_status: proj.project_status || '',
        materials: proj.materials || '',
        team_notes: proj.team_notes || '',
        map_embed_url: proj.map_embed_url || '',
        architect_ids: links?.length
          ? links.map((link) => link.architect_id)
          : (proj.architect_id ? [proj.architect_id] : []),
        cover_url: proj.cover_url || '',
        featured: proj.featured || false,
      })
      setLoading(false)
    }
    init()
  }, [params.id])

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: isNew ? slugify(title) : f.slug }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const galleryImages = Array.from(
      new Set(
        form.gallery_images
          .map((url) => url.trim())
          .filter((url) => url.length > 0)
      )
    )
    const floorPlans = Array.from(
      new Set(
        form.floor_plans
          .map((url) => url.trim())
          .filter((url) => url.length > 0)
      )
    )

    const payload = {
      title: form.title,
      slug: form.slug?.trim() ? slugify(form.slug) : slugify(form.title),
      description: form.description,
      typology: form.typology || null,
      location: form.location || null,
      client_name: form.client_name || null,
      area_m2: form.area_m2 ? Number(form.area_m2.replace(',', '.')) : null,
      project_scope: form.project_scope || null,
      project_status: form.project_status || null,
      materials: form.materials || null,
      team_notes: form.team_notes || null,
      map_embed_url: form.map_embed_url || null,
      cover_url: form.cover_url || null,
      featured: form.featured,
      images: galleryImages,
      floor_plans: floorPlans,
      year: parseInt(form.year) || null,
      architect_id: form.architect_ids[0] || null,
    }

    let projectId = String(params.id)
    const { data: createdProject, error: err } = isNew
      ? await supabase.from('projects').insert([payload]).select('id').single()
      : await supabase.from('projects').update(payload).eq('id', params.id).select('id').single()
    if (isNew && createdProject?.id) projectId = createdProject.id

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    const { error: deleteLinksError } = await supabase
      .from('project_architects')
      .delete()
      .eq('project_id', projectId)

    if (deleteLinksError) {
      setError('Projeto salvo, mas o vínculo de múltiplas arquitetas falhou. Execute o SQL de setup de relação no Supabase e salve novamente.')
      setSaving(false)
      return
    }

    if (form.architect_ids.length > 0) {
      const { error: insertLinksError } = await supabase.from('project_architects').insert(
        form.architect_ids.map((architectId) => ({
          project_id: projectId,
          architect_id: architectId,
        }))
      )

      if (insertLinksError) {
        setError('Projeto salvo, mas não foi possível salvar todas as arquitetas selecionadas. Verifique a tabela project_architects no Supabase.')
        setSaving(false)
        return
      }
    }

    router.push('/admin/projetos')
  }

  const handleDelete = async () => {
    if (!confirm('Excluir este projeto? Esta ação não pode ser desfeita.')) return
    await supabase.from('projects').delete().eq('id', params.id)
    router.push('/admin/projetos')
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
            { href: '/admin/projetos', label: 'Projetos', active: true },
            { href: '/admin/arquitetas', label: 'Arquitetas' },
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
          <Link href="/admin/projetos" className="text-moss/40 hover:text-moss"><ArrowLeft size={20} /></Link>
          <h2 className="font-serif text-3xl text-moss">{isNew ? 'Novo projeto' : 'Editar projeto'}</h2>
        </div>

        <div className="max-w-4xl">
          <div className="grid grid-cols-1 gap-5">
            {/* Título + Slug */}
            <div>
              <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Título *</label>
              <input type="text" required value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Slug (URL)</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine font-mono text-sm" />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Descrição</label>
              <textarea rows={8} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine resize-none" />
              <p className="mt-2 text-xs text-moss/45">
                Use parágrafos separados por linha em branco para criar uma narrativa mais detalhada na página pública.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs tracking-widest uppercase text-moss/50">Galeria do projeto</label>
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, gallery_images: [...current.gallery_images, ''] }))}
                  className="inline-flex items-center gap-1 text-xs text-wine hover:text-rose"
                >
                  <Plus size={12} /> Adicionar imagem
                </button>
              </div>

              {form.gallery_images.length === 0 ? (
                <div className="border border-dashed border-moss/20 p-5 text-sm text-moss/50">
                  Nenhuma imagem na galeria. Clique em "Adicionar imagem" para enviar.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.gallery_images.map((url, index) => (
                    <div key={`${index}-${url.slice(0, 12)}`} className="space-y-2">
                      <ImageUpload
                        label={`Imagem ${index + 1}`}
                        value={url}
                        onChange={(newUrl) => {
                          setForm((current) => {
                            const next = [...current.gallery_images]
                            next[index] = newUrl
                            return { ...current, gallery_images: next }
                          })
                        }}
                        bucket="images"
                        folder="projetos"
                        aspect={index === 0 ? '16/9' : '4/3'}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            gallery_images: current.gallery_images.filter((_, i) => i !== index),
                          }))
                        }}
                        className="text-xs text-rose/80 hover:text-rose"
                      >
                        Remover imagem
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-moss/45">
                As imagens enviadas aparecem automaticamente na galeria detalhada do projeto.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs tracking-widest uppercase text-moss/50">Plantas do projeto</label>
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, floor_plans: [...current.floor_plans, ''] }))}
                  className="inline-flex items-center gap-1 text-xs text-wine hover:text-rose"
                >
                  <Plus size={12} /> Adicionar planta
                </button>
              </div>

              {form.floor_plans.length === 0 ? (
                <div className="border border-dashed border-moss/20 p-5 text-sm text-moss/50">
                  Nenhuma planta adicionada ainda.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.floor_plans.map((url, index) => (
                    <div key={`${index}-${url.slice(0, 12)}`} className="space-y-2">
                      <ImageUpload
                        label={`Planta ${index + 1}`}
                        value={url}
                        onChange={(newUrl) => {
                          setForm((current) => {
                            const next = [...current.floor_plans]
                            next[index] = newUrl
                            return { ...current, floor_plans: next }
                          })
                        }}
                        bucket="images"
                        folder="projetos/plantas"
                        aspect="4/3"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            floor_plans: current.floor_plans.filter((_, i) => i !== index),
                          }))
                        }}
                        className="text-xs text-rose/80 hover:text-rose"
                      >
                        Remover planta
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tipologia + Ano */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Tipologia</label>
                <select value={form.typology} onChange={(e) => setForm({ ...form, typology: e.target.value })}
                  className="w-full border border-moss/20 px-4 py-3 text-moss bg-white focus:outline-none focus:border-wine">
                  <option value="">Selecionar</option>
                  {TYPOLOGIES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Ano</label>
                <input type="number" min="1900" max="2100" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine" />
              </div>
            </div>

            {/* Localização + Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Localização</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine" placeholder="Aracaju, Sergipe" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Cliente</label>
                <input type="text" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine" placeholder="Residencial Duarte" />
              </div>
            </div>

            {/* Ficha técnica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Área (m²)</label>
                <input type="text" value={form.area_m2} onChange={(e) => setForm({ ...form, area_m2: e.target.value })}
                  className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine" placeholder="125.5" />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Status da obra</label>
                <input type="text" value={form.project_status} onChange={(e) => setForm({ ...form, project_status: e.target.value })}
                  className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine" placeholder="Concluído" />
              </div>
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Escopo</label>
              <input type="text" value={form.project_scope} onChange={(e) => setForm({ ...form, project_scope: e.target.value })}
                className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine" placeholder="Reforma completa de interiores" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Materiais principais</label>
              <textarea rows={3} value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })}
                className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine resize-none"
                placeholder="Madeira natural, pedra, serralheria..." />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Equipe e parceiros</label>
              <textarea rows={3} value={form.team_notes} onChange={(e) => setForm({ ...form, team_notes: e.target.value })}
                className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine resize-none"
                placeholder="Marcenaria X, iluminação Y..." />
            </div>

            {/* Mapa */}
            <div>
              <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Mapa (URL embed)</label>
              <input
                type="text"
                value={form.map_embed_url}
                onChange={(e) => setForm({ ...form, map_embed_url: e.target.value })}
                className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="mt-2 text-xs text-moss/45">
                Use o link de incorporação (embed) do Google Maps.
              </p>
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-moss/50 mb-3">Arquitetas do projeto</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-moss/20 p-4">
                {architects.map((a) => (
                  <label key={a.id} className="flex items-center gap-3 text-sm text-moss cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.architect_ids.includes(a.id)}
                      onChange={(e) => {
                        const nextIds = e.target.checked
                          ? [...form.architect_ids, a.id]
                          : form.architect_ids.filter((id) => id !== a.id)
                        setForm({ ...form, architect_ids: nextIds })
                      }}
                      className="w-4 h-4 accent-wine"
                    />
                    <span>{a.name}</span>
                  </label>
                ))}
                {!architects.length && (
                  <p className="text-xs text-moss/45">Cadastre arquitetas antes de vincular ao projeto.</p>
                )}
              </div>
              <p className="mt-2 text-xs text-moss/45">
                Você pode selecionar quantas arquitetas quiser.
              </p>
            </div>

            {/* Cover Upload */}
            <ImageUpload
              label="Imagem de capa"
              value={form.cover_url}
              onChange={(url) => setForm((f) => ({ ...f, cover_url: url }))}
              bucket="images"
              folder="projetos"
              aspect="16/9"
            />

            {/* Destaque */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 accent-wine" />
              <span className="text-sm text-moss">Exibir na página inicial (destaque)</span>
            </label>

            {error && <p className="text-rose text-sm">{error}</p>}

            {/* Ações */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-moss/10">
              {!isNew && (
                <button onClick={handleDelete} className="flex items-center gap-2 text-sm text-rose/70 hover:text-rose transition-colors">
                  <Trash2 size={14} /> Excluir
                </button>
              )}
              <div className="flex gap-3 ml-0 sm:ml-auto">
                <Link href="/admin/projetos" className="px-5 py-2.5 border border-moss/20 text-moss text-sm hover:bg-moss/5 transition-colors">
                  Cancelar
                </Link>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-wine text-cream text-sm hover:bg-rose transition-colors disabled:opacity-60">
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
