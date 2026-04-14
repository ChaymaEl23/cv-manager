import { useEffect, useState } from 'react'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import { EditIcon, PlusIcon, TrashIcon } from '../components/Icons'

const emptyForm = {
  etablissement: '',
  diplome: '',
  specialite: '',
  dateDebut: '',
  dateFin: '',
  enCours: false,
  description: '',
}

export default function FormationsModern() {
  const [formations, setFormations] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchAll = async () => {
    const res = await api.get('/formations')
    setFormations(res.data)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editId) {
        await api.put(`/formations/${editId}`, form)
      } else {
        await api.post('/formations', form)
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

  const handleEdit = (formation) => {
    setForm({
      etablissement: formation.etablissement,
      diplome: formation.diplome,
      specialite: formation.specialite || '',
      dateDebut: formation.dateDebut?.split('T')[0] || '',
      dateFin: formation.dateFin?.split('T')[0] || '',
      enCours: formation.enCours,
      description: formation.description || '',
    })
    setEditId(formation._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette formation ?')) return
    await api.delete(`/formations/${id}`)
    fetchAll()
  }

  return (
    <div>
      <PageHeader
        eyebrow="Formation"
        title="Vos diplomes et etablissements"
        description="Rendez votre parcours academique plus credible avec une presentation visuelle claire."
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
              <label className="field-label">Etablissement</label>
              <input name="etablissement" value={form.etablissement} onChange={handleChange} className="field-input" required />
            </div>
            <div>
              <label className="field-label">Diplome</label>
              <input name="diplome" value={form.diplome} onChange={handleChange} className="field-input" required />
            </div>
            <div>
              <label className="field-label">Specialite</label>
              <input name="specialite" value={form.specialite} onChange={handleChange} className="field-input" />
            </div>
            <div>
              <label className="field-label">Date debut</label>
              <input type="date" name="dateDebut" value={form.dateDebut} onChange={handleChange} className="field-input" required />
            </div>
            <div>
              <label className="field-label">Date fin</label>
              <input type="date" name="dateFin" value={form.dateFin} onChange={handleChange} disabled={form.enCours} className="field-input" />
            </div>
          </div>

          <label className="mt-4 flex items-center gap-3 text-sm font-medium text-slate-600">
            <input type="checkbox" name="enCours" checked={form.enCours} onChange={handleChange} />
            Formation en cours
          </label>

          <div className="mt-5">
            <label className="field-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5} className="field-textarea" />
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
        {formations.length === 0 && (
          <div className="empty-state">
            <p className="text-lg font-bold text-slate-700">Aucune formation ajoutee</p>
            <p className="mt-2 text-sm text-slate-500">Ajoutez vos diplomes pour mieux valoriser votre candidature.</p>
          </div>
        )}

        {formations.map((formation) => (
          <article key={formation._id} className="surface-card rounded-[1.8rem] p-6 sm:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="soft-badge mb-4 text-violet-700">{formation.enCours ? 'En cours' : 'Formation'}</div>
                <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-800">{formation.diplome}</h3>
                <p className="mt-2 text-base font-semibold text-violet-600">{formation.etablissement}</p>
                {formation.specialite && <p className="mt-1 text-sm text-slate-500">{formation.specialite}</p>}
                <p className="mt-2 text-sm text-slate-400">
                  {formation.dateDebut?.split('T')[0]} - {formation.enCours ? 'Present' : formation.dateFin?.split('T')[0]}
                </p>
                {formation.description && <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{formation.description}</p>}
              </div>

              <div className="flex gap-3">
                <button onClick={() => handleEdit(formation)} className="secondary-button px-4 py-3 text-sm">
                  <EditIcon />
                  Modifier
                </button>
                <button onClick={() => handleDelete(formation._id)} className="secondary-button is-danger px-4 py-3 text-sm">
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
