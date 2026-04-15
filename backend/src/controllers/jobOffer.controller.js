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
    if (!offer) return res.status(404).json({ message: 'Non trouvé' });
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
    if (!offer) return res.status(404).json({ message: 'Non trouvé' });
    res.json({ message: 'Supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
