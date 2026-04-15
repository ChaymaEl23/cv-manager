const JobOffer = require('../models/jobOffer.model');
const JobApplication = require('../models/jobApplication.model');
const Profile = require('../models/profile.model');
const Experience = require('../models/experience.model');
const Formation = require('../models/formation.model');
const Skill = require('../models/skill.model');
const Language = require('../models/language.model');
const aiService = require('../services/ai.service');

const splitLines = (value) =>
  typeof value === 'string'
    ? value.split('\n').map((item) => item.trim()).filter(Boolean)
    : Array.isArray(value)
      ? value.map((item) => `${item}`.trim()).filter(Boolean)
      : [];

const normalizeOfferPayload = (body) => ({
  titrePoste: body.titrePoste,
  entreprise: body.entreprise,
  description: body.description,
  localisation: body.localisation,
  modeTravail: body.modeTravail,
  typeContrat: body.typeContrat,
  salaire: body.salaire,
  placesOuvertes: body.placesOuvertes,
  niveauExperience: body.niveauExperience,
  statut: body.statut,
  dateLimite: body.dateLimite || null,
  contactEmail: body.contactEmail,
  contactPhone: body.contactPhone,
  requirements: splitLines(body.requirements),
  responsibilities: splitLines(body.responsibilities),
  benefits: splitLines(body.benefits),
});

const enrichOffer = (offer, applications = []) => {
  const acceptedCount = applications.filter((application) => application.status === 'accepted').length;
  const pendingCount = applications.filter((application) => application.status === 'pending').length;
  const needsInfoCount = applications.filter((application) => application.status === 'needs_info').length;

  return {
    ...offer.toObject(),
    applicationCount: applications.length,
    acceptedCount,
    pendingCount,
    needsInfoCount,
    remainingSpots: Math.max((offer.placesOuvertes || 1) - acceptedCount, 0),
    applications,
  };
};

exports.getAll = async (req, res) => {
  try {
    if (req.user.role === 'hr') {
      const offers = await JobOffer.find({ user: req.userId }).sort({ createdAt: -1 });
      const applications = await JobApplication.find({ jobOffer: { $in: offers.map((offer) => offer._id) } })
        .populate('applicant', 'nom prenom email')
        .sort({ createdAt: -1 });

      const applicationsByOffer = applications.reduce((acc, application) => {
        const key = application.jobOffer.toString();
        acc[key] ||= [];
        acc[key].push(application);
        return acc;
      }, {});

      return res.json(offers.map((offer) => enrichOffer(offer, applicationsByOffer[offer._id.toString()] || [])));
    }

    const offers = await JobOffer.find({ statut: 'open' })
      .populate('user', 'nom prenom email')
      .sort({ createdAt: -1 });
    const myApplications = await JobApplication.find({ applicant: req.userId }).sort({ updatedAt: -1 });
    const applicationByOffer = new Map(myApplications.map((application) => [application.jobOffer.toString(), application]));

    return res.json(
      offers.map((offer) => {
        const myApplication = applicationByOffer.get(offer._id.toString()) || null;
        return {
          ...offer.toObject(),
          myApplication,
          hasApplied: Boolean(myApplication),
        };
      })
    );
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Seul le compte HR peut creer des offres' });
    }

    const offer = await JobOffer.create({ ...normalizeOfferPayload(req.body), user: req.userId });
    return res.status(201).json(offer);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Seul le compte HR peut modifier des offres' });
    }

    const offer = await JobOffer.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      normalizeOfferPayload(req.body),
      { new: true }
    );

    if (!offer) return res.status(404).json({ message: 'Non trouve' });
    return res.json(offer);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Seul le compte HR peut supprimer des offres' });
    }

    const offer = await JobOffer.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!offer) return res.status(404).json({ message: 'Non trouve' });

    await JobApplication.deleteMany({ jobOffer: offer._id });
    return res.json({ message: 'Supprime avec succes' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.userId })
      .populate({
        path: 'jobOffer',
        populate: { path: 'user', select: 'nom prenom email' },
      })
      .sort({ updatedAt: -1 });

    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.applyToOffer = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Le compte HR ne peut pas candidater' });
    }

    const offer = await JobOffer.findOne({ _id: req.params.id, statut: 'open' });
    if (!offer) {
      return res.status(404).json({ message: 'Offre non trouvee ou fermee' });
    }

    const [profile, experiences, formations, skills, languages] = await Promise.all([
      Profile.findOne({ user: req.userId }),
      Experience.countDocuments({ user: req.userId }),
      Formation.countDocuments({ user: req.userId }),
      Skill.countDocuments({ user: req.userId }),
      Language.countDocuments({ user: req.userId }),
    ]);

    const application = await JobApplication.create({
      jobOffer: offer._id,
      applicant: req.userId,
      message: req.body.message,
      aiDraft: req.body.aiDraft,
      profileSnapshot: {
        fullName: [req.user.prenom, req.user.nom].filter(Boolean).join(' '),
        email: req.user.email,
        telephone: profile?.telephone || '',
        titreProfessionnel: profile?.titreProfessionnel || '',
        resume: profile?.resume || '',
        linkedIn: profile?.linkedIn || '',
        github: profile?.github || '',
        portfolio: profile?.portfolio || '',
        experiencesCount: experiences,
        formationsCount: formations,
        skillsCount: skills,
        languagesCount: languages,
      },
    });

    const populated = await JobApplication.findById(application._id)
      .populate('applicant', 'nom prenom email')
      .populate({
        path: 'jobOffer',
        populate: { path: 'user', select: 'nom prenom email' },
      });

    return res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Vous avez deja candidate a cette offre' });
    }

    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Seul le compte HR peut traiter les candidatures' });
    }

    const application = await JobApplication.findById(req.params.id).populate('jobOffer');
    if (!application) {
      return res.status(404).json({ message: 'Candidature introuvable' });
    }

    if (application.jobOffer.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Action non autorisee' });
    }

    application.status = req.body.status || application.status;
    application.hrNote = req.body.hrNote ?? application.hrNote;
    application.statusUpdatedAt = new Date();
    await application.save();

    const populated = await JobApplication.findById(application._id)
      .populate('applicant', 'nom prenom email')
      .populate({
        path: 'jobOffer',
        populate: { path: 'user', select: 'nom prenom email' },
      });

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.generateApplicationDraft = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Le compte HR ne peut pas generer de candidature' });
    }

    const jobOffer = await JobOffer.findOne({ _id: req.params.id, statut: 'open' });
    if (!jobOffer) {
      return res.status(404).json({ message: 'Offre non trouvee ou fermee' });
    }

    const [profile, experiences, formations, skills, languages] = await Promise.all([
      Profile.findOne({ user: req.userId }).populate('user', 'nom prenom email'),
      Experience.find({ user: req.userId }).sort({ dateDebut: -1 }).limit(5),
      Formation.find({ user: req.userId }).sort({ dateDebut: -1 }).limit(3),
      Skill.find({ user: req.userId }).limit(10),
      Language.find({ user: req.userId }).limit(5),
    ]);

    if (!profile) {
      return res.status(404).json({ message: 'Profil non trouve' });
    }

    const contenu = await aiService.generateApplicationPitch(profile, experiences, formations, skills, languages, jobOffer);
    return res.json({ contenu });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur IA', error: error.message });
  }
};
