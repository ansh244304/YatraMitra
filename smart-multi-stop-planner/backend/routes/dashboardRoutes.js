import express from 'express';
import { auth } from '../middleware/auth.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/', auth, dashboardController.getDashboard);

export default router;
