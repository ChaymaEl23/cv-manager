import { useState, useEffect } from 'react'
import api from '../services/api'

const types = [
  { value: 'resume', label: 'Résumé professionnel', desc: 'Génère un résumé accrocheur pour ton profil' },
  { value: 'lettre', label: 'Lettre de motivation', desc: 'Lettre complète adaptée à une offre' },
  { value: 'email', label: 'Email de candidature', desc: 'Email court et professionnel' },
  { value: 'adapt', label: 'Adapter un contenu', desc: 'Améliore un texte existant pour une offre' },
]

export default function Generate() {
  const [selectedType, setSelectedType] = useState('resume')
  const [jobOffers, setJobOffers] = useState([])
  const [selectedOffer, setSelectedOffer] = useState('')
  const [contentToAdapt, setContentToAdapt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)
  const [emailTarget, setEmailTarget] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [cvAttachmentContent, setCvAttachmentContent] = useState('')
  const [letterAttachmentContent, setLetterAttachmentContent] = useState('')

  useEffect(() => {
    api.get('/job-offers').then(res => setJobOffers(res.data)).catch(console.error)
  }, [])

  const needsOffer = ['lettre', 'email', 'adapt'].includes(selectedType)

  const handleGenerate = async () => {
    setError('')
    setSuccess('')
    setResult('')

    if (needsOffer && !selectedOffer) {
      setError("Veuillez sélectionner une offre d'emploi")
      return
    }
    if (selectedType === 'adapt' && !contentToAdapt.trim()) {
      setError('Veuillez saisir le contenu à adapter')
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
      } else if (selectedType === 'adapt') {
        res = await api.post('/ai/adapt-to-offer', { content: contentToAdapt, jobOfferId: selectedOffer })
      }
      setResult(res.data.contenu)
      if (selectedType === 'email') {
        const selected = jobOffers.find(o => o._id === selectedOffer)
        setEmailTarget(selected?.contactEmail || '')
        setEmailSubject(`Candidature - ${selected?.titrePoste || ''}`.trim())
        if (!cvAttachmentContent) setCvAttachmentContent('Collez ici votre CV final pour la piece jointe PDF.')
        if (!letterAttachmentContent) setLetterAttachmentContent('Collez ici votre lettre finale pour la piece jointe PDF.')
      }
    } catch (err) {
      console.error('Generate error:', err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la génération')
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
      setError("Erreur lors de l'amélioration")
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!selectedOffer) {
      setError("Veuillez sélectionner une offre d'emploi")
      return
    }
    if (!result.trim()) {
      setError("Aucun contenu d'email à envoyer")
      return
    }
    if (!emailTarget.trim()) {
      setError("Veuillez saisir l'email de destination")
      return
    }

    setSending(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/ai/send-email', {
        jobOfferId: selectedOffer,
        contenu: result,
        subject: emailSubject,
        to: emailTarget,
      })
      setSuccess(res.data.message || 'Email envoye avec succes')
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi de l'email")
    } finally {
      setSending(false)
    }
  }

  const handleSendApplicationPackage = async () => {
    if (!selectedOffer) {
      setError("Veuillez sélectionner une offre d'emploi")
      return
    }
    if (!result.trim()) {
      setError("Aucun contenu d'email à envoyer")
      return
    }
    if (!emailTarget.trim()) {
      setError("Veuillez saisir l'email de destination")
      return
    }
    if (!cvAttachmentContent.trim() || !letterAttachmentContent.trim()) {
      setError('Veuillez remplir les contenus CV et lettre pour les pieces jointes PDF')
      return
    }

    setSending(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/ai/send-application-package', {
        jobOfferId: selectedOffer,
        emailContent: result,
        cvContent: cvAttachmentContent,
        letterContent: letterAttachmentContent,
        subject: emailSubject,
        to: emailTarget,
      })
      setSuccess(res.data.message || 'Candidature complete envoyee')
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi du package")
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Générer avec l'IA</h1>
      <p className="text-gray-500 text-sm mb-6">Utilisez l'intelligence artificielle pour créer vos documents</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Type de document</h2>
            <div className="space-y-3">
              {types.map(t => (
                <label key={t.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedType === t.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input type="radio" name="type" value={t.value}
                    checked={selectedType === t.value}
                    onChange={() => { setSelectedType(t.value); setResult(''); setError('') }}
                    className="mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${selectedType === t.value ? 'text-blue-700' : 'text-gray-700'}`}>
                      {t.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {needsOffer && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-700 mb-3">Offre d'emploi ciblée</h2>
              {jobOffers.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Aucune offre.{' '}
                  <a href="/job-offers" className="text-blue-500 hover:underline">Ajouter une offre</a>
                </p>
              ) : (
                <select value={selectedOffer} onChange={e => setSelectedOffer(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Sélectionner une offre --</option>
                  {jobOffers.map(o => (
                    <option key={o._id} value={o._id}>{o.titrePoste} — {o.entreprise}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {selectedType === 'adapt' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-700 mb-3">Contenu à adapter</h2>
              <textarea value={contentToAdapt} onChange={e => setContentToAdapt(e.target.value)}
                rows={6} placeholder="Collez ici votre texte à améliorer..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{success}</div>
          )}

          {selectedType === 'email' && result && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
              <h2 className="font-semibold text-gray-700">Envoi direct à l'entreprise</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email destinataire</label>
                <input
                  type="email"
                  value={emailTarget}
                  onChange={e => setEmailTarget(e.target.value)}
                  placeholder="recrutement@entreprise.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objet</label>
                <input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Candidature - Intitulé du poste"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSendEmail}
                disabled={sending || loading}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {sending ? "Envoi en cours..." : "Envoyer l'email à l'entreprise"}
              </button>
              <div className="border-t pt-3 mt-2 space-y-2">
                <p className="text-sm font-medium text-gray-700">Envoyer avec pieces jointes PDF</p>
                <textarea
                  value={cvAttachmentContent}
                  onChange={e => setCvAttachmentContent(e.target.value)}
                  rows={5}
                  placeholder="Contenu CV (sera converti en PDF)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <textarea
                  value={letterAttachmentContent}
                  onChange={e => setLetterAttachmentContent(e.target.value)}
                  rows={5}
                  placeholder="Contenu lettre (sera converti en PDF)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={handleSendApplicationPackage}
                  disabled={sending || loading}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {sending ? 'Envoi du package...' : 'Envoyer candidature complète (Email + CV PDF + Lettre PDF)'}
                </button>
              </div>
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Génération en cours...
              </>
            ) : "Générer avec l'IA"}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Résultat</h2>
            {result && (
              <div className="flex gap-2">
                <button onClick={handleImprove} disabled={loading}
                  className="text-xs px-3 py-1.5 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50">
                  Améliorer
                </button>
                <button onClick={handleCopy}
                  className="text-xs px-3 py-1.5 border border-green-300 text-green-600 rounded-lg hover:bg-green-50">
                  {copied ? 'Copié!' : 'Copier'}
                </button>
              </div>
            )}
          </div>

          {!result && !loading && (
            <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">
              Le résultat apparaîtra ici
            </div>
          )}

          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-sm text-gray-400">L'IA génère votre document...</p>
              </div>
            </div>
          )}

          {result && (
            <textarea value={result} onChange={e => setResult(e.target.value)}
              className="flex-1 w-full text-sm text-gray-700 leading-relaxed resize-none focus:outline-none min-h-96" />
          )}
        </div>
      </div>
    </div>
  )
}