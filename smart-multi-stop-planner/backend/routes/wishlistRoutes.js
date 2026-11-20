import express from 'express';
import { auth } from '../middleware/auth.js';
import * as wishlistController from '../controllers/wishlistController.js';

const router = express.Router();

router.get('/', auth, wishlistController.list);
router.post('/', auth, wishlistController.add);
router.delete('/:id', auth, wishlistController.remove);

export default router;
