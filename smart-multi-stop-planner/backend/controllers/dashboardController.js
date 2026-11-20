import { Item } from '../models/Item.js';

function shape(item) {
  return { _id: item._id, ...item.data, createdAt: item.createdAt, updatedAt: item.updatedAt };
}

function tripShape(item) {
  return {
    id: String(item._id),
    name: item.name,
    savedAt: item.data.savedAt || item.createdAt,
    ...item.data,
  };
}

export async function getDashboard(req, res) {
  try {
    const items = await Item.find({ userId: req.userId }).sort({ createdAt: -1 });

    const trips = items.filter((item) => item.type === 'trip').map(tripShape);
    const wishlist = items.filter((item) => item.type === 'wishlist').map(shape);
    const history = items.filter((item) => item.type === 'history').map(shape);
    const searches = items.filter((item) => item.type === 'search').map(shape);
    const reviews = items.filter((item) => item.type === 'review').map(shape);
    const packing = items.filter((item) => item.type === 'packing').map(shape);
    const notifications = items
      .filter((item) => item.type === 'notification' && !item.data.read)
      .map(shape);

    const monthly = {};
    let totalSpent = 0;
    const countries = new Set();

    history.forEach((item) => {
      const spent = Number(item.expenses) || 0;
      const date = item.startDate || item.createdAt;
      if (date) {
        const month = new Date(date).toISOString().slice(0, 7);
        monthly[month] = (monthly[month] || 0) + spent;
      }
      totalSpent += spent;
      if (item.country) countries.add(String(item.country).toLowerCase().trim());
    });

    return res.json({
      stats: {
        totalTrips: trips.length,
        totalWishlist: wishlist.length,
        totalHistory: history.length,
        totalReviews: reviews.length,
      },
      analytics: {
        totalSpent,
        countriesVisited: countries.size,
        monthlyExpenses: Object.entries(monthly)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, amount]) => ({ month, amount })),
      },
      trips,
      wishlist,
      history,
      searches,
      reviews,
      packing,
      notifications,
      user: {
        id: String(req.user._id),
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not load dashboard.' });
  }
}

export async function listSearches(req, res) {
  try {
    const items = await Item.find({ userId: req.userId, type: 'search' })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.json({ items: items.map(shape) });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not load searches.' });
  }
}

export async function addSearch(req, res) {
  try {
    const { query, filters = {} } = req.body || {};
    if (!query) return res.status(400).json({ error: 'query is required.' });

    const item = await Item.create({
      userId: req.userId,
      type: 'search',
      name: String(query),
      data: { query, filters },
    });
    return res.status(201).json({ item: shape(item) });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not save search.' });
  }
}

export async function listNotifications(req, res) {
  try {
    const items = await Item.find({ userId: req.userId, type: 'notification' })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ items: items.map(shape) });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not load notifications.' });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.userId, type: 'notification' });
    if (!item) return res.status(404).json({ error: 'Notification not found.' });

    item.data.read = true;
    await item.save();
    return res.json({ item: shape(item) });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not update notification.' });
  }
}
