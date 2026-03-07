'use client'

import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Instagram, Mail, MapPin, Send } from 'lucide-react'
import { useState } from 'react'

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
      <section className="bg-wine py-20 lg:py-28 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <p className="text-gold text-[16px] tracking-[0.35em] uppercase mb-4">Contato</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-cream leading-[0.96]">
            Vamos conversar
          </h1>
          <p className="text-cream/60 text-sm mt-5 max-w-md leading-relaxed">
            Estamos disponiveis para novos projetos. Conte-nos sobre seu espaco e iniciamos essa conversa.
          </p>
        </div>
      </section>

      {/* Conteúdo principal */}
      <section className="py-20 px-6 lg:px-14 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Coluna esquerda — informações */}
          <div className="lg:col-span-4">
            <h2 className="font-serif text-3xl text-charcoal mb-5 leading-tight">
              Conte-nos sobre o seu espaço
            </h2>
            <p className="font-sans text-[13px] font-light text-moss/75 leading-[2] mb-12">
              Seja uma residência, espaço comercial ou projeto de interiores — adoramos ouvir histórias e transformar sonhos em arquitetura com identidade.
            </p>

            {/* Canais de contato */}
            <div className="flex flex-col gap-3">
              {/* Email */}
              <a
                href="mailto:estudioclaraboia.arq@gmail.com"
                className="group flex items-center gap-5 p-6 bg-[#FFFDF8] border border-wine/12 hover:border-wine/35 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-wine flex items-center justify-center text-cream shrink-0">
                  <Mail size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-sans text-[10px] tracking-[0.3em] uppercase font-light text-moss/60 mb-0.5">Email</p>
                  <p className="font-sans text-[12px] font-light text-charcoal group-hover:text-wine transition-colors">
                    estudioclaraboia.arq@gmail.com
                  </p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/claraboia.arquitetura?igsh=ZndleDFreHR5b25s"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 p-6 bg-[#FFFDF8] border border-wine/12 hover:border-wine/35 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-moss flex items-center justify-center text-gold shrink-0">
                  <Instagram size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-sans text-[10px] tracking-[0.3em] uppercase font-light text-moss/60 mb-0.5">Instagram</p>
                  <p className="font-sans text-[12px] font-light text-charcoal">@claraboia.arquitetura</p>
                </div>
              </a>

              {/* Localização */}
              <div className="flex items-center gap-5 p-6 bg-[#FFFDF8] border border-wine/12">
                <div className="w-12 h-12 border border-gold/45 flex items-center justify-center text-gold shrink-0">
                  <MapPin size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-sans text-[10px] tracking-[0.3em] uppercase font-light text-moss/60 mb-0.5">Localização</p>
                  <p className="font-sans text-[12px] font-light text-moss/75">Aracaju, Sergipe — Brasil</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita — formulário */}
          <div className="lg:col-span-7 lg:col-start-6">
            {success ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-[#FFFDF8] border border-wine/12 px-10">
                <div className="w-16 h-16 border border-gold/50 flex items-center justify-center mb-8">
                  <CheckCircle size={28} strokeWidth={1} className="text-gold" />
                </div>
                <h3 className="font-serif text-3xl text-charcoal mb-3">Mensagem recebida!</h3>
                <p className="font-sans text-[13px] font-light text-moss/70 leading-[2] max-w-xs mb-10">
                  Entraremos em contato em breve. Obrigada pelo interesse em trabalhar conosco!
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="font-sans text-[10px] font-light tracking-[0.3em] uppercase border-b border-wine/30 pb-px hover:border-gold hover:text-gold transition-all duration-300 cursor-pointer"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <div className="bg-[#FFFDF8] border border-wine/12 p-10 md:p-14">
                <h3 className="font-serif text-2xl text-charcoal mb-2">Formulario de contato</h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                    {/* Nome */}
                    <div>
                      <label className="block font-sans text-[9px] tracking-[0.4em] uppercase text-moss/60 mb-3">
                        Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border-b border-wine/20 bg-transparent py-3 font-sans text-[13px] font-light text-charcoal placeholder:text-moss/35 focus:outline-none focus:border-gold transition-colors"
                        placeholder="Seu nome"
                      />
                    </div>
                    {/* Telefone */}
                    <div>
                      <label className="block font-sans text-[9px] tracking-[0.4em] uppercase text-moss/60 mb-3">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full border-b border-wine/20 bg-transparent py-3 font-sans text-[13px] font-light text-charcoal placeholder:text-moss/35 focus:outline-none focus:border-gold transition-colors"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-sans text-[9px] tracking-[0.4em] uppercase text-moss/60 mb-3">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border-b border-wine/20 bg-transparent py-3 font-sans text-[13px] font-light text-charcoal placeholder:text-moss/35 focus:outline-none focus:border-gold transition-colors"
                      placeholder="seu@email.com"
                    />
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label className="block font-sans text-[9px] tracking-[0.4em] uppercase text-moss/60 mb-3">
                      Mensagem *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full border-b border-wine/20 bg-transparent py-3 font-sans text-[13px] font-light text-charcoal placeholder:text-moss/35 focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="Conte-nos sobre o seu projeto, espaço e sonhos..."
                    />
                  </div>

                  {error && (
                    <p className="font-sans text-[11px] text-wine font-light">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-3 py-5 bg-wine text-cream font-sans text-[10px] font-light tracking-[0.3em] uppercase hover:bg-moss transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
