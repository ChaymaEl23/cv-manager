import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Brand from '../components/Brand'
import { ArrowRightIcon, IconWrapper, SparklesIcon } from '../components/Icons'

export default function LoginModern() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-background flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="relative z-10 hidden lg:block">
          <div className="max-w-xl">
            <div className="soft-badge mb-5">
              <SparklesIcon className="h-4 w-4 text-blue-500" />
              Plateforme de candidature moderne
            </div>
            <h1 className="page-title">
              Centralisez votre CV, vos offres et vos documents IA dans une seule interface.
            </h1>
            <p className="page-copy mt-5">
              CV Manager vous aide a structurer votre profil, suivre vos experiences et generer des
              contenus professionnels avec une presentation plus premium.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-[1.7rem] p-5">
                <IconWrapper className="mb-4 text-blue-600">
                  <SparklesIcon className="h-5 w-5" />
                </IconWrapper>
                <p className="text-lg font-bold text-slate-800">Assistant IA</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Creez un resume, une lettre ou un email de candidature en quelques clics.
                </p>
              </div>
              <div className="glass-panel rounded-[1.7rem] p-5">
                <IconWrapper className="mb-4 text-sky-600">
                  <ArrowRightIcon className="h-5 w-5" />
                </IconWrapper>
                <p className="text-lg font-bold text-slate-800">Flux simple</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Ajoutez vos experiences, ciblez une offre et produisez des documents coherents.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-card glass-panel mx-auto">
          <Brand />
          <div className="mt-10">
            <p className="section-title mb-3">Connexion</p>
            <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-slate-800">Heureux de vous revoir</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Connectez-vous pour reprendre la creation de votre CV et vos candidatures.
            </p>
          </div>

          {error && <div className="status-banner error mt-6">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="field-label">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="primary-button w-full">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold text-blue-600 transition hover:text-blue-700">
              Creer un compte
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
