const Profile = require('../models/profile.model');

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
    const { titreProfessionnel, resume, telephone, adresse, linkedIn, github, portfolio, photo } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { user: req.userId },
      { titreProfessionnel, resume, telephone, adresse, linkedIn, github, portfolio, photo },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
