const express = require('express');
const router = express.Router();
const jobOfferController = require('../controllers/jobOfferV2.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', jobOfferController.getAll);
router.get('/applications/mine', jobOfferController.getMyApplications);
router.post('/:id/apply', jobOfferController.applyToOffer);
router.post('/:id/ai-application-message', jobOfferController.generateApplicationDraft);
router.patch('/applications/:id/status', jobOfferController.updateApplicationStatus);
router.post('/', jobOfferController.create);
router.put('/:id', jobOfferController.update);
router.delete('/:id', jobOfferController.remove);

module.exports = router;
