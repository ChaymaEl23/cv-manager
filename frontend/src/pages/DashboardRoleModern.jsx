import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
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

const studentCards = [
  { to: '/profile', title: 'Profil', desc: 'Titre, resume, contact', tile: 'tile-blue', icon: UserIcon, accent: 'text-blue-600' },
  { to: '/experiences', title: 'Experiences', desc: 'Postes, missions, competences', tile: 'tile-green', icon: BriefcaseIcon, accent: 'text-emerald-600' },
  { to: '/formations', title: 'Formations', desc: 'Diplomes et etablissements', tile: 'tile-purple', icon: GraduationIcon, accent: 'text-violet-600' },
  { to: '/skills', title: 'Competences', desc: 'Technologies et outils', tile: 'tile-amber', icon: CodeIcon, accent: 'text-amber-600' },
  { to: '/languages', title: 'Langues', desc: 'Niveaux et progression', tile: 'tile-pink', icon: GlobeIcon, accent: 'text-pink-600' },
  { to: '/job-offers', title: 'Offres', desc: 'Marche des opportunites et candidatures', tile: 'tile-indigo', icon: BriefcaseIcon, accent: 'text-indigo-600' },
]

export default function DashboardRoleModern() {
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const fullName = [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Votre espace'

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const requests = [api.get('/job-offers')]
        if (user?.role !== 'hr') {
          requests.push(api.get('/job-offers/applications/mine'))
        }

        const [offersRes, applicationsRes] = await Promise.all(requests)
        if (cancelled) return
        setOffers(offersRes.data || [])
        setApplications(applicationsRes?.data || [])
      } catch (error) {
        if (cancelled) return
        setOffers([])
        setApplications([])
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user?.role])

  const stats = useMemo(() => {
    if (user?.role === 'hr') {
      const totalPending = offers.reduce((sum, offer) => sum + (offer.pendingCount || 0), 0)
      const totalAccepted = offers.reduce((sum, offer) => sum + (offer.acceptedCount || 0), 0)
      const remaining = offers.reduce((sum, offer) => sum + (offer.remainingSpots || 0), 0)
      return [
        { label: 'Offres actives', value: offers.filter((offer) => offer.statut === 'open').length },
        { label: 'Candidatures en attente', value: totalPending },
        { label: 'Profils retenus', value: totalAccepted },
        { label: 'Places restantes', value: remaining },
      ]
    }

    const accepted = applications.filter((application) => application.status === 'accepted').length
    const needsInfo = applications.filter((application) => application.status === 'needs_info').length

    return [
      { label: 'Offres ouvertes', value: offers.length },
      { label: 'Mes candidatures', value: applications.length },
      { label: 'Reponses positives', value: accepted },
      { label: 'Demandes de complement', value: needsInfo },
    ]
  }, [applications, offers, user?.role])

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      await downloadCvPdf()
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="surface-card flex h-64 items-center justify-center rounded-[1.8rem]">
        <p className="text-slate-400">Chargement du dashboard...</p>
      </div>
    )
  }

  if (user?.role === 'hr') {
    return (
      <div>
        <PageHeader
          eyebrow="HR"
          title={`Pilotage recrutement, ${fullName}`}
          description="Creer des offres riches, suivre les places restantes et traiter les candidatures depuis un seul tableau."
          actions={
            <Link to="/job-offers" className="primary-button">
              Gérer les offres
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          }
        />

        <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="surface-card rounded-[1.8rem] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
              <p className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-slate-800">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="content-grid">
          <div className="hero-banner rounded-[1.9rem] p-6 shadow-[0_28px_60px_rgba(37,99,235,0.24)]">
            <div className="relative z-10">
              <div className="soft-badge bg-white/18 text-white ring-1 ring-white/20">Pipeline en ligne</div>
              <h3 className="mt-5 text-3xl font-bold tracking-[-0.04em]">Recrutement avec suivi en temps reel</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-blue-50/95">
                Chaque offre affiche le nombre de candidatures, les profils acceptes, les demandes de complement et les places encore disponibles.
              </p>
              <Link to="/job-offers" className="secondary-button mt-5 w-fit bg-white text-slate-800">
                Ouvrir le hub RH
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
                <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-800">Ce que vous pouvez faire</h3>
                <p className="text-sm text-slate-500">Le compte RH par defaut est deja pret.</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                'Publier des offres detaillees avec requirements, responsabilites, avantages et nombre de postes',
                'Accepter, refuser ou demander un complement a chaque candidat',
                'Contacter directement les candidats via email ou telephone',
              ].map((item) => (
                <div key={item} className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50/80 px-4 py-4 text-sm font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Accueil"
        title={`Bonjour, ${fullName}`}
        description="Construisez votre CV, utilisez l'IA pour vos candidatures et suivez toutes les reponses RH dans un seul dashboard."
        actions={
          <>
            <button onClick={handleDownloadPdf} className="secondary-button" disabled={downloading}>
              {downloading ? 'Preparation PDF...' : 'Telecharger PDF'}
            </button>
            <Link to="/generate" className="secondary-button">
              <SparklesIcon className="h-4 w-4" />
              Generer avec IA
            </Link>
            <Link to="/job-offers" className="primary-button">
              Explorer les offres
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </>
        }
      />

      <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="surface-card rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
            <p className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-slate-800">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {studentCards.map((card) => {
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
              <h3 className="mt-5 text-3xl font-bold tracking-[-0.04em]">Candidatures plus solides, plus vite</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-blue-50/95">
                Generez votre resume, adaptez une lettre a une offre RH et creez un message de candidature avant de postuler.
              </p>
            </div>

            <Link to="/generate" className="secondary-button w-fit bg-white text-slate-800">
              Lancer l'IA
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
              <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-800">Suivi recent</h3>
              <p className="text-sm text-slate-500">Les retours RH apparaissent ici.</p>
            </div>
          </div>

          <div className="space-y-4">
            {(applications.slice(0, 3)).map((application) => (
              <div key={application._id} className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50/80 px-4 py-4">
                <p className="text-sm font-bold text-slate-800">{application.jobOffer?.titrePoste || 'Offre'}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{application.status}</p>
                {application.hrNote && <p className="mt-2 text-sm text-slate-600">{application.hrNote}</p>}
              </div>
            ))}

            {applications.length === 0 && (
              <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">
                Pas encore de candidature envoyee. Explorez les offres et postulez directement.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
