'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })

      if (err) {
        const normalized = err.message.toLowerCase()
        if (normalized.includes('email not confirmed')) {
          setError('Email ainda nao confirmado no Supabase Auth.')
        } else if (normalized.includes('invalid login credentials')) {
          setError('Email ou senha incorretos.')
        } else {
          setError(`Falha no login: ${err.message}`)
        }
        setLoading(false)
        return
      }

      // Redirecionamento completo evita estado preso quando o cookie de sessao
      // ainda nao foi refletido no roteamento cliente.
      window.location.assign('/admin')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado no login.'
      setError(`Falha no login: ${message}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-moss flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl text-cream">Claraboia<br /><span className="text-gold">Arquitetura</span></h1>
          <p className="text-cream/40 text-xs tracking-widest uppercase mt-3">Área restrita</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs tracking-widest uppercase text-cream/50 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/30 px-4 py-3 focus:outline-none focus:border-gold transition-colors"
              placeholder="email@exemplo.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-cream/50 mb-2">Senha</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/30 px-4 py-3 pr-12 focus:outline-none focus:border-gold transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream/70"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-rose text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="py-4 bg-gold text-moss font-medium tracking-wider uppercase text-sm hover:bg-cream transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
