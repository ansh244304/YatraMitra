import express from 'express';
import { auth } from '../middleware/auth.js';
import * as tripController from '../controllers/tripController.js';

const router = express.Router();

router.get('/', auth, tripController.list);
router.post('/', auth, tripController.create);
router.delete('/:id', auth, tripController.remove);

export default router;
