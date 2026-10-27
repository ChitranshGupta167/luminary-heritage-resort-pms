const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// 1. Get All Rooms (सारे रूम्स देखने के लिए)
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Add a New Room (नया रूम जोड़ने के लिए)
router.post('/add', async (req, res) => {
  const { name, type, price, description, image } = req.body;
  try {
    const newRoom = new Room({ name, type, price, description, image });
    await newRoom.save();
    res.status(201).json({ message: 'Room Added Successfully!', room: newRoom });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Test Route: Dummy Room Add करने के लिए
router.get('/seed', async (req, res) => {
  try {
    const dummyRoom = new Room({
      name: 'Deluxe Ocean View Suite',
      type: 'Deluxe',
      price: 3500,
      description: 'King size bed with beautiful ocean view, free Wi-Fi, and breakfast included.',
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32'
    });
    await dummyRoom.save();
    res.status(201).json({ message: 'Dummy Room Created Successfully!', room: dummyRoom });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;