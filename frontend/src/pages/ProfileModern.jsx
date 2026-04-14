import { useEffect, useState } from 'react'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import { downloadCvPdf } from '../utils/cvPdf'

export default function ProfileModern() {
  const [form, setForm] = useState({
    titreProfessionnel: '',
    resume: '',
    telephone: '',
    adresse: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    photo: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile')
        setForm({
          titreProfessionnel: res.data.titreProfessionnel || '',
          resume: res.data.resume || '',
          telephone: res.data.telephone || '',
          adresse: res.data.adresse || '',
          linkedIn: res.data.linkedIn || '',
          github: res.data.github || '',
          portfolio: res.data.portfolio || '',
          photo: res.data.photo || '',
        })
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('Image trop volumineuse. Utilisez un fichier de moins de 2 Mo.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({ ...current, photo: reader.result }))
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true)
    try {
      await downloadCvPdf()
    } catch (err) {
      setError("Impossible de generer le PDF pour le moment")
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')

    try {
      await api.put('/profile', form)
      setSuccess('Profil mis a jour avec succes.')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise a jour')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="surface-card flex h-64 items-center justify-center rounded-[1.8rem]">
        <p className="text-slate-400">Chargement du profil...</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Profil"
        title="Votre identite professionnelle"
        description="Ces informations servent de base a la generation de CV, resumes et lettres de motivation."
        actions={
          <button onClick={handleDownloadPdf} className="secondary-button">
            {downloadingPdf ? 'Preparation PDF...' : 'Telecharger CV PDF'}
          </button>
        }
      />

      {success && <div className="status-banner success mb-5">{success}</div>}
      {error && <div className="status-banner error mb-5">{error}</div>}

      <form onSubmit={handleSubmit} className="content-grid">
        <section className="surface-card rounded-[1.8rem] p-6 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            {form.photo ? (
              <img src={form.photo} alt="Photo de profil" className="h-28 w-28 rounded-[1.8rem] object-cover shadow-[0_18px_36px_rgba(82,113,181,0.16)]" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-[1.8rem] bg-[linear-gradient(135deg,#dbeafe,#bfdbfe)] text-3xl font-extrabold text-blue-700">
                CV
              </div>
            )}

            <div className="flex-1">
              <p className="section-title mb-2">Photo de profil</p>
              <p className="mb-4 text-sm leading-7 text-slate-500">
                Ajoutez un portrait propre pour l'affichage dans l'application et dans votre PDF.
              </p>
              <div className="flex flex-wrap gap-3">
                <label className="secondary-button cursor-pointer">
                  Choisir une image
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoChange} className="hidden" />
                </label>
                {form.photo && (
                  <button type="button" onClick={() => setForm((current) => ({ ...current, photo: '' }))} className="secondary-button is-danger">
                    Supprimer l'image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div>
              <label className="field-label">Titre professionnel</label>
              <input
                name="titreProfessionnel"
                value={form.titreProfessionnel}
                onChange={handleChange}
                placeholder="Ex: Developpeur Full Stack"
                className="field-input"
              />
            </div>

            <div>
              <label className="field-label">Resume professionnel</label>
              <textarea
                name="resume"
                value={form.resume}
                onChange={handleChange}
                rows={7}
                placeholder="Decrivez votre expertise, votre valeur et vos objectifs en quelques lignes."
                className="field-textarea"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label">Telephone</label>
                <input
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="+212 6XX XXX XXX"
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Adresse</label>
                <input
                  name="adresse"
                  value={form.adresse}
                  onChange={handleChange}
                  placeholder="Casablanca, Maroc"
                  className="field-input"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="surface-card rounded-[1.8rem] p-6 sm:p-7">
            <p className="section-title mb-4">Liens</p>
            <div className="space-y-4">
              <div>
                <label className="field-label">LinkedIn</label>
                <input
                  name="linkedIn"
                  value={form.linkedIn}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/..."
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">GitHub</label>
                <input
                  name="github"
                  value={form.github}
                  onChange={handleChange}
                  placeholder="github.com/..."
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Portfolio</label>
                <input
                  name="portfolio"
                  value={form.portfolio}
                  onChange={handleChange}
                  placeholder="monsite.com"
                  className="field-input"
                />
              </div>
            </div>
          </div>

          <div className="hero-banner rounded-[1.8rem] p-6 shadow-[0_24px_52px_rgba(37,99,235,0.24)]">
            <div className="relative z-10">
              <p className="text-2xl font-bold tracking-[-0.03em]">Mettez votre profil a niveau</p>
              <p className="mt-3 text-sm leading-7 text-blue-50/95">
                Plus votre profil est detaille, plus les generations IA seront pertinentes.
              </p>
              <button type="submit" disabled={loading} className="secondary-button mt-5 bg-white text-slate-800">
                {loading ? 'Enregistrement...' : 'Enregistrer le profil'}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}
