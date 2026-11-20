
import { seedDestinations } from '../data/destinations.js';
import { Item } from '../models/Item.js';

const CATEGORY_LABELS = {
  adventure: 'Adventure',
  historical: 'Historical',
  nature: 'Nature',
  religious: 'Religious',
  beach: 'Beach',
  entertainment: 'Entertainment',
  viewpoint: 'Viewpoint',
  food: 'Food & Drink',
  romantic: 'Romantic',
  wildlife: 'Wildlife',
  shopping: 'Shopping',
  city: 'City Break',
};

const BUDGET_OPTIONS = [
  { key: 'budget', label: 'Budget', range: 'Up to Rs 3,500 / day' },
  { key: 'mid', label: 'Mid-range', range: 'Rs 3,500 - 8,000 / day' },
  { key: 'premium', label: 'Premium', range: 'Rs 8,000 - 15,000 / day' },
  { key: 'luxury', label: 'Luxury', range: 'Rs 15,000+ / day' },
];

const SORT_OPTIONS = [
  { key: 'relevance', label: 'Best match' },
  { key: 'popularity', label: 'Most popular' },
  { key: 'rating', label: 'Top rated' },
  { key: 'trending', label: 'Trending now' },
  { key: 'budget_low', label: 'Budget: low to high' },
  { key: 'budget_high', label: 'Budget: high to low' },
  { key: 'name', label: 'Name A-Z' },
];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function categoryLabel(key) {
  return CATEGORY_LABELS[key] || (key ? key[0].toUpperCase() + key.slice(1) : 'Destination');
}

