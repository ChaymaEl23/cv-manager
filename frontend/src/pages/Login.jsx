import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-100">
      <div className="hidden lg:flex flex-col justify-center px-14 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <p className="uppercase tracking-widest text-xs text-blue-200">Plateforme de candidature</p>
        <h1 className="text-4xl font-bold mt-3 leading-tight">Gestionnaire Intelligent de CV et Lettres avec IA</h1>
        <p className="mt-5 text-blue-100 max-w-lg">
          Centralisez votre profil, adaptez vos contenus a chaque offre et generez rapidement des documents professionnels.
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <p className="text-xs uppercase tracking-wider text-slate-400">Connexion</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">Bienvenue sur CV Manager</h2>
          <p className="text-slate-500 text-sm mt-2 mb-6">Connectez-vous pour reprendre votre candidature.</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="votre@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Pas de compte?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              S'inscrire
            </Link>
          </p>
          <div className="mt-4 text-center text-xs text-slate-400">
            Projet academique - IA, securite, Docker, DevOps
          </div>
        </div>
      </div>
    </div>
  )
}