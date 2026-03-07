'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/ui/ImageUpload'

interface HomeManifestoPhotosSettingsProps {
  initialPhoto1Url?: string
  initialPhoto2Url?: string
  siteSettingsMissing?: boolean
}

export function HomeManifestoPhotosSettings({
  initialPhoto1Url = '',
  initialPhoto2Url = '',
  siteSettingsMissing = false,
}: HomeManifestoPhotosSettingsProps) {
  const supabase = createClient()
  const [photo1Url, setPhoto1Url] = useState(initialPhoto1Url)
  const [photo2Url, setPhoto2Url] = useState(initialPhoto2Url)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    setError('')

    const { error: upsertError } = await supabase
      .from('site_settings')
      .upsert(
        [
          { key: 'home_manifesto_photo_1_url', value_text: photo1Url || null },
          { key: 'home_manifesto_photo_2_url', value_text: photo2Url || null },
        ],
        { onConflict: 'key' }
      )

    if (upsertError) {
      const normalized = upsertError.message.toLowerCase()
      if (
        upsertError.code === 'PGRST205' ||
        normalized.includes("could not find the table 'public.site_settings'")
      ) {
        setError('Tabela site_settings nao encontrada no Supabase. Crie a tabela para salvar as fotos da Home.')
      } else {
        setError(upsertError.message)
      }
      setSaving(false)
      return
    }

    setSaving(false)
    setMessage('Fotos da Home salvas com sucesso.')
  }

  return (
    <section className="bg-white border border-moss/10 p-6 mb-8">
      <div className="mb-5">
        <h3 className="font-serif text-xl text-moss">Fotos da Home (seção Quem somos)</h3>
        <p className="text-sm text-moss/50 mt-1">
          Atualize aqui as duas imagens do bloco visual da Home.
        </p>
        {siteSettingsMissing && (
          <p className="text-sm text-rose-700 mt-3">
            Configuração indisponível: tabela <code>public.site_settings</code> nao encontrada.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="max-w-[240px]">
          <ImageUpload
            label="Foto 1"
            value={photo1Url}
            onChange={setPhoto1Url}
            bucket="images"
            folder="site/home"
            aspect="4/3"
          />
        </div>
        <div className="max-w-[240px]">
          <ImageUpload
            label="Foto 2"
            value={photo2Url}
            onChange={setPhoto2Url}
            bucket="images"
            folder="site/home"
            aspect="4/3"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || siteSettingsMissing}
          className="px-5 py-2.5 bg-wine text-cream text-sm uppercase tracking-wider hover:bg-rose transition-colors disabled:opacity-60"
        >
          {saving ? 'Salvando...' : 'Salvar fotos'}
        </button>
        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </div>
    </section>
  )
}
