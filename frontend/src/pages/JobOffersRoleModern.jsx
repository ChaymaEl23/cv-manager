import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import { EditIcon, PlusIcon, TrashIcon } from '../components/Icons'
import { useAuth } from '../context/AuthContext'

const emptyForm = {
  titrePoste: '',
  entreprise: '',
  description: '',
  localisation: '',
  modeTravail: 'hybrid',
  typeContrat: 'cdi',
  salaire: '',
  placesOuvertes: 1,
  niveauExperience: '',
  statut: 'open',
  dateLimite: '',
  contactEmail: '',
  contactPhone: '',
  requirements: '',
  responsibilities: '',
  benefits: '',
}

const statusLabels = {
  pending: 'En attente',
  accepted: 'Accepte',
  rejected: 'Refuse',
  needs_info: 'Besoin de details',
}

const modeLabels = {
  'on-site': 'Sur site',
  hybrid: 'Hybride',
  remote: 'Remote',
}

const contractLabels = {
  cdi: 'CDI',
  cdd: 'CDD',
  stage: 'Stage',
  alternance: 'Alternance',
  freelance: 'Freelance',
}

const listOrEmpty = (items) => (Array.isArray(items) && items.length > 0 ? items : [])

export default function JobOffersRoleModern() {
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [applications, setApplications] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [drafts, setDrafts] = useState({})
  const [aiLoadingId, setAiLoadingId] = useState('')
  const [applyLoadingId, setApplyLoadingId] = useState('')
  const [statusLoadingId, setStatusLoadingId] = useState('')
  const [notes, setNotes] = useState({})

  const loadData = async () => {
    setFetching(true)
    try {
      const requests = [api.get('/job-offers')]
      if (user?.role !== 'hr') {
        requests.push(api.get('/job-offers/applications/mine'))
      }

      const [offersRes, applicationsRes] = await Promise.all(requests)
      setOffers(offersRes.data || [])
      setApplications(applicationsRes?.data || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les offres')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.role])

  const studentStatusCards = useMemo(() => {
    const pending = applications.filter((application) => application.status === 'pending').length
    const accepted = applications.filter((application) => application.status === 'accepted').length
    const needsInfo = applications.filter((application) => application.status === 'needs_info').length

    return [
      { label: 'Offres ouvertes', value: offers.length },
      { label: 'Candidatures envoyees', value: applications.length },
      { label: 'Entretiens / OK', value: accepted },
      { label: 'Pieces demandees', value: needsInfo + pending },
    ]
  }, [applications, offers.length])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const resetForm = () => {
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (editId) {
        await api.put(`/job-offers/${editId}`, form)
        setSuccess("Offre mise a jour avec succes.")
      } else {
        await api.post('/job-offers', form)
        setSuccess('Offre creee avec succes.')
      }
      resetForm()
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'enregistrer l'offre")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (offer) => {
    setForm({
      titrePoste: offer.titrePoste || '',
      entreprise: offer.entreprise || '',
      description: offer.description || '',
      localisation: offer.localisation || '',
      modeTravail: offer.modeTravail || 'hybrid',
      typeContrat: offer.typeContrat || 'cdi',
      salaire: offer.salaire || '',
      placesOuvertes: offer.placesOuvertes || 1,
      niveauExperience: offer.niveauExperience || '',
      statut: offer.statut || 'open',
      dateLimite: offer.dateLimite ? offer.dateLimite.slice(0, 10) : '',
      contactEmail: offer.contactEmail || '',
      contactPhone: offer.contactPhone || '',
      requirements: listOrEmpty(offer.requirements).join('\n'),
      responsibilities: listOrEmpty(offer.responsibilities).join('\n'),
      benefits: listOrEmpty(offer.benefits).join('\n'),
    })
    setEditId(offer._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette offre d'emploi ?")) return
    try {
      await api.delete(`/job-offers/${id}`)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Suppression impossible')
    }
  }

  const handleGenerateAiDraft = async (offerId) => {
    setAiLoadingId(offerId)
    setError('')
    try {
      const res = await api.post(`/job-offers/${offerId}/ai-application-message`)
      setDrafts((current) => ({ ...current, [offerId]: res.data.contenu }))
    } catch (err) {
      setError(err.response?.data?.message || 'Generation IA indisponible')
    } finally {
      setAiLoadingId('')
    }
  }

  const handleApply = async (offerId) => {
    setApplyLoadingId(offerId)
    setError('')
    setSuccess('')
    try {
      await api.post(`/job-offers/${offerId}/apply`, {
        message: drafts[offerId] || '',
        aiDraft: drafts[offerId] || '',
      })
      setSuccess('Candidature envoyee. Vous recevrez maintenant les retours RH dans votre suivi.')
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de candidater')
    } finally {
      setApplyLoadingId('')
    }
  }

  const handleStatusUpdate = async (applicationId, status) => {
    setStatusLoadingId(applicationId)
    setError('')
    try {
      await api.patch(`/job-offers/applications/${applicationId}/status`, {
        status,
        hrNote: notes[applicationId] || '',
      })
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Mise a jour impossible')
    } finally {
      setStatusLoadingId('')
    }
  }

  if (fetching) {
    return (
      <div className="surface-card flex h-64 items-center justify-center rounded-[1.8rem]">
        <p className="text-slate-400">Chargement des offres...</p>
      </div>
    )
  }

  if (user?.role === 'hr') {
    return (
      <div>
        <PageHeader
          eyebrow="HR"
          title="Hub recrutement"
          description="Publiez des offres detaillees, suivez le nombre de candidatures et repondez a chaque profil avec un vrai pipeline."
          actions={
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditId(null)
                setForm(emptyForm)
              }}
              className="primary-button"
            >
              <PlusIcon className="h-4 w-4" />
              Nouvelle offre
            </button>
          }
        />

        {success && <div className="status-banner success mb-5">{success}</div>}
        {error && <div className="status-banner error mb-5">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="surface-card mb-6 rounded-[1.8rem] p-6 sm:p-7">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label">Titre du poste</label>
                <input name="titrePoste" value={form.titrePoste} onChange={handleChange} className="field-input" required />
              </div>
              <div>
                <label className="field-label">Entreprise</label>
                <input name="entreprise" value={form.entreprise} onChange={handleChange} className="field-input" required />
              </div>
              <div>
                <label className="field-label">Localisation</label>
                <input name="localisation" value={form.localisation} onChange={handleChange} className="field-input" />
              </div>
              <div>
                <label className="field-label">Niveau d'experience</label>
                <input name="niveauExperience" value={form.niveauExperience} onChange={handleChange} className="field-input" placeholder="Junior, confirme..." />
              </div>
              <div>
                <label className="field-label">Mode de travail</label>
                <select name="modeTravail" value={form.modeTravail} onChange={handleChange} className="field-select">
                  <option value="on-site">Sur site</option>
                  <option value="hybrid">Hybride</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="field-label">Type de contrat</label>
                <select name="typeContrat" value={form.typeContrat} onChange={handleChange} className="field-select">
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="stage">Stage</option>
                  <option value="alternance">Alternance</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              <div>
                <label className="field-label">Salaire / budget</label>
                <input name="salaire" value={form.salaire} onChange={handleChange} className="field-input" placeholder="Ex: 8 000 - 12 000 MAD" />
              </div>
              <div>
                <label className="field-label">Nombre de profils a recruter</label>
                <input name="placesOuvertes" type="number" min="1" value={form.placesOuvertes} onChange={handleChange} className="field-input" />
              </div>
              <div>
                <label className="field-label">Date limite</label>
                <input name="dateLimite" type="date" value={form.dateLimite} onChange={handleChange} className="field-input" />
              </div>
              <div>
                <label className="field-label">Statut</label>
                <select name="statut" value={form.statut} onChange={handleChange} className="field-select">
                  <option value="open">Ouverte</option>
                  <option value="draft">Brouillon</option>
                  <option value="closed">Fermee</option>
                </select>
              </div>
              <div>
                <label className="field-label">Email contact</label>
                <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} className="field-input" />
              </div>
              <div>
                <label className="field-label">Telephone contact</label>
                <input name="contactPhone" value={form.contactPhone} onChange={handleChange} className="field-input" />
              </div>
            </div>

            <div className="mt-5">
              <label className="field-label">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={6} className="field-textarea" required />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              <div>
                <label className="field-label">Ce poste fera</label>
                <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows={6} className="field-textarea" placeholder="Une ligne par mission" />
              </div>
              <div>
                <label className="field-label">Ce que vous attendez</label>
                <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={6} className="field-textarea" placeholder="Une ligne par requirement" />
              </div>
              <div>
                <label className="field-label">Ce que vous offrez</label>
                <textarea name="benefits" value={form.benefits} onChange={handleChange} rows={6} className="field-textarea" placeholder="Une ligne par avantage" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="submit" disabled={loading} className="primary-button">
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={resetForm} className="secondary-button">
                Annuler
              </button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {offers.length === 0 && (
            <div className="empty-state">
              <p className="text-lg font-bold text-slate-700">Aucune offre creee</p>
            </div>
          )}

          {offers.map((offer) => (
            <article key={offer._id} className="surface-card rounded-[1.8rem] p-6 sm:p-7">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="soft-badge text-indigo-700">{contractLabels[offer.typeContrat] || offer.typeContrat}</span>
                    <span className="soft-badge text-slate-700">{modeLabels[offer.modeTravail] || offer.modeTravail}</span>
                    <span className="soft-badge text-emerald-700">{offer.statut}</span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-800">{offer.titrePoste}</h3>
                  <p className="mt-2 text-base font-semibold text-indigo-600">
                    {offer.entreprise} {offer.localisation ? `• ${offer.localisation}` : ''}
                  </p>
                  <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">{offer.description}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50/80 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Candidatures</p>
                      <p className="mt-2 text-2xl font-bold text-slate-800">{offer.applicationCount || 0}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50/80 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">En attente</p>
                      <p className="mt-2 text-2xl font-bold text-slate-800">{offer.pendingCount || 0}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50/80 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Acceptes</p>
                      <p className="mt-2 text-2xl font-bold text-slate-800">{offer.acceptedCount || 0}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50/80 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Places restantes</p>
                      <p className="mt-2 text-2xl font-bold text-slate-800">{offer.remainingSpots || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handleEdit(offer)} className="secondary-button px-4 py-3 text-sm">
                    <EditIcon />
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(offer._id)} className="secondary-button is-danger px-4 py-3 text-sm">
                    <TrashIcon />
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {listOrEmpty(offer.applications).length === 0 && (
                  <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-6 text-sm text-slate-500">
                    Pas encore de candidature sur cette offre.
                  </div>
                )}

                {listOrEmpty(offer.applications).map((application) => (
                  <div key={application._id} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/70 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <p className="text-lg font-bold text-slate-800">
                          {application.profileSnapshot?.fullName || `${application.applicant?.prenom || ''} ${application.applicant?.nom || ''}`}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {application.profileSnapshot?.titreProfessionnel || 'Profil candidat'}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                          {statusLabels[application.status] || application.status}
                        </p>
                        {application.message && <p className="mt-4 text-sm leading-7 text-slate-600">{application.message}</p>}
                        {application.hrNote && (
                          <div className="mt-4 rounded-[1rem] bg-white px-4 py-3 text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">Note RH:</span> {application.hrNote}
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap gap-3 text-sm">
                          {application.profileSnapshot?.email && (
                            <a href={`mailto:${application.profileSnapshot.email}`} className="secondary-button px-4 py-3">
                              Contacter par mail
                            </a>
                          )}
                          {application.profileSnapshot?.telephone && (
                            <a href={`tel:${application.profileSnapshot.telephone}`} className="secondary-button px-4 py-3">
                              Appeler
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="w-full max-w-xl space-y-3">
                        <textarea
                          value={notes[application._id] ?? application.hrNote ?? ''}
                          onChange={(e) => setNotes((current) => ({ ...current, [application._id]: e.target.value }))}
                          rows={4}
                          className="field-textarea"
                          placeholder="Ajouter un commentaire RH, une demande de document, un feedback..."
                        />
                        <div className="flex flex-wrap gap-3">
                          {['accepted', 'rejected', 'needs_info'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(application._id, status)}
                              disabled={statusLoadingId === application._id}
                              className={`secondary-button px-4 py-3 text-sm ${application.status === status ? 'border-blue-300 bg-blue-50' : ''}`}
                            >
                              {statusLabels[status]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Offres"
        title="Marketplace candidature"
        description="Decouvrez les offres RH, generez un message de candidature avec l'IA, postulez et suivez les reponses en ligne."
      />

      {success && <div className="status-banner success mb-5">{success}</div>}
      {error && <div className="status-banner error mb-5">{error}</div>}

      <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {studentStatusCards.map((stat) => (
          <div key={stat.label} className="surface-card rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
            <p className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-slate-800">{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          {offers.length === 0 && (
            <div className="empty-state">
              <p className="text-lg font-bold text-slate-700">Aucune offre ouverte pour le moment</p>
            </div>
          )}

          {offers.map((offer) => (
            <article key={offer._id} className="surface-card rounded-[1.8rem] p-6 sm:p-7">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="soft-badge text-indigo-700">{contractLabels[offer.typeContrat] || offer.typeContrat}</span>
                <span className="soft-badge text-slate-700">{modeLabels[offer.modeTravail] || offer.modeTravail}</span>
                {offer.niveauExperience && <span className="soft-badge text-emerald-700">{offer.niveauExperience}</span>}
              </div>

              <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-800">{offer.titrePoste}</h3>
              <p className="mt-2 text-base font-semibold text-indigo-600">
                {offer.entreprise} {offer.localisation ? `• ${offer.localisation}` : ''}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{offer.description}</p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Salaire</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{offer.salaire || 'A definir'}</p>
                </div>
                <div className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Places</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{offer.placesOuvertes || 1} profils</p>
                </div>
                <div className="rounded-[1.2rem] border border-slate-200/70 bg-slate-50/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Date limite</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {offer.dateLimite ? new Date(offer.dateLimite).toLocaleDateString('fr-FR') : 'Ouverte'}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <div>
                  <p className="field-label">Missions</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {listOrEmpty(offer.responsibilities).map((item) => <li key={item}>• {item}</li>)}
                    {listOrEmpty(offer.responsibilities).length === 0 && <li>• Missions detaillees lors de l'entretien</li>}
                  </ul>
                </div>
                <div>
                  <p className="field-label">Profil recherche</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {listOrEmpty(offer.requirements).map((item) => <li key={item}>• {item}</li>)}
                    {listOrEmpty(offer.requirements).length === 0 && <li>• Profil motive et pertinent</li>}
                  </ul>
                </div>
                <div>
                  <p className="field-label">Avantages</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {listOrEmpty(offer.benefits).map((item) => <li key={item}>• {item}</li>)}
                    {listOrEmpty(offer.benefits).length === 0 && <li>• Conditions partagees par le recruteur</li>}
                  </ul>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleGenerateAiDraft(offer._id)}
                    disabled={aiLoadingId === offer._id || offer.hasApplied}
                    className="secondary-button"
                  >
                    {aiLoadingId === offer._id ? 'IA en cours...' : 'Generer mon message IA'}
                  </button>
                  {offer.contactEmail && (
                    <a href={`mailto:${offer.contactEmail}`} className="secondary-button">
                      Contacter par mail
                    </a>
                  )}
                  {offer.contactPhone && (
                    <a href={`tel:${offer.contactPhone}`} className="secondary-button">
                      Appeler
                    </a>
                  )}
                </div>

                <textarea
                  value={drafts[offer._id] ?? offer.myApplication?.message ?? ''}
                  onChange={(e) => setDrafts((current) => ({ ...current, [offer._id]: e.target.value }))}
                  rows={6}
                  className="field-textarea"
                  placeholder="Votre message de candidature apparait ici. Vous pouvez le modifier avant envoi."
                  disabled={offer.hasApplied}
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleApply(offer._id)}
                    disabled={offer.hasApplied || applyLoadingId === offer._id}
                    className="primary-button"
                  >
                    {offer.hasApplied ? 'Candidature deja envoyee' : applyLoadingId === offer._id ? 'Envoi...' : 'Envoyer ma candidature'}
                  </button>
                  {offer.myApplication && (
                    <span className="soft-badge text-slate-700">
                      Suivi: {statusLabels[offer.myApplication.status] || offer.myApplication.status}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-6">
          <div className="hero-banner rounded-[1.8rem] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.25)]">
            <div className="relative z-10">
              <p className="soft-badge bg-white/18 text-white ring-1 ring-white/20">Suivi en ligne</p>
              <h3 className="mt-5 text-3xl font-bold tracking-[-0.04em]">Mes candidatures</h3>
              <p className="mt-3 text-sm leading-7 text-blue-50/95">
                Les RH peuvent vous accepter, refuser ou demander un complement. Chaque retour remonte ici.
              </p>
            </div>
          </div>

          <div className="surface-card rounded-[1.8rem] p-6">
            <p className="section-title mb-4">Historique</p>
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application._id} className="rounded-[1.3rem] border border-slate-200/70 bg-slate-50/80 p-4">
                  <p className="text-sm font-bold text-slate-800">{application.jobOffer?.titrePoste || 'Offre'}</p>
                  <p className="mt-1 text-sm text-slate-500">{application.jobOffer?.entreprise || 'Entreprise'}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {statusLabels[application.status] || application.status}
                  </p>
                  {application.hrNote && <p className="mt-3 text-sm text-slate-600">{application.hrNote}</p>}
                </div>
              ))}

              {applications.length === 0 && (
                <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-500">
                  Aucune candidature pour le moment.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
