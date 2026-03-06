'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/ui/ImageUpload'

interface AboutTeamPhotoSettingsProps {
  initialUrl?: string
  siteSettingsMissing?: boolean
}

export function AboutTeamPhotoSettings({
  initialUrl = '',
  siteSettingsMissing = false,
}: AboutTeamPhotoSettingsProps) {
  const supabase = createClient()
  const [photoUrl, setPhotoUrl] = useState(initialUrl)
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
        { key: 'about_team_photo_url', value_text: photoUrl || null },
        { onConflict: 'key' }
      )

    if (upsertError) {
      const normalized = upsertError.message.toLowerCase()
      if (
        upsertError.code === 'PGRST205' ||
        normalized.includes("could not find the table 'public.site_settings'")
      ) {
        setError('Tabela site_settings nao encontrada no Supabase. Crie a tabela para salvar a foto da equipe.')
      } else {
        setError(upsertError.message)
      }
      setSaving(false)
      return
    }

    setSaving(false)
    setMessage('Foto da equipe salva com sucesso.')
  }

  return (
    <section className="bg-white border border-moss/10 p-6 mb-8">
      <div className="mb-5">
        <h3 className="font-serif text-xl text-moss">Foto de equipe (página Sobre)</h3>
        <p className="text-sm text-moss/50 mt-1">
          Essa imagem aparece no bloco &quot;Quem somos&quot; em <code>/sobre</code>.
        </p>
        {siteSettingsMissing && (
          <p className="text-sm text-rose-700 mt-3">
            Configuração indisponível: tabela <code>public.site_settings</code> nao encontrada.
          </p>
        )}
      </div>

      <div className="max-w-md">
        <ImageUpload
          label="Foto da equipe"
          value={photoUrl}
          onChange={setPhotoUrl}
          bucket="images"
          folder="site"
          aspect="4/3"
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || siteSettingsMissing}
          className="px-5 py-2.5 bg-wine text-cream text-sm uppercase tracking-wider hover:bg-rose transition-colors disabled:opacity-60"
        >
          {saving ? 'Salvando...' : 'Salvar foto'}
        </button>
        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </div>
    </section>
  )
}
