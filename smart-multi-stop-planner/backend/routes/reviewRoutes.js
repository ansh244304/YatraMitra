import express from 'express';
import { auth } from '../middleware/auth.js';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();

router.get('/', reviewController.list);
router.post('/', auth, reviewController.add);
router.put('/:id', auth, reviewController.update);
router.delete('/:id', auth, reviewController.remove);

export default router;
