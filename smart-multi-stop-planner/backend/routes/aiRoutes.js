import express from 'express';
import { auth } from '../middleware/auth.js';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

router.post('/plan', auth, aiController.plan);

export default router;
