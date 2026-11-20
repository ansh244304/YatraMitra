
import { Item } from '../models/Item.js';

// Convert database item into wishlist format
function formatWishlist(item) {
  return {
    _id: item._id,
    ...item.data,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

// 1. Get all wishlist items
export async function list(req, res) {
  try {
    const items = await Item.find({
      userId: req.userId,
      type: 'wishlist'
    }).sort({ createdAt: -1 });

    res.json({
      items: items.map(formatWishlist)
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

// 2. Add destination to wishlist
export async function add(req, res) {
  try {
    const { destinationName, placeId = '' } = req.body || {};

    if (!destinationName) {
      return res.status(400).json({
        error: 'Destination name is required.'
      });
    }

    // Check whether destination already exists
    const filter = {
      userId: req.userId,
      type: 'wishlist'
    };

    if (placeId) {
      filter.$or = [
        { 'data.placeId': placeId },
        { 'data.destinationName': destinationName }
      ];
    } else {
      filter['data.destinationName'] = destinationName;
    }

    const existing = await Item.findOne(filter);

    if (existing) {
      return res.json({
        item: formatWishlist(existing),
        duplicate: true
      });
    }

    // Save new wishlist item
    const item = await Item.create({
      userId: req.userId,
      type: 'wishlist',
      name: destinationName,
      data: req.body || {}
    });

    res.status(201).json({
      item: formatWishlist(item)
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

// 3. Remove destination from wishlist
export async function remove(req, res) {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
      type: 'wishlist'
    });

    if (!item) {
      return res.status(404).json({
        error: 'Wishlist item not found.'
      });
    }

    res.json({
      ok: true,
      message: 'Removed from wishlist successfully.'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
