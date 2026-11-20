
import crypto from 'crypto';
import { Item } from '../models/Item.js';

// Get all bookings
export async function list(req, res) {
  try {
    const bookings = await Item.find({
      userId: req.userId,
      type: 'booking'
    }).sort({ createdAt: -1 });

    res.json({ bookings });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Create booking
export async function create(req, res) {
  try {
    const {
      hotelName,
      checkIn,
      checkOut,
      pricePerNight,
      rooms,
      guests
    } = req.body;

    if (!hotelName || !checkIn || !checkOut) {
      return res.status(400).json({
        message: 'Please fill all required fields'
      });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (isNaN(start) || isNaN(end) || nights < 1) {
      return res.status(400).json({
        message: 'Invalid booking dates'
      });
    }

    const price = Number(pricePerNight) || 0;
    const roomCount = Number(rooms) || 1;

    const booking = await Item.create({
      userId: req.userId,
      type: 'booking',
      name: hotelName,
      data: {
        hotelName,
        checkIn: start,
        checkOut: end,
        nights,
        rooms: roomCount,
        guests: Number(guests) || 1,
        pricePerNight: price,
        totalPrice: price * nights * roomCount,
        reference: 'YM-' + Date.now(),
        status: 'confirmed'
      }
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Cancel booking
export async function cancel(req, res) {
  try {
    const booking = await Item.findOne({
      _id: req.params.id,
      userId: req.userId,
      type: 'booking'
    });

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    booking.data.status = 'cancelled';

    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
