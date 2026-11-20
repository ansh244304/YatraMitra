import express from 'express';
import { auth, optionalAuth } from '../middleware/auth.js';
import * as destinationController from '../controllers/destinationController.js';

const router = express.Router();

router.get('/search', optionalAuth, destinationController.search);
router.get('/autocomplete', destinationController.autocomplete);
router.get('/categories', destinationController.categories);
router.get('/filters', destinationController.filters);
router.get('/popular', destinationController.popular);
router.get('/trending', destinationController.trending);
router.get('/details', destinationController.details);
router.get('/attraction', destinationController.attraction);
router.get('/nearby-hotels', destinationController.nearbyHotels);
router.get('/recently-viewed', auth, destinationController.listRecent);
router.post('/recently-viewed', auth, destinationController.addRecent);
router.delete('/recently-viewed', auth, destinationController.clearRecent);
router.delete('/recently-viewed/:id', auth, destinationController.removeRecent);
router.get('/:identifier', destinationController.getDestination);

export default router;
