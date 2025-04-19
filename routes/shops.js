const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// Add new shop
router.post('/add', async (req, res) => {
  try {
    const newShop = new Shop(req.body);
    await newShop.save();
    res.status(201).json({ message: 'Shop added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add shop' });
  }
});

// Get all shops OR by location
router.get('/', async (req, res) => {
  try {
    const { state, district, taluk } = req.query;
    let filter = {};

    if (state) filter.state = state;
    if (district) filter.district = district;
    if (taluk) filter.taluk = taluk;

    const shops = await Shop.find(filter).sort({ createdAt: -1 });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching shops' });
  }
});

module.exports = router;
