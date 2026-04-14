import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const emptyForm = { titrePoste: '', entreprise: '', logoUrl: '', contactEmail: '', description: '' }

export default function JobOffers() {
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isAdmin = user?.role === 'admin'

  const fetchAll = async () => {
    const res = await api.get('/job-offers')
    setOffers(res.data)
  }

  useEffect(() => { fetchAll() }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
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
      setError(err.response?.data?.message || "Action non autorisee")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (o) => {
    setForm({
      titrePoste: o.titrePoste,
      entreprise: o.entreprise,
      logoUrl: o.logoUrl || '',
      contactEmail: o.contactEmail || '',
      description: o.description,
    })
    setEditId(o._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette offre?')) return
    try {
      setError('')
      await api.delete(`/job-offers/${id}`)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || "Action non autorisee")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Offres d'emploi</h1>
        {isAdmin && (
          <button onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null) }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            + Ajouter
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm mb-4">
          Mode etudiant: vous pouvez consulter les offres. Seul un compte entreprise/admin peut les gerer.
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-700">{editId ? 'Modifier' : 'Nouvelle offre'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre du poste</label>
              <input name="titrePoste" value={form.titrePoste} onChange={handleChange} required
                placeholder="Développeur React"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
              <input name="entreprise" value={form.entreprise} onChange={handleChange} required
                placeholder="Nom de l'entreprise"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo entreprise (URL image)</label>
              <input name="logoUrl" value={form.logoUrl} onChange={handleChange}
                placeholder="https://site.com/logo.png"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact entreprise (optionnel)</label>
              <input name="contactEmail" value={form.contactEmail} onChange={handleChange}
                placeholder="recrutement@entreprise.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description de l'offre</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
              placeholder="Copiez ici la description complète de l'offre..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {offers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
            Aucune offre ajoutée
          </div>
        )}
        {offers.map(o => (
          <div key={o._id} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4 flex-1">
                <div className="h-12 w-12 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                  {o.logoUrl ? (
                    <img src={o.logoUrl} alt={o.entreprise} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">Logo</span>
                  )}
                </div>
                <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{o.titrePoste}</h3>
                <p className="text-sm text-indigo-600">{o.entreprise}</p>
                {o.contactEmail && <p className="text-xs text-gray-500 mt-1">{o.contactEmail}</p>}
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{o.description}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(o)}
                    className="text-xs text-gray-500 hover:text-blue-600 px-3 py-1 border border-gray-200 rounded-lg hover:border-blue-300">
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(o._id)}
                    className="text-xs text-gray-500 hover:text-red-600 px-3 py-1 border border-gray-200 rounded-lg hover:border-red-300">
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}