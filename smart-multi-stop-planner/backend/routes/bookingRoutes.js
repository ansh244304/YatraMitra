import express from 'express';
import { auth } from '../middleware/auth.js';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', auth, bookingController.list);
router.post('/', auth, bookingController.create);
router.delete('/:id', auth, bookingController.cancel);

export default router;
