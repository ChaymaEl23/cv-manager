import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import { DocumentIcon, IconWrapper } from '../components/Icons'

const typeLabels = {
  cv: 'CV',
  lettre: 'Lettre',
  email: 'Email',
  resume: 'Resume',
}

const typeColors = {
  cv: 'bg-blue-50 text-blue-700',
  lettre: 'bg-violet-50 text-violet-700',
  email: 'bg-emerald-50 text-emerald-700',
  resume: 'bg-amber-50 text-amber-700',
}

export default function DocumentsModern() {
  const [documents, setDocuments] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api
      .get('/ai/documents')
      .then((res) => {
        setDocuments(res.data)
        if (res.data.length > 0) setSelected(res.data[0])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="surface-card flex h-64 items-center justify-center rounded-[1.8rem]">
        <p className="text-slate-400">Chargement des documents...</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Historique"
        title="Documents generes"
        description="Retrouvez toutes vos productions IA dans une vue plus claire, plus confortable a relire et reutiliser."
      />

      {documents.length === 0 ? (
        <div className="empty-state">
          <p className="text-lg font-bold text-slate-700">Aucun document genere pour le moment</p>
          <p className="mt-2 text-sm text-slate-500">Lancez votre premiere generation pour commencer votre bibliotheque.</p>
          <Link to="/generate" className="primary-button mt-5">
            Generer mon premier document
          </Link>
        </div>
      ) : (
        <div className="content-grid">
          <section className="space-y-4">
            {documents.map((doc) => (
              <button
                key={doc._id}
                onClick={() => setSelected(doc)}
                className={`surface-card block w-full rounded-[1.6rem] p-5 text-left transition ${
                  selected?._id === doc._id ? 'ring-2 ring-blue-300' : ''
                }`}
              >
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${typeColors[doc.type] || typeColors.cv}`}>
                  {typeLabels[doc.type] || doc.type}
                </div>
                {doc.jobOffer && <p className="mt-3 text-lg font-bold text-slate-800">{doc.jobOffer.titrePoste}</p>}
                {doc.jobOffer && <p className="mt-1 text-sm font-semibold text-slate-500">{doc.jobOffer.entreprise}</p>}
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                  {new Date(doc.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">{doc.contenu}</p>
              </button>
            ))}
          </section>

          <section className="surface-card flex min-h-[38rem] flex-col rounded-[1.8rem] p-6 sm:p-7">
            {!selected ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-slate-400">Selectionnez un document pour le lire</p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${typeColors[selected.type] || typeColors.cv}`}>
                      {typeLabels[selected.type] || selected.type}
                    </div>
                    {selected.jobOffer && (
                      <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-800">
                        {selected.jobOffer.titrePoste}
                      </p>
                    )}
                    {selected.jobOffer && <p className="mt-1 text-sm font-semibold text-slate-500">{selected.jobOffer.entreprise}</p>}
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                      {new Date(selected.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <button onClick={() => handleCopy(selected.contenu)} className="secondary-button text-sm">
                    {copied ? 'Copie !' : 'Copier'}
                  </button>
                </div>

                <div className="flex-1 rounded-[1.5rem] bg-slate-50/90 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <IconWrapper className="text-slate-600">
                      <DocumentIcon className="h-5 w-5" />
                    </IconWrapper>
                    <p className="text-sm font-semibold text-slate-500">Contenu sauvegarde</p>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm leading-8 text-slate-700">{selected.contenu}</pre>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
