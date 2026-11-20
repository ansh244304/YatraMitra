import express from 'express';
import { auth } from '../middleware/auth.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/', auth, dashboardController.listNotifications);
router.put('/:id/read', auth, dashboardController.markNotificationRead);

export default router;
