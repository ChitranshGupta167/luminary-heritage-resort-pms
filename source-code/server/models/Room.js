const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: true, 
    unique: true // उदाहरण: '101', '102', 'SUITE-301'
  },
  floorNumber: { 
    type: Number, 
    required: true // उदाहरण: 1, 2, 3, 4
  },
  category: { 
    type: String, 
    enum: [
      'Deluxe Garden View', 
      'Executive Heritage Suite', 
      'Presidential Palm Villa', 
      'Royal Family Suite'
    ],
    required: true 
  },
  pricePerNight: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    default: 'Luxury accommodation at The Luminary Heritage Resort with world-class amenities.' 
  },
  status: { 
    type: String, 
    enum: ['Available', 'Occupied', 'Dirty', 'Maintenance'],
    default: 'Available' 
  },
  image: { 
    type: String, 
    required: true 
  },
  maxAdults: { 
    type: Number, 
    default: 2 
  },
  maxChildren: { 
    type: Number, 
    default: 1 
  },
  amenities: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);