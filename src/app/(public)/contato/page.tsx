'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, CheckCircle, MapPin, Mail, Instagram } from 'lucide-react'

export default function ContatoPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('contacts').insert([form])
    setLoading(false)
    if (err) {
      setError('Ocorreu um erro. Tente novamente ou nos envie um e-mail.')
    } else {
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', message: '' })
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-44 pb-20 px-6 lg:px-14 bg-white relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-stone-100 to-transparent hidden lg:block ml-14" />
        <div className="max-w-7xl mx-auto">
          <span className="block w-10 h-px bg-gold mb-8" />
          <p className="font-sans text-[9px] font-light tracking-[0.55em] uppercase text-black/30 mb-6">Fale conosco</p>
          <h1 className="font-serif text-[64px] md:text-[88px] text-[#171717] leading-none tracking-tight">
            Vamos
            <br />
            <em className="text-wine not-italic">conversar</em>
          </h1>
        </div>
      </section>

      {/* Conteúdo principal */}
      <section className="py-20 px-6 lg:px-14 bg-[#F8F8F6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Coluna esquerda — informações */}
          <div className="lg:col-span-4">
            <h2 className="font-serif text-3xl text-[#171717] mb-5 leading-tight">
              Conte-nos sobre o seu espaço
            </h2>
            <p className="font-sans text-[13px] font-light text-black/45 leading-[2] mb-12">
              Seja uma residência, espaço comercial ou projeto de interiores — adoramos ouvir histórias e transformar sonhos em arquitetura com identidade.
            </p>

            {/* Canais de contato */}
            <div className="flex flex-col gap-3">
              {/* Email */}
              <a
                href="mailto:contato@clarabolaarquitetura.com"
                className="group flex items-center gap-5 p-6 bg-white border border-stone-100 hover:border-wine/20 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-[#171717] flex items-center justify-center text-white shrink-0">
                  <Mail size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-sans text-[10px] tracking-[0.3em] uppercase font-light text-black/40 mb-0.5">Email</p>
                  <p className="font-sans text-[12px] font-light text-[#171717] group-hover:text-wine transition-colors">
                    contato@clarabolaarquitetura.com
                  </p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/claraboia.arquitetura?igsh=ZndleDFreHR5b25s"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 p-6 bg-white border border-stone-100 hover:border-stone-300 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-rose-500 to-orange-400 flex items-center justify-center text-white shrink-0">
                  <Instagram size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-sans text-[10px] tracking-[0.3em] uppercase font-light text-black/40 mb-0.5">Instagram</p>
                  <p className="font-sans text-[12px] font-light text-[#171717]">@claraboia.arquitetura</p>
                </div>
              </a>

              {/* Localização */}
              <div className="flex items-center gap-5 p-6 bg-white border border-stone-100">
                <div className="w-12 h-12 border border-stone-200 flex items-center justify-center text-black/30 shrink-0">
                  <MapPin size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-sans text-[10px] tracking-[0.3em] uppercase font-light text-black/40 mb-0.5">Localização</p>
                  <p className="font-sans text-[12px] font-light text-black/60">Aracaju, Sergipe — Brasil</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita — formulário */}
          <div className="lg:col-span-7 lg:col-start-6">
            {success ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-stone-100 px-10">
                <div className="w-16 h-16 border border-gold/50 flex items-center justify-center mb-8">
                  <CheckCircle size={28} strokeWidth={1} className="text-gold" />
                </div>
                <h3 className="font-serif text-3xl text-[#171717] mb-3">Mensagem recebida!</h3>
                <p className="font-sans text-[13px] font-light text-black/40 leading-[2] max-w-xs mb-10">
                  Entraremos em contato em breve. Obrigada pelo interesse em trabalhar conosco!
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="font-sans text-[10px] font-light tracking-[0.3em] uppercase border-b border-black/20 pb-px hover:border-gold hover:text-gold transition-all duration-300 cursor-pointer"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <div className="bg-white border border-stone-100 p-10 md:p-14">
                <h3 className="font-serif text-2xl text-[#171717] mb-2">Formulário de contato</h3>
                <p className="font-sans text-[12px] font-light text-black/35 mb-10">Responderemos em até 24 horas úteis.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                    {/* Nome */}
                    <div>
                      <label className="block font-sans text-[9px] tracking-[0.4em] uppercase text-black/35 mb-3">
                        Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border-b border-stone-200 bg-transparent py-3 font-sans text-[13px] font-light text-black placeholder:text-black/20 focus:outline-none focus:border-gold transition-colors"
                        placeholder="Seu nome"
                      />
                    </div>
                    {/* Telefone */}
                    <div>
                      <label className="block font-sans text-[9px] tracking-[0.4em] uppercase text-black/35 mb-3">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full border-b border-stone-200 bg-transparent py-3 font-sans text-[13px] font-light text-black placeholder:text-black/20 focus:outline-none focus:border-gold transition-colors"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-sans text-[9px] tracking-[0.4em] uppercase text-black/35 mb-3">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border-b border-stone-200 bg-transparent py-3 font-sans text-[13px] font-light text-black placeholder:text-black/20 focus:outline-none focus:border-gold transition-colors"
                      placeholder="seu@email.com"
                    />
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label className="block font-sans text-[9px] tracking-[0.4em] uppercase text-black/35 mb-3">
                      Mensagem *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full border-b border-stone-200 bg-transparent py-3 font-sans text-[13px] font-light text-black placeholder:text-black/20 focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="Conte-nos sobre o seu projeto, espaço e sonhos..."
                    />
                  </div>

                  {error && (
                    <p className="font-sans text-[11px] text-wine font-light">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-3 py-5 bg-[#171717] text-white font-sans text-[10px] font-light tracking-[0.3em] uppercase hover:bg-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? 'Enviando...' : (
                      <>
                        <Send size={13} strokeWidth={1.5} />
                        Enviar mensagem
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
