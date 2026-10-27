const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Room = require("../models/Room");

// Common Analytics Calculation Handler
const getAnalyticsData = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalRooms = await Room.countDocuments();
    
    // 🎯 Live Revenue Calculation (Excludes "Cancelled by User", "Refund Initiated", and "Cancelled")
    const revenueData = await Booking.aggregate([
      { 
        $match: { 
          bookingStatus: { 
            $nin: ["Cancelled by User", "Refund Initiated", "Cancelled"] 
          } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$totalAmount" } 
        } 
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Real-Time Occupancy Calculation based on active room flags
    const occupiedRoomsCount = await Room.countDocuments({ isBooked: true });
    const calculatedOccupancyRate = totalRooms > 0 
      ? Math.round((occupiedRoomsCount / totalRooms) * 100) 
      : 0;

    // Monthly Chart Data Generation
    const monthlyAnalytics = await Booking.aggregate([
      {
        $match: {
          bookingStatus: { 
            $nin: ["Cancelled by User", "Refund Initiated", "Cancelled"] 
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = monthlyAnalytics.map(item => ({
      name: monthNames[item._id - 1] || "Month",
      Bookings: item.bookings,
      Revenue: item.revenue
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        totalRooms,
        totalRevenue,
        occupancyRate: calculatedOccupancyRate
      },
      analytics: {
        totalEarnings: totalRevenue,
        totalBookings,
        occupiedRooms: occupiedRoomsCount,
        occupancyRate: `${calculatedOccupancyRate}%`
      },
      chartData
    });
  } catch (error) {
    console.error("❌ Analytics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Route support for both endpoints
router.get("/admin/stats", getAnalyticsData);
router.get("/", getAnalyticsData);

module.exports = router;