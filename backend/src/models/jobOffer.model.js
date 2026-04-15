const mongoose = require('mongoose');

const jobOfferSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titrePoste: { type: String, required: true, trim: true },
  entreprise: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  localisation: { type: String, trim: true },
  modeTravail: {
    type: String,
    enum: ['on-site', 'hybrid', 'remote'],
    default: 'hybrid',
  },
  typeContrat: {
    type: String,
    enum: ['cdi', 'cdd', 'stage', 'alternance', 'freelance'],
    default: 'cdi',
  },
  salaire: { type: String, trim: true },
  placesOuvertes: { type: Number, min: 1, default: 1 },
  niveauExperience: { type: String, trim: true },
  statut: {
    type: String,
    enum: ['draft', 'open', 'closed'],
    default: 'open',
  },
  dateLimite: { type: Date },
  contactEmail: { type: String, trim: true, lowercase: true },
  contactPhone: { type: String, trim: true },
  requirements: [{ type: String, trim: true }],
  responsibilities: [{ type: String, trim: true }],
  benefits: [{ type: String, trim: true }],
}, { timestamps: true });

module.exports = mongoose.model('JobOffer', jobOfferSchema);
