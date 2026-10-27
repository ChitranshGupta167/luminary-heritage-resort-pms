const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const Room = require('./models/Room');
const Booking = require('./models/Booking'); // Booking Model Imported
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookings');
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// Keys load with bulletproof fallbacks
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TsdxbVf5Y2ZMS5';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '4xMNqEYDxeL3bS4eWqqgJ4T0';

// Safe Razorpay Instance Initialization
let razorpay = null;
try {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
  console.log("✅ Razorpay Initialized Successfully with Key:", RAZORPAY_KEY_ID);
} catch (rzpErr) {
  console.error("❌ Razorpay Initialization Failed:", rzpErr.message);
}

// Express Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use("/api/analytics", analyticsRoutes);

// ==========================================
// 🔄 BOOKING STATUS & REFUND BACKEND ROUTES
// ==========================================

// Update Status (Cancel by User / Check-In / Check-Out)
app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    let booking = await Booking.findByIdAndUpdate(id, { bookingStatus: status }, { new: true });
    
    if (!booking) {
      booking = await Booking.findOneAndUpdate({ _id: id }, { bookingStatus: status }, { new: true });
    }

    console.log(`✅ Booking ${id} status updated to: ${status}`);
    res.status(200).json({ success: true, message: `Status updated to ${status}`, booking });
  } catch (error) {
    console.error("❌ Status Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Refund Route
app.post('/api/bookings/:id/refund', async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount } = req.body;

    const booking = await Booking.findByIdAndUpdate(id, { bookingStatus: 'Refund Initiated' }, { new: true });

    console.log(`💸 Refund of ₹${refundAmount} initiated for Booking: ${id}`);
    res.status(200).json({ success: true, message: "Refund Initiated Successfully", booking });
  } catch (error) {
    console.error("❌ Refund Processing Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 💳 RAZORPAY PAYMENT ROUTES
// ==========================================

app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    if (!razorpay) {
      return res.status(500).json({ success: false, message: "Razorpay server instance not ready" });
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay Order Created ID:", order.id);
    res.json({ success: true, order });
  } catch (error) {
    console.error("❌ Razorpay Order Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/payment/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing required payment details" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      console.log("✅ Payment Verified Successfully for Order:", razorpay_order_id);
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      console.warn("⚠️ Invalid Signature for Order:", razorpay_order_id);
      res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("❌ Razorpay Verification Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotelpro';

const seedRoomsIfEmpty = async () => {
  try {
    const count = await Room.countDocuments();
    if (count < 30) {
      await Room.deleteMany({});
      
      const hotels = ["Taj Mahal Palace", "The Oberoi", "The Leela Palace", "ITC Grand", "JW Marriott", "Hyatt Regency"];
      const roomTypes = ["Suite", "Deluxe", "Double", "Single"];
      const images = {
        Suite: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80"
        ],
        Deluxe: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
        ],
        Double: [
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80"
        ],
        Single: [
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
        ]
      };

      const sampleRooms = [];
      for (let i = 1; i <= 32; i++) {
        const hotel = hotels[i % hotels.length];
        const type = roomTypes[i % roomTypes.length];
        const priceBase = type === 'Suite' ? 35000 : type === 'Deluxe' ? 20000 : type === 'Double' ? 10000 : 5000;
        const imageList = images[type];

        const maxAdults = type === 'Suite' ? 5 : type === 'Deluxe' ? 3 : type === 'Double' ? 2 : 1;
        const maxChildren = type === 'Suite' ? 3 : type === 'Deluxe' ? 2 : type === 'Double' ? 1 : 0;

        sampleRooms.push({
          name: `${hotel} Imperial ${type} #${i}`,
          type: type,
          price: priceBase + (i * 350),
          description: `${hotel} Resort • Luxury ${type.toLowerCase()} with scenic view, private balcony, complimentary breakfast, high-speed Wi-Fi, and 24/7 service.`,
          isBooked: false,
          image: imageList[i % imageList.length],
          maxAdults: maxAdults,
          maxChildren: maxChildren
        });
      }

      await Room.insertMany(sampleRooms);
      console.log("✅ 32 Luxury Rooms Seeded with Capacity Limits!");
    } else {
      console.log(`✅ ${count} Rooms Already Exist in DB.`);
    }
  } catch (err) {
    console.error("❌ Seeding error:", err);
  }
};

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Successfully');
    await seedRoomsIfEmpty();
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});