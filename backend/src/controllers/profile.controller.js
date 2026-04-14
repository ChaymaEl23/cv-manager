const Profile = require('../models/profile.model');
const fs = require('fs');
const path = require('path');

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { titreProfessionnel, resume, telephone, adresse, linkedIn, github, portfolio, photoUrl } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { user: req.userId },
      { titreProfessionnel, resume, telephone, adresse, linkedIn, github, portfolio, photoUrl },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image envoyee' });
    }

    const newPhotoUrl = `/uploads/profiles/${req.file.filename}`;
    const existingProfile = await Profile.findOne({ user: req.userId });

    if (existingProfile?.photoUrl && existingProfile.photoUrl.startsWith('/uploads/')) {
      const previousPhotoPath = path.join(__dirname, '../../', existingProfile.photoUrl.replace(/^\//, ''));
      fs.unlink(previousPhotoPath, () => {});
    }

    const profile = await Profile.findOneAndUpdate(
      { user: req.userId },
      { photoUrl: newPhotoUrl },
      { new: true, upsert: true }
    );

    res.json({ message: 'Photo mise a jour', photoUrl: profile.photoUrl });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};