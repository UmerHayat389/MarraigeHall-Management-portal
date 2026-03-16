const express = require('express');
const router = express.Router();
const Dish = require('../models/Dish.model');

// Get all dishes
router.get('/', async (req, res) => {
  try {
    const dishes = await Dish.find().sort({ category: 1, name: 1 });
    res.json({ dishes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single dish by ID
router.get('/:id', async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json({ dish });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new dish
router.post('/', async (req, res) => {
  try {
    const { name, category, description, image } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required' });
    }

    const dish = new Dish({
      name,
      category,
      description: description || '',
      image: image || '',
    });

    await dish.save();
    res.status(201).json({ dish, message: 'Dish created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update dish
router.put('/:id', async (req, res) => {
  try {
    const { name, category, description, image } = req.body;

    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    if (name) dish.name = name;
    if (category) dish.category = category;
    if (description !== undefined) dish.description = description;
    if (image !== undefined) dish.image = image;

    await dish.save();
    res.json({ dish, message: 'Dish updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete dish
router.delete('/:id', async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    await dish.deleteOne();
    res.json({ message: 'Dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;