const JobOffer = require('../models/jobOffer.model');

exports.getAll = async (req, res) => {
  try {
    const offers = await JobOffer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const offer = await JobOffer.create({ ...req.body, user: req.userId });
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const offer = await JobOffer.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!offer) return res.status(404).json({ message: 'Non trouvé' });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const offer = await JobOffer.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!offer) return res.status(404).json({ message: 'Non trouvé' });
    res.json({ message: 'Supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};