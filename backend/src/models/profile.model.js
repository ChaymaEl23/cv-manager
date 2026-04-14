const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  titreProfessionnel: { type: String, trim: true },
  resume: { type: String, trim: true },
  telephone: { type: String, trim: true },
  adresse: { type: String, trim: true },
  linkedIn: { type: String, trim: true },
  github: { type: String, trim: true },
  portfolio: { type: String, trim: true },
  photo: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
