const aiService = require('../services/ai.service');
const PDFDocument = require('pdfkit');
const Profile = require('../models/profile.model');
const Experience = require('../models/experience.model');
const Formation = require('../models/formation.model');
const Skill = require('../models/skill.model');
const Language = require('../models/language.model');
const JobOffer = require('../models/jobOffer.model');
const GeneratedDocument = require('../models/generatedDocument.model');

const decodeBase64Image = (photo) => {
  if (!photo || typeof photo !== 'string') return null;
  const match = photo.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i);
  if (!match) return null;
  try {
    return Buffer.from(match[2], 'base64');
  } catch (error) {
    return null;
  }
};

const drawSectionTitle = (doc, title) => {
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#2563eb').text(title);
  doc.moveDown(0.4);
  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor('#dbe7ff')
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.8);
};

const drawBulletList = (doc, items, formatter = (item) => item) => {
  items.forEach((item) => {
    const value = formatter(item);
    if (!value) return;
    doc.font('Helvetica').fontSize(10.5).fillColor('#334155').text(`• ${value}`, {
      indent: 10,
      lineGap: 4,
    });
  });
};

const buildCvPdf = ({ profile, experiences, formations, skills, languages }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const fullName = [profile?.user?.prenom, profile?.user?.nom].filter(Boolean).join(' ');
    const avatar = decodeBase64Image(profile?.photo);

    if (avatar) {
      try {
        doc.image(avatar, 50, 50, { fit: [84, 84], align: 'center', valign: 'center' });
      } catch (error) {
        // Ignore invalid images and continue with the PDF.
      }
    }

    const headerX = avatar ? 150 : 50;

    doc.font('Helvetica-Bold').fontSize(24).fillColor('#0f172a').text(fullName || 'CV Manager', headerX, 52);
    if (profile?.titreProfessionnel) {
      doc.font('Helvetica').fontSize(13).fillColor('#2563eb').text(profile.titreProfessionnel, headerX, 82);
    }

    const contactLines = [
      profile?.user?.email,
      profile?.telephone,
      profile?.adresse,
      profile?.linkedIn,
      profile?.github,
      profile?.portfolio,
    ].filter(Boolean);

    if (contactLines.length > 0) {
      doc.font('Helvetica').fontSize(10.5).fillColor('#475569').text(contactLines.join(' | '), headerX, 104, {
        width: 380,
      });
    }

    doc.moveDown(3.5);

    if (profile?.resume) {
      drawSectionTitle(doc, 'Profil');
      doc.font('Helvetica').fontSize(11).fillColor('#334155').text(profile.resume, {
        lineGap: 4,
      });
    }

    if (experiences.length > 0) {
      drawSectionTitle(doc, 'Experiences');
      experiences.forEach((experience) => {
        const dates = `${experience.dateDebut?.toISOString?.().split('T')[0] || ''} - ${
          experience.enCours ? 'Present' : experience.dateFin?.toISOString?.().split('T')[0] || ''
        }`;
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text(experience.poste || '');
        doc.font('Helvetica').fontSize(10.5).fillColor('#2563eb').text(`${experience.entreprise || ''} | ${dates}`);
        if (experience.description) {
          doc.moveDown(0.25);
          doc.font('Helvetica').fontSize(10.5).fillColor('#334155').text(experience.description, {
            lineGap: 3,
          });
        }
        if (experience.competences?.length) {
          doc.moveDown(0.25);
          doc.font('Helvetica').fontSize(10).fillColor('#475569').text(`Competences: ${experience.competences.join(', ')}`);
        }
        doc.moveDown(0.9);
      });
    }

    if (formations.length > 0) {
      drawSectionTitle(doc, 'Formations');
      formations.forEach((formation) => {
        const dates = `${formation.dateDebut?.toISOString?.().split('T')[0] || ''} - ${
          formation.enCours ? 'Present' : formation.dateFin?.toISOString?.().split('T')[0] || ''
        }`;
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text(formation.diplome || '');
        doc.font('Helvetica').fontSize(10.5).fillColor('#7c3aed').text(`${formation.etablissement || ''} | ${dates}`);
        if (formation.specialite) {
          doc.font('Helvetica').fontSize(10.5).fillColor('#475569').text(formation.specialite);
        }
        if (formation.description) {
          doc.moveDown(0.25);
          doc.font('Helvetica').fontSize(10.5).fillColor('#334155').text(formation.description, {
            lineGap: 3,
          });
        }
        doc.moveDown(0.9);
      });
    }

    if (skills.length > 0) {
      drawSectionTitle(doc, 'Competences');
      drawBulletList(doc, skills, (skill) => `${skill.nom}${skill.niveau ? ` - ${skill.niveau}` : ''}${skill.categorie ? ` (${skill.categorie})` : ''}`);
    }

    if (languages.length > 0) {
      drawSectionTitle(doc, 'Langues');
      drawBulletList(doc, languages, (language) => `${language.nom} - ${language.niveau}`);
    }

    doc.end();
  });

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

    const jobOffer = await JobOffer.findOne({ _id: jobOfferId, user: req.userId });
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

    const jobOffer = await JobOffer.findOne({ _id: jobOfferId, user: req.userId });
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

    const jobOffer = await JobOffer.findOne({ _id: jobOfferId, user: req.userId });
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

exports.downloadCvPdf = async (req, res) => {
  try {
    const { profile, experiences, formations, skills, languages } = await getUserData(req.userId);

    if (!profile) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }

    const pdfBuffer = await buildCvPdf({ profile, experiences, formations, skills, languages });
    const fileName = `cv-${[profile.user?.prenom, profile.user?.nom].filter(Boolean).join('-').toLowerCase() || 'manager'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('downloadCvPdf ERROR:', error.message, error.stack);
    res.status(500).json({ message: 'Erreur PDF', error: error.message });
  }
};
