const aiService = require('../services/ai.service');
const Profile = require('../models/profile.model');
const Experience = require('../models/experience.model');
const Formation = require('../models/formation.model');
const Skill = require('../models/skill.model');
const Language = require('../models/language.model');
const JobOffer = require('../models/jobOffer.model');
const GeneratedDocument = require('../models/generatedDocument.model');
const mailService = require('../services/mail.service');
const pdfService = require('../services/pdf.service');

const getUserData = async (userId) => {
  const [profile, experiences, formations, skills, languages] = await Promise.all([
    Profile.findOne({ user: userId }).populate('user', 'nom prenom email'),
    Experience.find({ user: userId }).sort({ ordre: 1 }),
    Formation.find({ user: userId }).sort({ dateDebut: -1 }),
    Skill.find({ user: userId }),
    Language.find({ user: userId }),
  ]);
  return { profile, experiences, formations, skills, languages };
};

exports.generateResume = async (req, res) => {
  try {
    console.log('generateResume called for user:', req.userId);
    const { profile, experiences, formations, skills, languages } = await getUserData(req.userId);

    if (!profile) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }

    console.log('Profile found, calling AI...');
    const contenu = await aiService.generateResume(profile, experiences, formations, skills, languages);

    const doc = await GeneratedDocument.create({
      user: req.userId,
      type: 'resume',
      contenu,
      modeleIA: 'claude-sonnet-4-20250514'
    });

    res.json({ contenu, documentId: doc._id });
  } catch (error) {
    console.error('generateResume ERROR:', error.message, error.stack);
    res.status(500).json({ message: 'Erreur IA', error: error.message });
  }
};

exports.generateCoverLetter = async (req, res) => {
  try {
    console.log('generateCoverLetter called for user:', req.userId);
    const { jobOfferId } = req.body;

    if (!jobOfferId) {
      return res.status(400).json({ message: 'jobOfferId obligatoire' });
    }

    const jobOffer = await JobOffer.findById(jobOfferId);
    if (!jobOffer) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }

    const { profile, experiences, formations, skills } = await getUserData(req.userId);

    console.log('Calling AI for cover letter...');
    const contenu = await aiService.generateCoverLetter(profile, experiences, formations, skills, jobOffer);

    const doc = await GeneratedDocument.create({
      user: req.userId,
      type: 'lettre',
      contenu,
      jobOffer: jobOfferId,
      modeleIA: 'claude-sonnet-4-20250514'
    });

    res.json({ contenu, documentId: doc._id });
  } catch (error) {
    console.error('generateCoverLetter ERROR:', error.message, error.stack);
    res.status(500).json({ message: 'Erreur IA', error: error.message });
  }
};

exports.generateEmail = async (req, res) => {
  try {
    console.log('generateEmail called for user:', req.userId);
    const { jobOfferId } = req.body;

    if (!jobOfferId) {
      return res.status(400).json({ message: 'jobOfferId obligatoire' });
    }

    const jobOffer = await JobOffer.findById(jobOfferId);
    if (!jobOffer) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }

    const { profile } = await getUserData(req.userId);

    console.log('Calling AI for email...');
    const contenu = await aiService.generateEmail(profile, jobOffer);

    const doc = await GeneratedDocument.create({
      user: req.userId,
      type: 'email',
      contenu,
      jobOffer: jobOfferId,
      modeleIA: 'claude-sonnet-4-20250514'
    });

    res.json({ contenu, documentId: doc._id });
  } catch (error) {
    console.error('generateEmail ERROR:', error.message, error.stack);
    res.status(500).json({ message: 'Erreur IA', error: error.message });
  }
};

exports.adaptToOffer = async (req, res) => {
  try {
    const { content, jobOfferId } = req.body;

    if (!content || !jobOfferId) {
      return res.status(400).json({ message: 'content et jobOfferId obligatoires' });
    }

    const jobOffer = await JobOffer.findById(jobOfferId);
    if (!jobOffer) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }

    const contenu = await aiService.adaptToOffer(content, jobOffer);

    const doc = await GeneratedDocument.create({
      user: req.userId,
      type: 'lettre',
      contenu,
      jobOffer: jobOfferId,
      modeleIA: 'claude-sonnet-4-20250514'
    });

    res.json({ contenu, documentId: doc._id });
  } catch (error) {
    console.error('adaptToOffer ERROR:', error.message, error.stack);
    res.status(500).json({ message: 'Erreur IA', error: error.message });
  }
};

