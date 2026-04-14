const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/generate-resume', aiController.generateResume);
router.post('/generate-letter', aiController.generateCoverLetter);
router.post('/generate-email', aiController.generateEmail);
router.post('/adapt-to-offer', aiController.adaptToOffer);
router.post('/improve-text', aiController.improveText);
router.get('/cv-pdf', aiController.downloadCvPdf);
router.get('/documents', aiController.getDocuments);
router.get('/documents/:id', aiController.getDocument);

module.exports = router;
