import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Brand from '../components/Brand'
import { ArrowRightIcon, CheckIcon, IconWrapper, SparklesIcon } from '../components/Icons'

export default function RegisterModern() {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(form.nom, form.prenom, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-background flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="auth-card glass-panel order-2 mx-auto lg:order-1">
          <Brand />
          <div className="mt-10">
            <p className="section-title mb-3">Inscription</p>
            <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-slate-800">Creez votre espace</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              En quelques informations, vous obtenez un espace moderne pour gerer tout votre parcours.
            </p>
          </div>

          {error && <div className="status-banner error mt-6">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label">Nom</label>
                <input name="nom" value={form.nom} onChange={handleChange} className="field-input" required />
              </div>
              <div>
                <label className="field-label">Prenom</label>
                <input name="prenom" value={form.prenom} onChange={handleChange} className="field-input" required />
              </div>
            </div>

            <div>
              <label className="field-label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="field-input" required />
            </div>

            <div>
              <label className="field-label">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="field-input"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="primary-button w-full">
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Vous avez deja un compte ?{' '}
            <Link to="/login" className="font-semibold text-blue-600 transition hover:text-blue-700">
              Se connecter
            </Link>
          </p>
        </section>

        <section className="order-1 hidden lg:block lg:order-2">
          <div className="mx-auto max-w-xl">
            <div className="soft-badge mb-5">
              <SparklesIcon className="h-4 w-4 text-blue-500" />
              Experience inspiree par votre mockup
            </div>
            <h1 className="page-title">
              Lancez une interface elegante pour piloter tout votre parcours professionnel.
            </h1>
            <p className="page-copy mt-5">
              Le nouveau design met en avant vos actions principales, garde une lecture claire et
              rend chaque page plus moderne, plus nette et plus cohente.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Profil, experiences et formations dans une structure visuelle unique',
                "Generation IA mise en avant avec un parcours plus fluide",
                'Navigation dashboard premium adaptee aux grands et petits ecrans',
              ].map((item) => (
                <div key={item} className="glass-panel flex items-center gap-4 rounded-[1.6rem] p-5">
                  <IconWrapper className="text-blue-600">
                    <CheckIcon className="h-5 w-5" />
                  </IconWrapper>
                  <p className="text-sm font-semibold leading-7 text-slate-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="hero-banner mt-8 rounded-[1.8rem] p-6 shadow-[0_28px_60px_rgba(37,99,235,0.28)]">
              <p className="text-lg font-bold">Pret a demarrer ?</p>
              <p className="mt-3 max-w-sm text-sm leading-7 text-blue-50/95">
                Creez votre compte puis completez vos sections pour produire des documents candidats plus vite.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-blue-700">
                Nouveau parcours <ArrowRightIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
