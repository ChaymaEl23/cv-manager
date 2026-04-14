import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import { SparklesIcon } from '../components/Icons'

const types = [
  { value: 'resume', label: 'Resume professionnel', desc: 'Une synthese rapide et convaincante de votre profil' },
  { value: 'lettre', label: 'Lettre de motivation', desc: "Une lettre ciblee selon l'offre choisie" },
  { value: 'email', label: 'Email de candidature', desc: 'Un message court et professionnel pour postuler' },
  { value: 'adapt', label: 'Adapter un contenu', desc: 'Ameliorez un texte existant pour une offre precise' },
]

export default function GenerateModern() {
  const [selectedType, setSelectedType] = useState('resume')
  const [jobOffers, setJobOffers] = useState([])
  const [selectedOffer, setSelectedOffer] = useState('')
  const [contentToAdapt, setContentToAdapt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get('/job-offers').then((res) => setJobOffers(res.data)).catch(console.error)
  }, [])

  const needsOffer = ['lettre', 'email', 'adapt'].includes(selectedType)

  const handleGenerate = async () => {
    setError('')
    setResult('')

    if (needsOffer && !selectedOffer) {
      setError("Veuillez selectionner une offre d'emploi")
      return
    }

    if (selectedType === 'adapt' && !contentToAdapt.trim()) {
      setError('Veuillez saisir le contenu a adapter')
      return
    }

    setLoading(true)

    try {
      let res
      if (selectedType === 'resume') {
        res = await api.post('/ai/generate-resume')
      } else if (selectedType === 'lettre') {
        res = await api.post('/ai/generate-letter', { jobOfferId: selectedOffer })
      } else if (selectedType === 'email') {
        res = await api.post('/ai/generate-email', { jobOfferId: selectedOffer })
      } else {
        res = await api.post('/ai/adapt-to-offer', { content: contentToAdapt, jobOfferId: selectedOffer })
      }

      setResult(res.data.contenu)
    } catch (err) {
      console.error('Generate error:', err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la generation')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImprove = async () => {
    if (!result) return
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/ai/improve-text', { text: result })
      setResult(res.data.contenu)
    } catch (err) {
      console.error(err)
      setError("Erreur lors de l'amelioration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="IA"
        title="Generez vos documents intelligemment"
        description="Choisissez un format, ciblez une offre et obtenez une base de candidature plus rapide a personnaliser."
      />

      <div className="content-grid">
        <section className="space-y-5">
          <div className="surface-card rounded-[1.8rem] p-6 sm:p-7">
            <p className="section-title mb-4">Type de document</p>
            <div className="space-y-3">
              {types.map((type) => (
                <label
                  key={type.value}
                  className={`block cursor-pointer rounded-[1.4rem] border p-4 transition ${
                    selectedType === type.value
                      ? 'border-blue-300 bg-blue-50/80 shadow-[0_14px_28px_rgba(37,99,235,0.12)]'
                      : 'border-slate-200/70 bg-white/70 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={selectedType === type.value}
                    onChange={() => {
                      setSelectedType(type.value)
                      setResult('')
                      setError('')
                    }}
                    className="sr-only"
                  />
                  <p className="text-lg font-bold tracking-[-0.02em] text-slate-800">{type.label}</p>
                  <p className="mt-1 text-sm leading-7 text-slate-500">{type.desc}</p>
                </label>
              ))}
            </div>
          </div>

          {needsOffer && (
            <div className="surface-card rounded-[1.8rem] p-6 sm:p-7">
              <p className="section-title mb-4">Offre ciblee</p>
              {jobOffers.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500">
                  Aucune offre disponible.{' '}
                  <Link to="/job-offers" className="font-semibold text-blue-600">
                    Ajouter une offre
                  </Link>
                </div>
              ) : (
                <select value={selectedOffer} onChange={(e) => setSelectedOffer(e.target.value)} className="field-select">
                  <option value="">Selectionner une offre</option>
                  {jobOffers.map((offer) => (
                    <option key={offer._id} value={offer._id}>
                      {offer.titrePoste} - {offer.entreprise}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {selectedType === 'adapt' && (
            <div className="surface-card rounded-[1.8rem] p-6 sm:p-7">
              <p className="section-title mb-4">Texte a adapter</p>
              <textarea
                value={contentToAdapt}
                onChange={(e) => setContentToAdapt(e.target.value)}
                rows={8}
                className="field-textarea"
                placeholder="Collez ici votre texte a retravailler..."
              />
            </div>
          )}

          {error && <div className="status-banner error">{error}</div>}

          <button onClick={handleGenerate} disabled={loading} className="primary-button w-full">
            <SparklesIcon className="h-4 w-4" />
            {loading ? 'Generation en cours...' : "Generer avec l'IA"}
          </button>
        </section>

        <section className="space-y-5">
          <div className="hero-banner rounded-[1.8rem] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.25)]">
            <div className="relative z-10">
              <p className="soft-badge bg-white/18 text-white ring-1 ring-white/20">Assistant redaction</p>
              <h3 className="mt-5 text-3xl font-bold tracking-[-0.04em]">Un brouillon pret a personnaliser</h3>
              <p className="mt-3 text-sm leading-7 text-blue-50/95">
                Utilisez cette zone pour produire rapidement une premiere version, puis affinez-la avec vos details.
              </p>
            </div>
          </div>

          <div className="surface-card flex min-h-[34rem] flex-col rounded-[1.8rem] p-6 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-title mb-2">Resultat</p>
                <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-800">Votre contenu genere</h3>
              </div>

              {result && (
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleImprove} disabled={loading} className="secondary-button text-sm">
                    Ameliorer
                  </button>
                  <button onClick={handleCopy} className="secondary-button text-sm">
                    {copied ? 'Copie !' : 'Copier'}
                  </button>
                </div>
              )}
            </div>

            {!result && !loading && (
              <div className="flex flex-1 items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 text-center">
                <div>
                  <p className="text-lg font-bold text-slate-500">Le resultat apparaitra ici</p>
                  <p className="mt-2 text-sm text-slate-400">Choisissez un type de document et lancez la generation.</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-1 items-center justify-center rounded-[1.5rem] bg-slate-50/70">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                  <p className="mt-4 text-sm font-semibold text-slate-500">L'IA genere votre document...</p>
                </div>
              </div>
            )}

            {result && (
              <textarea value={result} onChange={(e) => setResult(e.target.value)} className="field-textarea min-h-[24rem] flex-1" />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
