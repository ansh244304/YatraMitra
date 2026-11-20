
import { Item } from '../models/Item.js';

// Convert database item into review format
function formatReview(item) {
  return {
    id: item._id,
    ...item.data,
    createdAt: item.createdAt
  };
}

// 1. Get all reviews
export async function list(req, res) {
  try {
    const filter = { type: 'review' };

    if (req.query.destinationKey) {
      filter['data.destinationKey'] = req.query.destinationKey;
    }

    const reviews = await Item.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      items: reviews.map(formatReview)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 2. Add a new review
export async function add(req, res) {
  try {
    const {
      destinationKey,
      destinationName,
      rating,
      comment,
      photos
    } = req.body;

    if (!destinationKey || !rating) {
      return res.status(400).json({
        error: 'Destination and rating are required.'
      });
    }

    // Check whether user already reviewed this destination
    const existing = await Item.findOne({
      userId: req.userId,
      type: 'review',
      'data.destinationKey': destinationKey,
      'data.source': 'user'
    });

    if (existing) {
      return res.status(409).json({
        error: 'You already reviewed this destination.'
      });
    }

    // Save review
    const review = await Item.create({
      userId: req.userId,
      type: 'review',
      name: destinationName || destinationKey,

      data: {
        destinationKey,
        destinationName: destinationName || '',
        rating: Number(rating),
        comment: comment || '',
        photos: photos || [],
        source: 'user',
        userName: req.user.name,
        userId: String(req.user._id)
      }
    });

    res.status(201).json({
      item: formatReview(review)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 3. Update a review
export async function update(req, res) {
  try {
    const review = await Item.findOne({
      _id: req.params.id,
      userId: req.userId,
      type: 'review'
    });

    if (!review) {
      return res.status(404).json({
        error: 'Review not found.'
      });
    }

    review.data.rating = Number(req.body.rating);
    review.data.comment = req.body.comment || '';
    review.data.photos = req.body.photos || [];

    await review.save();

    res.json({
      item: formatReview(review)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 4. Delete a review
export async function remove(req, res) {
  try {
    const review = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
      type: 'review'
    });

    if (!review) {
      return res.status(404).json({
        error: 'Review not found.'
      });
    }

    res.json({
      ok: true,
      message: 'Review deleted successfully.'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
