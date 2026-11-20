import express from 'express';
import authRoutes from './authRoutes.js';
import destinationRoutes from './destinationRoutes.js';
import tripRoutes from './tripRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import historyRoutes from './historyRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import searchHistoryRoutes from './searchHistoryRoutes.js';
import packingRoutes from './packingRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import aiRoutes from './aiRoutes.js';
import routeRoutes from './routeRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/destinations', destinationRoutes);
router.use('/trips', tripRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/history', historyRoutes);
router.use('/reviews', reviewRoutes);
router.use('/search-history', searchHistoryRoutes);
router.use('/packing', packingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/bookings', bookingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);
router.use('/routes', routeRoutes);

export default router;
