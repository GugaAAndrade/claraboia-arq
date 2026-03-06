'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  /** URL atual da imagem (vinda do banco) */
  value?: string | null
  /** Callback com a nova URL pública após upload */
  onChange: (url: string) => void
  /** Nome do bucket no Supabase Storage */
  bucket?: string
  /** Pasta dentro do bucket */
  folder?: string
  /** Aspecto do preview. Ex: '1/1', '3/4', '16/9' */
  aspect?: string
  label?: string
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'images',
  folder = 'uploads',
  aspect = '1/1',
  label = 'Imagem',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    // Validações
    if (!file.type.startsWith('image/')) {
      setError('Apenas imagens são permitidas.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 10 MB.')
      return
    }

    setError(null)
    setUploading(true)

    // Preview local imediato
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      onChange(data.publicUrl)
      setPreview(data.publicUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar imagem'
      setError(msg)
      setPreview(value ?? null)
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleRemove() {
    setPreview(null)
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-medium tracking-widest uppercase text-black/50">
          {label}
        </label>
      )}

      <div
        className="relative border-2 border-dashed border-black/15 hover:border-wine/40 transition-colors duration-200 cursor-pointer overflow-hidden"
        style={{ aspectRatio: aspect }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* Preview */}
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized={preview.startsWith('blob:')}
            />
            {/* Overlay ao hover */}
            {!uploading && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-200 flex items-center justify-center group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                    className="bg-white text-black p-2 hover:bg-gold transition-colors"
                    title="Trocar imagem"
                  >
                    <Upload size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemove() }}
                    className="bg-white text-black p-2 hover:bg-red-500 hover:text-white transition-colors"
                    title="Remover imagem"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-black/25">
            <ImageIcon size={32} strokeWidth={1} />
            <div className="text-center">
              <p className="text-xs font-medium tracking-wider">Clique ou arraste</p>
              <p className="text-[11px] mt-0.5">JPG, PNG, WebP · máx. 10 MB</p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-wine" />
            <p className="text-xs text-black/50 tracking-wider">Enviando...</p>
          </div>
        )}
      </div>

      {/* Erro */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={uploading}
      />
    </div>
  )
}
