import { useEffect, useState } from 'react'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import { EditIcon, PlusIcon, TrashIcon } from '../components/Icons'

const emptyForm = {
  poste: '',
  entreprise: '',
  dateDebut: '',
  dateFin: '',
  enCours: false,
  description: '',
  competences: '',
}

export default function ExperiencesModern() {
  const [experiences, setExperiences] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchAll = async () => {
    const res = await api.get('/experiences')
    setExperiences(res.data)
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
      const data = {
        ...form,
        competences: form.competences.split(',').map((item) => item.trim()).filter(Boolean),
      }

      if (editId) {
        await api.put(`/experiences/${editId}`, data)
      } else {
        await api.post('/experiences', data)
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

  const handleEdit = (exp) => {
    setForm({
      poste: exp.poste,
      entreprise: exp.entreprise,
      dateDebut: exp.dateDebut?.split('T')[0] || '',
      dateFin: exp.dateFin?.split('T')[0] || '',
      enCours: exp.enCours,
      description: exp.description || '',
      competences: exp.competences?.join(', ') || '',
    })
    setEditId(exp._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette experience ?')) return
    await api.delete(`/experiences/${id}`)
    fetchAll()
  }

  return (
    <div>
      <PageHeader
        eyebrow="Parcours"
        title="Experiences professionnelles"
        description="Structurez vos missions, competences et resultats dans une timeline claire et moderne."
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
          <div className="mb-5">
            <p className="section-title mb-2">Formulaire</p>
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-800">
              {editId ? 'Modifier une experience' : 'Ajouter une experience'}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="field-label">Poste</label>
              <input name="poste" value={form.poste} onChange={handleChange} className="field-input" required />
            </div>
            <div>
              <label className="field-label">Entreprise</label>
              <input name="entreprise" value={form.entreprise} onChange={handleChange} className="field-input" required />
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
            Poste en cours
          </label>

          <div className="mt-5">
            <label className="field-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5} className="field-textarea" />
          </div>

          <div className="mt-5">
            <label className="field-label">Competences</label>
            <input name="competences" value={form.competences} onChange={handleChange} className="field-input" placeholder="React, Node.js, MongoDB" />
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
        {experiences.length === 0 && (
          <div className="empty-state">
            <p className="text-lg font-bold text-slate-700">Aucune experience pour le moment</p>
            <p className="mt-2 text-sm text-slate-500">Ajoutez vos missions pour enrichir votre CV et vos generations IA.</p>
          </div>
        )}

        {experiences.map((exp) => (
          <article key={exp._id} className="surface-card rounded-[1.8rem] p-6 sm:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="soft-badge mb-4 text-blue-700">{exp.enCours ? 'En cours' : 'Experience'}</div>
                <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-800">{exp.poste}</h3>
                <p className="mt-2 text-base font-semibold text-blue-600">{exp.entreprise}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {exp.dateDebut?.split('T')[0]} - {exp.enCours ? 'Present' : exp.dateFin?.split('T')[0]}
                </p>
                {exp.description && <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{exp.description}</p>}
                {!!exp.competences?.length && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {exp.competences.map((competence) => (
                      <span key={competence} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {competence}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => handleEdit(exp)} className="secondary-button px-4 py-3 text-sm">
                  <EditIcon />
                  Modifier
                </button>
                <button onClick={() => handleDelete(exp._id)} className="secondary-button is-danger px-4 py-3 text-sm">
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
