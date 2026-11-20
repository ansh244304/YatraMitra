
import { Item } from '../models/Item.js';

// Convert database item into trip format
function formatTrip(item) {
  return {
    id: String(item._id),
    name: item.name,
    ...item.data,
    savedAt: item.data.savedAt || item.createdAt
  };
}

// 1. Get all saved trips
export async function list(req, res) {
  try {
    const trips = await Item.find({
      userId: req.userId,
      type: 'trip'
    })
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      trips: trips.map(formatTrip)
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

// 2. Create a new trip
export async function create(req, res) {
  try {
    const { name, ...data } = req.body || {};

    if (!name) {
      return res.status(400).json({
        error: 'Trip name is required.'
      });
    }

    const trip = await Item.create({
      userId: req.userId,
      type: 'trip',
      name: String(name),
      data
    });

    res.status(201).json({
      trip: formatTrip(trip)
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

// 3. Delete a trip
export async function remove(req, res) {
  try {
    const trip = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
      type: 'trip'
    });

    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found.'
      });
    }

    res.json({
      ok: true,
      message: 'Trip deleted successfully.'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
