const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const nodemailer = require('nodemailer');

// 1. Create Booking + Nodemailer Email Confirmation
router.post('/', async (req, res) => {
  try {
    const { room, roomId, customerName, customerEmail, checkInDate, checkOutDate, adults, children, totalNights, totalAmount } = req.body;

    const targetRoomId = room || roomId;
    const emailToSave = (customerEmail || 'guest@example.com').toLowerCase().trim();

    const newBooking = new Booking({
      room: targetRoomId,
      customerName: customerName || 'Valued Guest',
      customerEmail: emailToSave,
      checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
      checkOutDate: checkOutDate ? new Date(checkOutDate) : new Date(),
      adults: Number(adults) || 1,
      children: Number(children) || 0,
      totalNights: Number(totalNights) || 1,
      totalAmount: Number(totalAmount) || 0,
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed'
    });

    await newBooking.save();
    
    // Auto Reserve Room in DB
    if (targetRoomId) {
      await Room.findByIdAndUpdate(targetRoomId, { isBooked: true });
    }

    res.status(201).json({ message: 'Booking Successful!', booking: newBooking });
  } catch (err) {
    console.error("Booking Creation Error:", err);
    res.status(500).json({ message: err.message || "Server error during reservation" });
  }
});

// 2. Get All Bookings (Populated with Room details)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('room');
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Fetch Bookings Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 3. 🎯 Universal Status Update Handler (Fixes Cancel, Refund & Admin Status Switch)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { bookingStatus: status },
      { new: true, runValidators: false }
    ).populate('room');

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking record not found' });
    }

    // 🟢 Free up room inventory if Cancelled, Checked-Out, or Refunded
    const freeingStatuses = ['Cancelled by User', 'Refund Initiated', 'Checked-Out', 'Cancelled'];
    if (freeingStatuses.includes(status) && updatedBooking.room) {
      const roomId = updatedBooking.room._id || updatedBooking.room;
      await Room.findByIdAndUpdate(roomId, { isBooked: false });
    }

    // 🔴 Re-occupy room if set back to Confirmed or Checked-In
    const occupyingStatuses = ['Confirmed', 'Checked-In', 'Occupied'];
    if (occupyingStatuses.includes(status) && updatedBooking.room) {
      const roomId = updatedBooking.room._id || updatedBooking.room;
      await Room.findByIdAndUpdate(roomId, { isBooked: true });
    }

    console.log(`✅ Booking ${bookingId} status successfully updated to: "${status}"`);
    res.status(200).json({ message: `Status updated to ${status}`, booking: updatedBooking });
  } catch (err) {
    console.error("Status Update Server Error:", err);
    res.status(500).json({ message: err.message || "Failed to update status" });
  }
});

// 4. Hard Cancel & Delete Route
router.delete('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (booking && booking.room) {
      await Room.findByIdAndUpdate(booking.room, { isBooked: false });
    }

    await Booking.findByIdAndDelete(bookingId);
    res.status(200).json({ message: 'Reservation Cancelled and Deleted!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;