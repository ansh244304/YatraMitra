
import { Item } from '../models/Item.js';

// Generate packing items
function makePackingItems(category, weather) {

  const basicItems = [
    'ID/Passport',
    'Wallet',
    'Phone and charger',
    'Power bank',
    'Medicines',
    'Toiletries'
  ];

  const categoryItems = {
    mountain: ['Warm jacket', 'Hiking shoes', 'Gloves', 'Sunscreen'],
    beach: ['Sunglasses', 'Swimwear', 'Beach footwear', 'Hat'],
    adventure: ['First-aid kit', 'Flashlight', 'Snacks', 'Rain jacket'],
    cold: ['Winter jacket', 'Woollen socks', 'Scarf'],
    religious: ['Modest clothes', 'Scarf', 'Comfortable footwear']
  };

  let extraItems = [];

  if (weather.toLowerCase().includes('rain')) {
    extraItems.push('Umbrella', 'Raincoat');
  }

  if (weather.toLowerCase().includes('hot')) {
    extraItems.push('Light clothes', 'Water bottle');
  }

  if (weather.toLowerCase().includes('cold')) {
    extraItems.push('Warm clothes', 'Gloves');
  }

  const selectedItems = categoryItems[category.toLowerCase()] || [];

  const allItems = [
    ...new Set([...basicItems, ...selectedItems, ...extraItems])
  ];

  return allItems.map(name => ({
    name,
    packed: false
  }));
}

// Get all packing lists
export async function list(req, res) {
  try {
    const items = await Item.find({
      userId: req.userId,
      type: 'packing'
    });

    res.json({ items });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Generate packing list
export async function generate(req, res) {
  try {
    const { destination, category, days, weather, tripId } = req.body;

    const items = makePackingItems(category || '', weather || '');

    const packingList = await Item.create({
      userId: req.userId,
      type: 'packing',
      name: destination || '',
      data: {
        destination,
        days,
        tripId,
        items
      }
    });

    res.status(201).json({
      message: 'Packing list generated',
      packingList
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add packing list manually
export async function add(req, res) {
  try {
    const packingList = await Item.create({
      userId: req.userId,
      type: 'packing',
      name: req.body.destination || '',
      data: req.body
    });

    res.status(201).json({
      message: 'Packing list added',
      packingList
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update packing list
export async function update(req, res) {
  try {
    const packingList = await Item.findOne({
      _id: req.params.id,
      userId: req.userId,
      type: 'packing'
    });

    if (!packingList) {
      return res.status(404).json({
        message: 'Packing list not found'
      });
    }

    packingList.data = {
      ...packingList.data,
      ...req.body
    };

    await packingList.save();

    res.json({
      message: 'Packing list updated',
      packingList
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Delete packing list
export async function remove(req, res) {
  try {
    const packingList = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
      type: 'packing'
    });

    if (!packingList) {
      return res.status(404).json({
        message: 'Packing list not found'
      });
    }

    res.json({ message: 'Packing list deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
