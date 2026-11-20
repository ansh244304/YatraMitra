
import { Item } from '../models/Item.js';

// Get all history
export async function list(req, res) {
  try {
    const items = await Item.find({
      userId: req.userId,
      type: 'history'
    }).sort({ createdAt: -1 });

    res.json({ items });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add history
export async function add(req, res) {
  try {
    const { destination } = req.body;

    if (!destination) {
      return res.status(400).json({
        message: 'Destination is required'
      });
    }

    const item = await Item.create({
      userId: req.userId,
      type: 'history',
      name: destination,
      data: req.body
    });

    res.status(201).json({
      message: 'History added successfully',
      item
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update history
export async function update(req, res) {
  try {
    const item = await Item.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
        type: 'history'
      },
      {
        name: req.body.destination,
        data: req.body
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        message: 'History not found'
      });
    }

    res.json({
      message: 'History updated successfully',
      item
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Delete one history
export async function remove(req, res) {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
      type: 'history'
    });

    if (!item) {
      return res.status(404).json({
        message: 'History not found'
      });
    }

    res.json({ message: 'History deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
