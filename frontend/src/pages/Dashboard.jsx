import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const cards = [
  { to: '/profile', title: 'Profil', desc: 'Titre, résumé, contact', icon: '👤', roles: ['student'] },
  { to: '/experiences', title: 'Expériences', desc: 'Postes et entreprises', icon: '💼', roles: ['student'] },
  { to: '/formations', title: 'Formations', desc: 'Diplômes et établissements', icon: '🎓', roles: ['student'] },
  { to: '/skills', title: 'Compétences', desc: 'Compétences techniques', icon: '🧠', roles: ['student'] },
  { to: '/languages', title: 'Langues', desc: 'Niveaux linguistiques', icon: '🌍', roles: ['student'] },
  { to: '/job-offers', title: 'Offres', desc: "Offres d'emploi", icon: '📌', roles: ['admin', 'student'] },
  { to: '/generate', title: 'Génération IA', desc: 'CV, lettres, emails', icon: '✨', roles: ['student'] },
  { to: '/documents', title: 'Documents', desc: 'Historique généré', icon: '📄', roles: ['student'] },
]

export default function Dashboard() {
  const { user } = useAuth()
  const visibleCards = cards.filter(card => card.roles.includes(user?.role || 'student'))
  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-5">
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-slate-900">Bonjour, {user?.prenom}</h1>
        <p className="text-slate-500 mt-1">
          {isAdmin ? "Gérez vos offres d'emploi et les contacts entreprise." : 'Complétez votre profil et générez vos candidatures.'}
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {visibleCards.map(card => (
          <Link
            key={card.to}
            to={card.to}
            className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-xs font-medium rounded-full px-2 py-1 bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700">
                Ouvrir
              </span>
            </div>
            <h3 className="font-semibold text-base text-slate-900 mt-5">{card.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{card.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}