'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { BrandLogo } from '@/components/shared/BrandLogo'

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

interface ProjectGallerySection {
  name: string
  text: string
  images: string[]
}

interface ProjectDetailField {
  label: string
  value: string
}

interface ProjectActionButton {
  label: string
  url: string
}

interface ProjectContentSettings {
  custom_typology: string
  details_title: string
  technical_title: string
  logo_url: string
  explanation_title: string
  explanation_text: string
  sustainability_title: string
  sustainability_text: string
  detail_fields: ProjectDetailField[]
  technical_fields: ProjectDetailField[]
  action_buttons: ProjectActionButton[]
  gallery_sections: ProjectGallerySection[]
}

const defaultContentSettings: ProjectContentSettings = {
  custom_typology: '',
  details_title: 'Detalhes',
  technical_title: 'Ficha técnica',
  logo_url: '',
  explanation_title: 'Explicação do projeto',
  explanation_text: '',
  sustainability_title: 'Sustentabilidade',
  sustainability_text: '',
  detail_fields: [],
  technical_fields: [],
  action_buttons: [],
  gallery_sections: [],
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
  const [contentSettings, setContentSettings] = useState<ProjectContentSettings>(defaultContentSettings)

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

      if (proj?.id) {
        const { data: contentSettingRow } = await supabase
          .from('site_settings')
          .select('value_text')
          .eq('key', `project_content_${proj.id}`)
          .maybeSingle()

        if (contentSettingRow?.value_text) {
          try {
            const parsed = JSON.parse(contentSettingRow.value_text) as Partial<ProjectContentSettings>
            setContentSettings({
              ...defaultContentSettings,
              ...parsed,
              gallery_sections: Array.isArray(parsed.gallery_sections)
                ? parsed.gallery_sections.map((section) => ({
                  name: section?.name || '',
                  text: section?.text || '',
                  images: Array.isArray(section?.images) ? section.images : [],
                }))
                : [],
              detail_fields: Array.isArray(parsed.detail_fields)
                ? parsed.detail_fields.map((field) => ({
                  label: field?.label || '',
                  value: field?.value || '',
                }))
                : [],
              technical_fields: Array.isArray(parsed.technical_fields)
                ? parsed.technical_fields.map((field) => ({
                  label: field?.label || '',
                  value: field?.value || '',
                }))
                : [],
              action_buttons: Array.isArray(parsed.action_buttons)
                ? parsed.action_buttons.map((button) => ({
                  label: button?.label || '',
                  url: button?.url || '',
                }))
                : [],
            })
          } catch {
            setContentSettings(defaultContentSettings)
          }
        }
      }

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
      typology: null,
      location: form.location || null,
      client_name: null,
      area_m2: form.area_m2 ? Number(form.area_m2.replace(',', '.')) : null,
      project_scope: form.project_scope || null,
      project_status: form.project_status || null,
      materials: null,
      team_notes: null,
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

    const sanitizedSections = contentSettings.gallery_sections
      .map((section) => ({
        name: section.name.trim(),
        text: section.text.trim(),
        images: section.images.map((url) => url.trim()).filter(Boolean),
      }))
      .filter((section) => section.name || section.text || section.images.length > 0)

    const settingsPayload: ProjectContentSettings = {
      custom_typology: (contentSettings.custom_typology || '').trim(),
      details_title: (contentSettings.details_title || '').trim() || 'Detalhes',
      technical_title: (contentSettings.technical_title || '').trim() || 'Ficha técnica',
      logo_url: (contentSettings.logo_url || '').trim(),
      explanation_title: (contentSettings.explanation_title || '').trim() || 'Explicação do projeto',
      explanation_text: (contentSettings.explanation_text || '').trim(),
      sustainability_title: (contentSettings.sustainability_title || '').trim() || 'Sustentabilidade',
      sustainability_text: (contentSettings.sustainability_text || '').trim(),
      detail_fields: contentSettings.detail_fields
        .map((field) => ({ label: field.label.trim(), value: field.value.trim() }))
        .filter((field) => field.label && field.value),
      technical_fields: contentSettings.technical_fields
        .map((field) => ({ label: field.label.trim(), value: field.value.trim() }))
        .filter((field) => field.label && field.value),
      action_buttons: contentSettings.action_buttons
        .map((button) => ({ label: button.label.trim(), url: button.url.trim() }))
        .filter((button) => button.label && button.url),
      gallery_sections: sanitizedSections,
    }

    const { error: settingsSaveError } = await supabase
      .from('site_settings')
      .upsert(
        { key: `project_content_${projectId}`, value_text: JSON.stringify(settingsPayload) },
        { onConflict: 'key' }
      )

    if (settingsSaveError) {
      const normalized = settingsSaveError.message.toLowerCase()
      if (
        settingsSaveError.code === 'PGRST205' ||
        normalized.includes("could not find the table 'public.site_settings'")
      ) {
        setError('Projeto salvo, mas não foi possível salvar as seções personalizadas. Crie a tabela site_settings no Supabase.')
      } else {
        setError(`Projeto salvo, mas falhou ao salvar seções personalizadas: ${settingsSaveError.message}`)
      }
      setSaving(false)
      return
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
          <BrandLogo href="/admin" variant="light" imageClassName="w-[150px]" />
        </div>
        <nav className="py-3 md:py-6 flex md:block overflow-x-auto md:overflow-visible border-t border-cream/10 md:border-t-0">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/projetos', label: 'Projetos', active: true },
            { href: '/admin/arquitetas', label: 'Arquitetas' },
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

            <div className="border border-moss/15 p-5 bg-[#FFFCF5] space-y-5">
              <div>
                <p className="text-xs tracking-widest uppercase text-moss/50 mb-1">Conteúdo avançado da página</p>
                <p className="text-xs text-moss/55">
                  Configure identidade visual e crie seções personalizadas com título, texto e imagens para este projeto.
                </p>
              </div>

              <div className="max-w-[260px]">
                <ImageUpload
                  label="Logomarca do projeto"
                  value={contentSettings.logo_url}
                  onChange={(url) => setContentSettings((current) => ({ ...current, logo_url: url }))}
                  bucket="images"
                  folder="projetos/logomarcas"
                  aspect="16/9"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Tipologia (texto livre)</label>
                  <input
                    type="text"
                    value={contentSettings.custom_typology}
                    onChange={(e) => setContentSettings((current) => ({ ...current, custom_typology: e.target.value }))}
                    className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                    placeholder="Hotel boutique, Casa de praia, Retrofit..."
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Título da sidebar</label>
                  <input
                    type="text"
                    value={contentSettings.details_title}
                    onChange={(e) => setContentSettings((current) => ({ ...current, details_title: e.target.value }))}
                    className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                    placeholder="Detalhes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Título da ficha técnica</label>
                <input
                  type="text"
                  value={contentSettings.technical_title}
                  onChange={(e) => setContentSettings((current) => ({ ...current, technical_title: e.target.value }))}
                  className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                  placeholder="Ficha técnica"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Título da explicação</label>
                  <input
                    type="text"
                    value={contentSettings.explanation_title}
                    onChange={(e) => setContentSettings((current) => ({ ...current, explanation_title: e.target.value }))}
                    className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                    placeholder="Explicação do projeto"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Texto da explicação</label>
                <textarea
                  rows={4}
                  value={contentSettings.explanation_text}
                  onChange={(e) => setContentSettings((current) => ({ ...current, explanation_text: e.target.value }))}
                  className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine resize-none"
                  placeholder="Contexto, conceito e solução adotada neste projeto..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Título de sustentabilidade</label>
                  <input
                    type="text"
                    value={contentSettings.sustainability_title}
                    onChange={(e) => setContentSettings((current) => ({ ...current, sustainability_title: e.target.value }))}
                    className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                    placeholder="Sustentabilidade"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Texto de sustentabilidade</label>
                  <textarea
                    rows={3}
                    value={contentSettings.sustainability_text}
                    onChange={(e) => setContentSettings((current) => ({ ...current, sustainability_text: e.target.value }))}
                    className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine resize-none"
                    placeholder="Estratégias passivas, materiais e eficiência do projeto..."
                  />
                </div>
              </div>

              <div className="border-t border-moss/15 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs tracking-widest uppercase text-moss/50">Detalhes da sidebar (label + valor)</label>
                  <button
                    type="button"
                    onClick={() =>
                      setContentSettings((current) => ({
                        ...current,
                        detail_fields: [...current.detail_fields, { label: '', value: '' }],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs text-wine hover:text-rose"
                  >
                    <Plus size={12} /> Adicionar campo
                  </button>
                </div>

                {contentSettings.detail_fields.length === 0 ? (
                  <div className="border border-dashed border-moss/20 p-4 text-sm text-moss/50">
                    Nenhum campo personalizado.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contentSettings.detail_fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) =>
                              setContentSettings((current) => {
                                const next = [...current.detail_fields]
                                next[fieldIndex] = { ...next[fieldIndex], label: e.target.value }
                                return { ...current, detail_fields: next }
                              })
                            }
                            className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                            placeholder="Área do terreno"
                          />
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Valor</label>
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) =>
                              setContentSettings((current) => {
                                const next = [...current.detail_fields]
                                next[fieldIndex] = { ...next[fieldIndex], value: e.target.value }
                                return { ...current, detail_fields: next }
                              })
                            }
                            className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                            placeholder="450 m²"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setContentSettings((current) => ({
                              ...current,
                              detail_fields: current.detail_fields.filter((_, i) => i !== fieldIndex),
                            }))
                          }
                          className="text-xs text-rose/80 hover:text-rose pb-3"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-moss/15 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs tracking-widest uppercase text-moss/50">Ficha técnica (label + valor)</label>
                  <button
                    type="button"
                    onClick={() =>
                      setContentSettings((current) => ({
                        ...current,
                        technical_fields: [...current.technical_fields, { label: '', value: '' }],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs text-wine hover:text-rose"
                  >
                    <Plus size={12} /> Adicionar campo
                  </button>
                </div>

                {contentSettings.technical_fields.length === 0 ? (
                  <div className="border border-dashed border-moss/20 p-4 text-sm text-moss/50">
                    Nenhum campo de ficha técnica.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contentSettings.technical_fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) =>
                              setContentSettings((current) => {
                                const next = [...current.technical_fields]
                                next[fieldIndex] = { ...next[fieldIndex], label: e.target.value }
                                return { ...current, technical_fields: next }
                              })
                            }
                            className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                            placeholder="Status"
                          />
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Valor</label>
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) =>
                              setContentSettings((current) => {
                                const next = [...current.technical_fields]
                                next[fieldIndex] = { ...next[fieldIndex], value: e.target.value }
                                return { ...current, technical_fields: next }
                              })
                            }
                            className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                            placeholder="Concluído"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setContentSettings((current) => ({
                              ...current,
                              technical_fields: current.technical_fields.filter((_, i) => i !== fieldIndex),
                            }))
                          }
                          className="text-xs text-rose/80 hover:text-rose pb-3"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-moss/15 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs tracking-widest uppercase text-moss/50">Botões externos (título + link)</label>
                  <button
                    type="button"
                    onClick={() =>
                      setContentSettings((current) => ({
                        ...current,
                        action_buttons: [...current.action_buttons, { label: '', url: '' }],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs text-wine hover:text-rose"
                  >
                    <Plus size={12} /> Adicionar botão
                  </button>
                </div>

                {contentSettings.action_buttons.length === 0 ? (
                  <div className="border border-dashed border-moss/20 p-4 text-sm text-moss/50">
                    Nenhum botão cadastrado.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contentSettings.action_buttons.map((button, buttonIndex) => (
                      <div key={buttonIndex} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Título do botão</label>
                          <input
                            type="text"
                            value={button.label}
                            onChange={(e) =>
                              setContentSettings((current) => {
                                const next = [...current.action_buttons]
                                next[buttonIndex] = { ...next[buttonIndex], label: e.target.value }
                                return { ...current, action_buttons: next }
                              })
                            }
                            className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                            placeholder="Visitar site"
                          />
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Link</label>
                          <input
                            type="url"
                            value={button.url}
                            onChange={(e) =>
                              setContentSettings((current) => {
                                const next = [...current.action_buttons]
                                next[buttonIndex] = { ...next[buttonIndex], url: e.target.value }
                                return { ...current, action_buttons: next }
                              })
                            }
                            className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                            placeholder="https://..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setContentSettings((current) => ({
                              ...current,
                              action_buttons: current.action_buttons.filter((_, i) => i !== buttonIndex),
                            }))
                          }
                          className="text-xs text-rose/80 hover:text-rose pb-3"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-moss/15 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs tracking-widest uppercase text-moss/50">Seções personalizadas (texto + imagens)</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setContentSettings((current) => ({
                          ...current,
                          gallery_sections: [...current.gallery_sections, { name: '', text: '', images: [] }],
                        }))
                      }
                      className="inline-flex items-center gap-1 text-xs text-wine hover:text-rose"
                    >
                      <Plus size={12} /> Seção livre
                    </button>
                  </div>
                </div>

                {contentSettings.gallery_sections.length === 0 ? (
                  <div className="border border-dashed border-moss/20 p-4 text-sm text-moss/50">
                    Nenhuma seção criada ainda.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {contentSettings.gallery_sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="border border-moss/15 p-4 space-y-4 bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Nome da seção</label>
                            <input
                              type="text"
                              value={section.name}
                              onChange={(e) =>
                                setContentSettings((current) => {
                                  const next = [...current.gallery_sections]
                                  next[sectionIndex] = { ...next[sectionIndex], name: e.target.value }
                                  return { ...current, gallery_sections: next }
                                })
                              }
                              className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine"
                              placeholder="Quartos, Área comum, Fachada..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Texto da seção</label>
                            <textarea
                              rows={3}
                              value={section.text}
                              onChange={(e) =>
                                setContentSettings((current) => {
                                  const next = [...current.gallery_sections]
                                  next[sectionIndex] = { ...next[sectionIndex], text: e.target.value }
                                  return { ...current, gallery_sections: next }
                                })
                              }
                              className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine resize-none"
                              placeholder="Resumo curto desta parte do projeto..."
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs tracking-widest uppercase text-moss/50">Imagens da seção</p>
                          <button
                            type="button"
                            onClick={() =>
                              setContentSettings((current) => {
                                const next = [...current.gallery_sections]
                                next[sectionIndex] = {
                                  ...next[sectionIndex],
                                  images: [...next[sectionIndex].images, ''],
                                }
                                return { ...current, gallery_sections: next }
                              })
                            }
                            className="inline-flex items-center gap-1 text-xs text-wine hover:text-rose"
                          >
                            <Plus size={12} /> Adicionar imagem
                          </button>
                        </div>

                        {section.images.length === 0 ? (
                          <div className="border border-dashed border-moss/20 p-4 text-sm text-moss/50">
                            Sem imagens nesta seção.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.images.map((url, imageIndex) => (
                              <div key={`${sectionIndex}-${imageIndex}`} className="space-y-2">
                                <ImageUpload
                                  label={`Imagem ${imageIndex + 1}`}
                                  value={url}
                                  onChange={(newUrl) =>
                                    setContentSettings((current) => {
                                      const next = [...current.gallery_sections]
                                      const nextImages = [...next[sectionIndex].images]
                                      nextImages[imageIndex] = newUrl
                                      next[sectionIndex] = { ...next[sectionIndex], images: nextImages }
                                      return { ...current, gallery_sections: next }
                                    })
                                  }
                                  bucket="images"
                                  folder="projetos/secoes"
                                  aspect={imageIndex === 0 ? '16/9' : '4/3'}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setContentSettings((current) => {
                                      const next = [...current.gallery_sections]
                                      next[sectionIndex] = {
                                        ...next[sectionIndex],
                                        images: next[sectionIndex].images.filter((_, i) => i !== imageIndex),
                                      }
                                      return { ...current, gallery_sections: next }
                                    })
                                  }
                                  className="text-xs text-rose/80 hover:text-rose"
                                >
                                  Remover imagem
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setContentSettings((current) => ({
                              ...current,
                              gallery_sections: current.gallery_sections.filter((_, i) => i !== sectionIndex),
                            }))
                          }
                          className="text-xs text-rose/80 hover:text-rose"
                        >
                          Remover seção
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ano */}
            <div>
              <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Ano</label>
              <input type="number" min="1900" max="2100" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine" />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-moss/50 mb-2">Localização</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-moss/20 px-4 py-3 text-moss focus:outline-none focus:border-wine" placeholder="Aracaju, Sergipe" />
            </div>

            <p className="text-xs text-moss/45">
              Os campos da ficha técnica do site agora são totalmente personalizados no bloco &quot;Ficha técnica personalizada&quot; acima.
            </p>
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
