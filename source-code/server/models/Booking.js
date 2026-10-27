const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  adults: {
    type: Number,
    default: 1
  },
  children: {
    type: Number,
    default: 0
  },
  totalNights: {
    type: Number,
    default: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    default: 'Paid'
  },
  bookingStatus: {
    type: String,
    default: 'Confirmed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);