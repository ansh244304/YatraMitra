import express from 'express';
import { auth } from '../middleware/auth.js';
import * as historyController from '../controllers/historyController.js';

const router = express.Router();

router.get('/', auth, historyController.list);
router.post('/', auth, historyController.add);
router.put('/:id', auth, historyController.update);
router.delete('/:id', auth, historyController.remove);

export default router;
