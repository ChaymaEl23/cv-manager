import { useEffect, useState } from 'react'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import { EditIcon, PlusIcon, TrashIcon } from '../components/Icons'

const levels = ['Debutant', 'Intermediaire', 'Avance', 'Expert']
const emptyForm = { nom: '', niveau: 'Intermediaire', categorie: '' }

const levelStyles = {
  Debutant: 'bg-slate-100 text-slate-600',
  Intermediaire: 'bg-blue-50 text-blue-700',
  Avance: 'bg-emerald-50 text-emerald-700',
  Expert: 'bg-violet-50 text-violet-700',
}

const normalizeLevel = (value) =>
  (
    {
      'Débutant': 'Debutant',
      'Intermédiaire': 'Intermediaire',
      'Avancé': 'Avance',
    }[value] || value
  )

export default function SkillsModern() {
  const [skills, setSkills] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchAll = async () => {
    const res = await api.get('/skills')
    setSkills(res.data.map((skill) => ({ ...skill, niveau: normalizeLevel(skill.niveau) })))
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
        await api.put(`/skills/${editId}`, form)
      } else {
        await api.post('/skills', form)
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

  const handleEdit = (skill) => {
    setForm({ nom: skill.nom, niveau: normalizeLevel(skill.niveau), categorie: skill.categorie || '' })
    setEditId(skill._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette competence ?')) return
    await api.delete(`/skills/${id}`)
    fetchAll()
  }

  return (
    <div>
      <PageHeader
        eyebrow="Competences"
        title="Mettez en avant vos forces"
        description="Regroupez vos outils et niveaux pour alimenter un CV plus convaincant."
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
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="field-label">Competence</label>
              <input name="nom" value={form.nom} onChange={handleChange} className="field-input" placeholder="React, Python..." required />
            </div>
            <div>
              <label className="field-label">Niveau</label>
              <select name="niveau" value={form.niveau} onChange={handleChange} className="field-select">
                {levels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Categorie</label>
              <input name="categorie" value={form.categorie} onChange={handleChange} className="field-input" placeholder="Frontend, Backend..." />
            </div>
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

      <section className="surface-card rounded-[1.8rem] p-6 sm:p-7">
        {skills.length === 0 ? (
          <div className="empty-state">
            <p className="text-lg font-bold text-slate-700">Aucune competence ajoutee</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {skills.map((skill) => (
              <div key={skill._id} className="rounded-[1.4rem] border border-slate-200/70 bg-white/78 px-4 py-4 shadow-[0_12px_24px_rgba(120,149,201,0.08)]">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-slate-800">{skill.nom}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${levelStyles[skill.niveau] || levelStyles.Intermediaire}`}>
                    {skill.niveau}
                  </span>
                </div>
                {skill.categorie && <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{skill.categorie}</p>}
                <div className="mt-4 flex gap-3">
                  <button onClick={() => handleEdit(skill)} className="secondary-button px-4 py-2 text-sm">
                    <EditIcon />
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(skill._id)} className="secondary-button is-danger px-4 py-2 text-sm">
                    <TrashIcon />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