exports.improveText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'text obligatoire' });
    }

    const contenu = await aiService.improveText(text);

    res.json({ contenu });
  } catch (error) {
    console.error('improveText ERROR:', error.message, error.stack);
    res.status(500).json({ message: 'Erreur IA', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const documents = await GeneratedDocument.find({ user: req.userId })
      .populate('jobOffer', 'titrePoste entreprise')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const document = await GeneratedDocument.findOne({ _id: req.params.id, user: req.userId })
      .populate('jobOffer', 'titrePoste entreprise');
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.sendApplicationEmail = async (req, res) => {
  try {
    const { jobOfferId, contenu, subject, to } = req.body;

    if (!jobOfferId || !contenu) {
      return res.status(400).json({ message: 'jobOfferId et contenu obligatoires' });
    }

    const jobOffer = await JobOffer.findById(jobOfferId);
    if (!jobOffer) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }

    const targetEmail = (to || jobOffer.contactEmail || '').trim().toLowerCase();
    if (!targetEmail) {
      return res.status(400).json({ message: "Email entreprise manquant. Ajoutez contactEmail sur l'offre ou saisissez-le." });
    }

    const emailSubject = subject?.trim() || `Candidature - ${jobOffer.titrePoste}`;

    await mailService.sendEmail({
      to: targetEmail,
      subject: emailSubject,
      text: contenu,
    });

    const sentDoc = await GeneratedDocument.create({
      user: req.userId,
      type: 'email',
      contenu,
      jobOffer: jobOfferId,
      modeleIA: 'smtp-send',
      sentTo: targetEmail,
      sentAt: new Date(),
    });

    res.json({
      message: 'Email envoye avec succes',
      sentTo: targetEmail,
      documentId: sentDoc._id,
    });
  } catch (error) {
    console.error('sendApplicationEmail ERROR:', error.message, error.stack);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email", error: error.message });
  }
};

exports.sendApplicationPackage = async (req, res) => {
  try {
    const { jobOfferId, emailContent, cvContent, letterContent, subject, to } = req.body;

    if (!jobOfferId || !emailContent || !cvContent || !letterContent) {
      return res.status(400).json({ message: 'jobOfferId, emailContent, cvContent et letterContent obligatoires' });
    }

    const jobOffer = await JobOffer.findById(jobOfferId);
    if (!jobOffer) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }

    const targetEmail = (to || jobOffer.contactEmail || '').trim().toLowerCase();
    if (!targetEmail) {
      return res.status(400).json({ message: "Email entreprise manquant. Ajoutez contactEmail sur l'offre ou saisissez-le." });
    }

    const [cvPdf, letterPdf] = await Promise.all([
      pdfService.buildPdfBuffer({ title: 'Curriculum Vitae', content: cvContent }),
      pdfService.buildPdfBuffer({ title: 'Lettre de motivation', content: letterContent }),
    ]);

    const emailSubject = subject?.trim() || `Candidature complète - ${jobOffer.titrePoste}`;

    await mailService.sendEmail({
      to: targetEmail,
      subject: emailSubject,
      text: emailContent,
      attachments: [
        { filename: 'CV.pdf', content: cvPdf, contentType: 'application/pdf' },
        { filename: 'Lettre-de-motivation.pdf', content: letterPdf, contentType: 'application/pdf' },
      ],
    });

    await GeneratedDocument.create({
      user: req.userId,
      type: 'email',
      contenu: emailContent,
      jobOffer: jobOfferId,
      modeleIA: 'smtp-send-package',
      sentTo: targetEmail,
      sentAt: new Date(),
    });

    res.json({ message: 'Candidature complete envoyee avec pieces jointes', sentTo: targetEmail });
  } catch (error) {
    console.error('sendApplicationPackage ERROR:', error.message, error.stack);
    res.status(500).json({ message: "Erreur lors de l'envoi du package", error: error.message });
  }
};