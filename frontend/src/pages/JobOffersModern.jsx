import { useEffect, useState } from 'react'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import { EditIcon, PlusIcon, TrashIcon } from '../components/Icons'

const emptyForm = { titrePoste: '', entreprise: '', description: '' }

export default function JobOffersModern() {
  const [offers, setOffers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchAll = async () => {
    const res = await api.get('/job-offers')
    setOffers(res.data)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editId) {
        await api.put(`/job-offers/${editId}`, form)
      } else {
        await api.post('/job-offers', form)
      }
      setForm(emptyForm)
      setEditId(null)
      setShowForm(false)
      fetchAll()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (offer) => {
    setForm({
      titrePoste: offer.titrePoste,
      entreprise: offer.entreprise,
      description: offer.description,
    })
    setEditId(offer._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette offre d'emploi ?")) return
    await api.delete(`/job-offers/${id}`)
    fetchAll()
  }

  return (
    <div>
      <PageHeader
        eyebrow="Offres"
        title="Vos offres ciblees"
        description="Conservez les annonces importantes afin d'adapter vos documents avec plus de precision."
        actions={
          <button
            onClick={() => {
              setShowForm(!showForm)
              setForm(emptyForm)
              setEditId(null)
            }}
            className="primary-button"
          >
            <PlusIcon className="h-4 w-4" />
            Ajouter
          </button>
        }
      />

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
          </div>

          <div className="mt-5">
            <label className="field-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={6} className="field-textarea" required />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="secondary-button">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="space-y-5">
        {offers.length === 0 && (
          <div className="empty-state">
            <p className="text-lg font-bold text-slate-700">Aucune offre ajoutee</p>
          </div>
        )}

        {offers.map((offer) => (
          <article key={offer._id} className="surface-card rounded-[1.8rem] p-6 sm:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="soft-badge mb-4 text-indigo-700">Offre ciblee</div>
                <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-800">{offer.titrePoste}</h3>
                <p className="mt-2 text-base font-semibold text-indigo-600">{offer.entreprise}</p>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">{offer.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Ajoutee le {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                </p>
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
          </article>
        ))}
      </div>
    </div>
  )
}
