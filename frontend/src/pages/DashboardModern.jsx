import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CodeIcon,
  DocumentIcon,
  GlobeIcon,
  GraduationIcon,
  IconWrapper,
  SparklesIcon,
  UserIcon,
} from '../components/Icons'
import { downloadCvPdf } from '../utils/cvPdf'

const cards = [
  { to: '/profile', title: 'Profil', desc: 'Titre, resume, contact', tile: 'tile-blue', icon: UserIcon, accent: 'text-blue-600' },
  { to: '/experiences', title: 'Experiences', desc: 'Postes, missions, competences', tile: 'tile-green', icon: BriefcaseIcon, accent: 'text-emerald-600' },
  { to: '/formations', title: 'Formations', desc: 'Diplomes et etablissements', tile: 'tile-purple', icon: GraduationIcon, accent: 'text-violet-600' },
  { to: '/skills', title: 'Competences', desc: 'Technologies et outils', tile: 'tile-amber', icon: CodeIcon, accent: 'text-amber-600' },
  { to: '/languages', title: 'Langues', desc: 'Niveaux et progression', tile: 'tile-pink', icon: GlobeIcon, accent: 'text-pink-600' },
  { to: '/job-offers', title: 'Offres', desc: "Cibles d'emploi a adapter", tile: 'tile-indigo', icon: BriefcaseIcon, accent: 'text-indigo-600' },
]

export default function DashboardModern() {
  const { user } = useAuth()
  const [downloading, setDownloading] = useState(false)
  const fullName = [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Votre espace'

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      await downloadCvPdf()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Accueil"
        title={`Bonjour, ${fullName}`}
        description="Retrouvez toutes les sections importantes de votre CV dans un dashboard plus moderne, plus lisible et mieux structure."
        actions={
          <>
            <button onClick={handleDownloadPdf} className="secondary-button" disabled={downloading}>
              {downloading ? 'Preparation PDF...' : 'Telecharger PDF'}
            </button>
            <Link to="/generate" className="secondary-button">
              <SparklesIcon className="h-4 w-4" />
              Generer CV
            </Link>
            <Link to="/experiences" className="primary-button">
              Ajouter une experience
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </>
        }
      />

      <section className="surface-card mb-6 rounded-[1.8rem] p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-2xl font-bold tracking-[-0.04em] text-slate-800">Terminez votre CV</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Completez vos blocs principaux puis lancez la generation IA avec un contenu beaucoup plus riche.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <div className="h-3 w-full max-w-xl rounded-full bg-slate-200">
                <div className="h-3 w-[46%] rounded-full bg-[linear-gradient(90deg,#2563eb,#5ea5ff)]" />
              </div>
              <span className="text-lg font-bold text-slate-700">46%</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/generate" className="secondary-button">
              <SparklesIcon className="h-4 w-4" />
              Lancer l'IA
            </Link>
            <Link to="/experiences" className="primary-button">
              Ajouter experience
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <Link key={card.to} to={card.to} className={`tile-card ${card.tile}`}>
              <div className="relative z-10">
                <IconWrapper className={`mb-5 ${card.accent}`}>
                  <Icon className="h-5 w-5" />
                </IconWrapper>
                <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-800">{card.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">{card.desc}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                  Ouvrir <ArrowRightIcon className="h-4 w-4" />
                </div>
              </div>
            </Link>
          )
        })}
      </section>

      <section className="content-grid mt-6">
        <div className="hero-banner rounded-[1.9rem] p-6 shadow-[0_28px_60px_rgba(37,99,235,0.24)]">
          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div>
              <div className="soft-badge bg-white/18 text-white ring-1 ring-white/20">Assistant IA</div>
              <h3 className="mt-5 text-3xl font-bold tracking-[-0.04em]">Generez votre CV avec l'IA</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-blue-50/95">
                Creez un resume professionnel, adaptez une lettre a une offre cible et conservez tout votre historique au meme endroit.
              </p>
            </div>

            <Link to="/generate" className="secondary-button w-fit bg-white text-slate-800">
              Commencer
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="surface-card rounded-[1.9rem] p-6">
          <div className="mb-5 flex items-center gap-4">
            <IconWrapper className="text-slate-600">
              <DocumentIcon className="h-5 w-5" />
            </IconWrapper>
            <div>
              <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-800">Documents</h3>
              <p className="text-sm text-slate-500">Gardez une trace de tout ce que l'IA a deja genere.</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              'Resume professionnel et synthese de profil',
              'Lettres de motivation ciblees par offre',
              'Emails de candidature et variantes adaptees',
            ].map((item) => (
              <div key={item} className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50/80 px-4 py-4 text-sm font-semibold text-slate-700">
                {item}
              </div>
            ))}
          </div>

          <Link to="/documents" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600">
            Voir l'historique <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
