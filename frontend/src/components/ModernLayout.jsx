import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Brand from './Brand'
import {
  ArrowRightIcon,
  BellIcon,
  BriefcaseIcon,
  CodeIcon,
  DashboardIcon,
  DocumentIcon,
  GlobeIcon,
  GraduationIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  UserIcon,
} from './Icons'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/profile', label: 'Profil', icon: UserIcon },
  { to: '/experiences', label: 'Experiences', icon: BriefcaseIcon },
  { to: '/formations', label: 'Formations', icon: GraduationIcon },
  { to: '/skills', label: 'Competences', icon: CodeIcon },
  { to: '/languages', label: 'Langues', icon: GlobeIcon },
  { to: '/job-offers', label: 'Offres', icon: BriefcaseIcon },
  { to: '/generate', label: 'Generer', icon: SparklesIcon },
  { to: '/documents', label: 'Documents', icon: DocumentIcon },
]

export default function ModernLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profilePhoto, setProfilePhoto] = useState('')
  const fullName = [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Utilisateur'
  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase() || 'CV'

  useEffect(() => {
    api.get('/profile')
      .then((res) => setProfilePhoto(res.data?.photo || ''))
      .catch(() => setProfilePhoto(''))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1800px] gap-6 px-4 py-4 lg:px-6">
        <aside className="sidebar-glow hidden w-[288px] shrink-0 flex-col rounded-[2rem] border border-white/8 p-6 text-white shadow-[0_28px_70px_rgba(13,22,46,0.36)] lg:flex">
          <Brand compact light />

          <div className="mt-10 rounded-[1.6rem] bg-white/6 p-4 ring-1 ring-white/8">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Compte</p>
            <p className="mt-3 text-xl font-bold">{fullName}</p>
            <p className="mt-1 text-sm text-slate-300">{user?.email}</p>
          </div>

          <nav className="mt-8 flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[0.98rem] font-semibold tracking-[-0.02em]">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(76,123,255,0.26),rgba(82,176,255,0.16))] p-4 ring-1 ring-white/8">
              <p className="text-sm font-semibold">Pret a postuler plus vite ?</p>
              <p className="mt-2 text-sm text-slate-200">
                Ajoutez votre experience et laissez l'IA preparer vos documents.
              </p>
              <NavLink to="/generate" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                Ouvrir l'assistant <ArrowRightIcon className="h-4 w-4" />
              </NavLink>
            </div>

            <button
              onClick={handleLogout}
              className="w-full rounded-[1.2rem] border border-white/10 bg-white/7 px-4 py-3 text-left text-sm font-semibold text-rose-200 transition hover:bg-white/10"
            >
              Deconnexion
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="glass-panel rounded-[1.8rem] px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="section-title mb-2">Tableau de bord</p>
                <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-slate-800">
                  Bonjour, {user?.prenom || 'ami'} <span className="align-middle">👋</span>
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Votre espace CV garde toutes vos experiences, offres et documents au meme endroit.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200/70 bg-white/75 px-4 py-3 shadow-[0_10px_24px_rgba(120,149,201,0.12)]">
                  <SearchIcon className="h-5 w-5 text-slate-400" />
                  <span className="text-sm text-slate-400">Rechercher...</span>
                </div>

                <NavLink to="/generate" className="primary-button whitespace-nowrap">
                  <PlusIcon className="h-5 w-5" />
                  Generer CV
                </NavLink>

                <div className="flex items-center gap-3">
                  <button className="relative rounded-2xl bg-white/80 p-3 text-slate-600 shadow-[0_12px_24px_rgba(120,149,201,0.12)]">
                    <BellIcon className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500" />
                  </button>
                  <div className="flex items-center gap-3 rounded-[1.2rem] bg-white/78 px-3 py-2 shadow-[0_12px_24px_rgba(120,149,201,0.12)]">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt={fullName} className="h-11 w-11 rounded-2xl object-cover shadow-[0_10px_24px_rgba(120,149,201,0.18)]" />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6,#60a5fa)] text-sm font-extrabold text-white">
                        {initials}
                      </div>
                    )}
                    <div className="hidden text-left sm:block">
                      <p className="text-sm font-bold text-slate-800">{fullName}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`mobile-nav-pill ${location.pathname === item.to ? 'active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </header>

          <main className="min-w-0 rounded-[2rem] bg-white/40 p-1">
            <div className="min-h-[calc(100vh-11rem)] rounded-[1.8rem] bg-white/22 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
