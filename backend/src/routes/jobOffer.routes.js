const express = require('express');
const router = express.Router();
const jobOfferController = require('../controllers/jobOffer.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', jobOfferController.getAll);
router.post('/', authMiddleware.requireRole('admin'), jobOfferController.create);
router.put('/:id', authMiddleware.requireRole('admin'), jobOfferController.update);
router.delete('/:id', authMiddleware.requireRole('admin'), jobOfferController.remove);

module.exports = router;