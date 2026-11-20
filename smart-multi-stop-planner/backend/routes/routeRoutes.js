import express from 'express';
import { auth } from '../middleware/auth.js';
import * as routeController from '../controllers/routeController.js';

const router = express.Router();

router.post('/compare', auth, routeController.compare);

export default router;
