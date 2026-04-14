import { useEffect, useState } from 'react'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import { EditIcon, PlusIcon, TrashIcon } from '../components/Icons'

const levels = ['Debutant', 'Intermediaire', 'Avance', 'Courant', 'Langue maternelle']
const emptyForm = { nom: '', niveau: 'Intermediaire' }

const normalizeLevel = (value) =>
  (
    {
      'Débutant': 'Debutant',
      'Intermédiaire': 'Intermediaire',
      'Avancé': 'Avance',
    }[value] || value
  )

export default function LanguagesModern() {
  const [languages, setLanguages] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchAll = async () => {
    const res = await api.get('/languages')
    setLanguages(res.data.map((language) => ({ ...language, niveau: normalizeLevel(language.niveau) })))
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
        await api.put(`/languages/${editId}`, form)
      } else {
        await api.post('/languages', form)
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

  const handleEdit = (language) => {
    setForm({ nom: language.nom, niveau: normalizeLevel(language.niveau) })
    setEditId(language._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette langue ?')) return
    await api.delete(`/languages/${id}`)
    fetchAll()
  }

  return (
    <div>
      <PageHeader
        eyebrow="Langues"
        title="Vos langues et niveaux"
        description="Ajoutez vos langues pour renforcer vos candidatures et vos profils internationaux."
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
              <label className="field-label">Langue</label>
              <input name="nom" value={form.nom} onChange={handleChange} className="field-input" placeholder="Francais, Anglais..." required />
            </div>
            <div>
              <label className="field-label">Niveau</label>
              <select name="niveau" value={form.niveau} onChange={handleChange} className="field-select">
                {levels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {languages.length === 0 && (
          <div className="empty-state md:col-span-2 xl:col-span-3">
            <p className="text-lg font-bold text-slate-700">Aucune langue ajoutee</p>
          </div>
        )}

        {languages.map((language) => (
          <article key={language._id} className="surface-card rounded-[1.8rem] p-6">
            <div className="soft-badge mb-4 text-pink-700">{language.niveau}</div>
            <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-800">{language.nom}</h3>
            <p className="mt-2 text-sm text-slate-500">Niveau declare pour vos CV et lettres de motivation.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => handleEdit(language)} className="secondary-button px-4 py-2 text-sm">
                <EditIcon />
                Modifier
              </button>
              <button onClick={() => handleDelete(language._id)} className="secondary-button is-danger px-4 py-2 text-sm">
                <TrashIcon />
                Supprimer
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
