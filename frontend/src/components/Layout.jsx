import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'student'] },
  { to: '/profile', label: 'Profil', icon: '👤', roles: ['student'] },
  { to: '/experiences', label: 'Expériences', icon: '💼', roles: ['student'] },
  { to: '/formations', label: 'Formations', icon: '🎓', roles: ['student'] },
  { to: '/skills', label: 'Compétences', icon: '🧠', roles: ['student'] },
  { to: '/languages', label: 'Langues', icon: '🌍', roles: ['student'] },
  { to: '/job-offers', label: 'Offres', icon: '📌', roles: ['admin', 'student'] },
  { to: '/generate', label: 'Génération IA', icon: '✨', roles: ['student'] },
  { to: '/documents', label: 'Documents', icon: '📄', roles: ['student'] },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || 'student'))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <aside className="hidden lg:flex lg:w-72 min-h-screen bg-white border-r border-slate-200 flex-col">
          <div className="px-6 py-6 border-b border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-400">Sujet 2</p>
            <h1 className="text-xl font-bold text-slate-900 mt-1">CV Manager IA</h1>
            <p className="text-sm text-slate-500 mt-2">{user?.prenom} {user?.nom}</p>
          </div>

          <nav className="flex-1 p-4 space-y-1.5">
            {filteredNavItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="flex-1 min-h-screen">
          <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Espace candidature intelligente</h2>
                <p className="text-sm text-slate-500">Construisez, adaptez et générez vos documents avec l'IA</p>
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 px-3 py-1.5 w-fit">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Application active
              </div>
            </div>
          </header>

          <section className="p-4 sm:p-8">
            <Outlet />
          </section>
        </main>
      </div>
      <aside className="lg:hidden bg-white border-t border-slate-200 p-3">
        <div className="grid grid-cols-3 gap-2">
          {filteredNavItems.slice(0, 6).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 bg-slate-50'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </div>
  )
}