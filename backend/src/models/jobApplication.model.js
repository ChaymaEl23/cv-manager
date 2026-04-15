const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  jobOffer: { type: mongoose.Schema.Types.ObjectId, ref: 'JobOffer', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'needs_info'],
    default: 'pending',
  },
  message: { type: String, trim: true },
  aiDraft: { type: String, trim: true },
  hrNote: { type: String, trim: true },
  profileSnapshot: {
    fullName: { type: String, trim: true },
    email: { type: String, trim: true },
    telephone: { type: String, trim: true },
    titreProfessionnel: { type: String, trim: true },
    resume: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    experiencesCount: { type: Number, default: 0 },
    formationsCount: { type: Number, default: 0 },
    skillsCount: { type: Number, default: 0 },
    languagesCount: { type: Number, default: 0 },
  },
  statusUpdatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

jobApplicationSchema.index({ jobOffer: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