function formatDestination(place) {
  const dailyBudget = Number(place.dailyBudget) || 0;
  const duration = Number(place.idealDurationDays) || 0;
  const location = place.location || {};
  const lat = Number(location.lat);
  const lon = Number(location.lon);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lon);

  return {
    ...place,
    image: place.images?.[0] || '',
    categoryLabel: categoryLabel(place.category),
    budgetLabel: BUDGET_OPTIONS.find((option) => option.key === place.budgetTier)?.label || 'Flexible',
    lat: hasCoordinates ? lat : null,
    lon: hasCoordinates ? lon : null,
    maps: hasCoordinates
      ? {
          embed: `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.08}%2C${lat - 0.06}%2C${lon + 0.08}%2C${lat + 0.06}&layer=mapnik&marker=${lat}%2C${lon}`,
          link: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`,
        }
      : null,
    estimatedTripCost: dailyBudget * duration,
    budgetBreakdown: [
      { key: 'budget', label: 'Budget', perDay: Math.round(dailyBudget * 0.7), note: 'Hostels, local transport, street food' },
      { key: 'mid', label: 'Mid-range', perDay: dailyBudget, note: 'Comfortable stays and local dining' },
      { key: 'premium', label: 'Premium', perDay: Math.round(dailyBudget * 1.8), note: 'Premium stays and guided experiences' },
    ],
  };
}

function searchText(place) {
  return normalize([
    place.name,
    place.city,
    place.country,
    place.region,
    place.category,
    place.description,
    ...(place.tags || []),
    ...(place.attractions || []).map((item) => item.name),
  ].join(' '));
}

export function search(req, res) {
  try {
    let places = [...seedDestinations];
    const query = normalize(req.query.q);
    const country = normalize(req.query.country);
    const city = normalize(req.query.city);
    const category = normalize(req.query.category);
    const budget = normalize(req.query.budget);

    if (query) places = places.filter((place) => searchText(place).includes(query));
    if (country) places = places.filter((place) => normalize(place.country) === country);
    if (city) places = places.filter((place) => normalize(place.city) === city);
    if (category && category !== 'all') {
      places = places.filter((place) => normalize(place.category) === category);
    }
    if (budget && budget !== 'all') {
      places = places.filter((place) => normalize(place.budgetTier) === budget);
    }
    if (req.query.maxBudget !== undefined && req.query.maxBudget !== '') {
      const maxBudget = Number(req.query.maxBudget);
      if (Number.isFinite(maxBudget)) {
        places = places.filter((place) => Number(place.dailyBudget) <= maxBudget);
      }
    }

    const sort = normalize(req.query.sort) || 'popularity';
    if (sort === 'rating') places.sort((a, b) => b.rating - a.rating);
    else if (sort === 'trending') places.sort((a, b) => b.trendingScore - a.trendingScore);
    else if (sort === 'budget_low') places.sort((a, b) => a.dailyBudget - b.dailyBudget);
    else if (sort === 'budget_high') places.sort((a, b) => b.dailyBudget - a.dailyBudget);
    else if (sort === 'name') places.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'relevance' && query) {
      places.sort((a, b) => {
        const score = (place) => {
          if (normalize(place.name) === query) return 3;
          if (normalize(place.name).includes(query)) return 2;
          if (normalize(place.city).includes(query) || normalize(place.country).includes(query)) return 1;
          return 0;
        };
        return score(b) - score(a);
      });
    } else {
      places.sort((a, b) => b.popularity - a.popularity);
    }

    const total = places.length;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 24));
    const start = (page - 1) * limit;

    return res.json({
      total,
      results: places.slice(start, start + limit),
      page,
      limit,
      pages: Math.ceil(total / limit),
      provider: 'curated',
      note: '',
    });

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Search failed.' });
  }
}

export function autocomplete(req, res) {
  const query = normalize(req.query.q);
  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 8));
  if (!query) return res.json({ suggestions: [] });

  const suggestions = [];
  const seen = new Set();
  for (const place of seedDestinations) {
    if (searchText(place).includes(query)) {
      const suggestion = {
        type: 'destination',
        label: place.name,
        subtitle: `${place.city}, ${place.country}`,
        value: place.name,
        slug: place.slug,
        category: place.category,
      };
      suggestions.push(suggestion);
      seen.add(place.name);
    }
    for (const attraction of place.attractions || []) {
      if (normalize(attraction.name).includes(query) && !seen.has(attraction.name)) {
        suggestions.push({
          type: 'attraction',
          label: attraction.name,
          subtitle: `${place.name}, ${place.country}`,
          value: attraction.name,
          slug: place.slug,
          category: attraction.category,
        });
        seen.add(attraction.name);
      }
    }
  }

  const cities = new Map();
  const countries = new Set();
  for (const place of seedDestinations) {
    if (normalize(place.city).includes(query)) cities.set(place.city, place.country);
    if (normalize(place.country).includes(query)) countries.add(place.country);
  }
  for (const [city, country] of cities) {
    suggestions.push({ type: 'city', label: city, subtitle: country, value: city, country });
  }
  for (const country of countries) {
    suggestions.push({ type: 'country', label: country, subtitle: 'Country', value: country });
  }

  return res.json({ suggestions: suggestions.slice(0, limit) });
}

export function categories(req, res) {
  const counts = {};
  for (const place of seedDestinations) {
    counts[place.category] = (counts[place.category] || 0) + 1;
  }
  const items = Object.entries(counts)
    .map(([key, count]) => ({ key, label: categoryLabel(key), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  return res.json({ categories: items });
}

export function popular(req, res) {
  const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 8));
  const items = [...seedDestinations]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
  return res.json({ items });
}

export function trending(req, res) {
  const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 8));
  const items = [...seedDestinations]
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
  return res.json({ items });
}

// Get destination details
export function getDestination(req, res) {
  const place = seedDestinations.find(
    item => item.slug === req.params.identifier ||
    item.name.toLowerCase() === req.params.identifier.toLowerCase()
  );

  if (!place) {
    return res.status(404).json({ message: 'Destination not found' });
  }

  return res.json({ destination: formatDestination(place) });
}

// Get destination details by name
export function details(req, res) {
  const name = req.query.name || 'Destination';

  res.json({
    name,
    description: `Explore ${name} and plan your visit.`,
    weather: 'Not available',
    nearbyAttractions: [],
    nearbyRestaurants: []
  });
}

// Get attraction details
export function attraction(req, res) {
  const name = (req.query.name || '').toLowerCase();

  if (!name) {
    return res.status(400).json({ message: 'Attraction name required' });
  }

  let attraction = null;
  let destination = null;

  for (const place of seedDestinations) {
    const found = place.attractions?.find(
      item => item.name.toLowerCase().includes(name)
    );

    if (found) {
      attraction = found;
      destination = place;
      break;
    }
  }

  res.json({
    attraction: attraction || { name: req.query.name },
    destination: destination?.name || ''
  });
}

// Nearby hotels
export function nearbyHotels(req, res) {
  res.json({
    hotels: [],
    message: 'Hotel service is not available yet'
  });
}

// Get recent destinations
export async function listRecent(req, res) {
  try {
    const items = await Item.find({
      userId: req.userId,
      type: 'recent'
    }).sort({ updatedAt: -1 });

    res.json({ items });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add recent destination
export async function addRecent(req, res) {
  try {
    const { slug } = req.body;

    const place = seedDestinations.find(
      item => item.slug === slug
    );

    if (!place) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    const item = await Item.create({
      userId: req.userId,
      type: 'recent',
      name: place.name,
      data: {
        slug: place.slug,
        destinationName: place.name,
        city: place.city,
        country: place.country,
        image: place.images?.[0] || '',
        viewedAt: new Date()
      }
    });

    res.status(201).json({ item });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Remove recent destination
export async function removeRecent(req, res) {
  try {
    await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
      type: 'recent'
    });

    res.json({ message: 'Destination removed' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Clear all recent destinations
export async function clearRecent(req, res) {
  try {
    await Item.deleteMany({
      userId: req.userId,
      type: 'recent'
    });

    res.json({ message: 'Recent destinations cleared' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export function filters(req, res) {
  const countryCounts = {};
  const cityCounts = {};
  const budgetCounts = {};

  for (const place of seedDestinations) {
    countryCounts[place.country] = (countryCounts[place.country] || 0) + 1;
    const cityKey = `${place.city}|${place.country}`;
    if (!cityCounts[cityKey]) {
      cityCounts[cityKey] = { name: place.city, country: place.country, count: 0 };
    }
    cityCounts[cityKey].count += 1;
    budgetCounts[place.budgetTier] = (budgetCounts[place.budgetTier] || 0) + 1;
  }

  return res.json({
    countries: Object.entries(countryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    cities: Object.values(cityCounts).sort((a, b) => a.name.localeCompare(b.name)),
    budgets: BUDGET_OPTIONS.map((option) => ({ ...option, count: budgetCounts[option.key] || 0 })),
    sortOptions: SORT_OPTIONS,
    categories: categoriesData(),
  });
}

function categoriesData() {
  const counts = {};
  for (const place of seedDestinations) {
    counts[place.category] = (counts[place.category] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([key, count]) => ({ key, label: categoryLabel(key), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
