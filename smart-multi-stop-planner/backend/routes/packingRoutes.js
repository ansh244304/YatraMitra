import express from 'express';
import { auth } from '../middleware/auth.js';
import * as packingController from '../controllers/packingController.js';

const router = express.Router();

router.get('/', auth, packingController.list);
router.post('/', auth, packingController.add);
router.post('/generate', auth, packingController.generate);
router.put('/:id', auth, packingController.update);
router.delete('/:id', auth, packingController.remove);

export default router;
