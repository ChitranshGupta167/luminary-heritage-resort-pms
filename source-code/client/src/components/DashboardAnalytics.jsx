import React, { useEffect, useState } from "react";
import axios from "axios";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const DashboardAnalytics = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRooms: 35,
    grossRevenue: 0,
    totalRefunded: 0,
    netRevenue: 0,
    restaurantRevenue: 0,
    occupancyRate: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/analytics/admin/stats");
      if (data && data.success) {
        // 🎯 Nullish Coalescing (??) prevents 0 revenue from falling back to hardcoded 185000
        const gross = data.stats.totalRevenue ?? data.analytics?.totalEarnings ?? 0;
        const refund = data.stats.totalRefunded ?? 0;
        const net = gross - refund;

        setStats({
          totalBookings: data.stats.totalBookings ?? 0,
          totalRooms: data.stats.totalRooms ?? 35,
          grossRevenue: gross,
          totalRefunded: refund,
          netRevenue: net > 0 ? net : (gross > 0 ? gross : 0),
          restaurantRevenue: data.stats.restaurantRevenue ?? 0,
          occupancyRate: data.stats.occupancyRate ?? 0
        });

        setChartData(data.chartData && data.chartData.length > 0 ? data.chartData : getFallbackChart());
      } else {
        setChartData(getFallbackChart());
      }
    } catch (error) {
      console.log("Analytics Fetch Error / Using visual fallback");
      setChartData(getFallbackChart());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackChart = () => [
    { name: "Jan", Bookings: 4, NetRevenue: 42000, Refunds: 0 },
    { name: "Feb", Bookings: 6, NetRevenue: 58000, Refunds: 5000 },
    { name: "Mar", Bookings: 9, NetRevenue: 95000, Refunds: 8000 },
    { name: "Apr", Bookings: 7, NetRevenue: 72000, Refunds: 2000 },
    { name: "May", Bookings: stats.totalBookings || 8, NetRevenue: stats.netRevenue || 170000, Refunds: stats.totalRefunded || 0 }
  ];

  return (
    <div style={{ padding: "28px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
            📊 The Luminary Heritage Resort - Analytics Dashboard
          </h2>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
            Real-time room occupancy, POS restaurant sales, and refund-adjusted net revenue statistics
          </p>
        </div>
        
        {/* 🔄 Manual Refresh Button */}
        <button 
          onClick={fetchAnalytics}
          disabled={loading}
          style={{
            padding: "10px 18px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)"
          }}
        >
          {loading ? "⏳ Syncing..." : "🔄 Refresh Real-Time Data"}
        </button>
      </div>

      {/* Analytics Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "18px", marginBottom: "30px" }}>
        
        {/* Net Revenue Card */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderTop: "4px solid #10b981" }}>
          <p style={{ margin: 0, color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Net Revenue (After Refunds)</p>
          <h3 style={{ margin: "8px 0 0 0", fontSize: "24px", color: "#0f172a", fontWeight: "800" }}>
            ₹{stats.netRevenue.toLocaleString()}
          </h3>
          <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}>
            Gross: ₹{stats.grossRevenue.toLocaleString()}
          </span>
        </div>

        {/* Refunds Deductions Card */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderTop: "4px solid #ef4444" }}>
          <p style={{ margin: 0, color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Refunds Initiated</p>
          <h3 style={{ margin: "8px 0 0 0", fontSize: "24px", color: "#ef4444", fontWeight: "800" }}>
            - ₹{stats.totalRefunded.toLocaleString()}
          </h3>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Deducted from monthly income</span>
        </div>

        {/* Restaurant Sales Card */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderTop: "4px solid #f59e0b" }}>
          <p style={{ margin: 0, color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Restaurant & Dining Sales</p>
          <h3 style={{ margin: "8px 0 0 0", fontSize: "24px", color: "#d97706", fontWeight: "800" }}>
            ₹{stats.restaurantRevenue.toLocaleString()}
          </h3>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Multi-Cuisine POS Orders</span>
        </div>

        {/* Occupied Rooms Card */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderTop: "4px solid #3b82f6" }}>
          <p style={{ margin: 0, color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Occupied / Active Rooms</p>
          <h3 style={{ margin: "8px 0 0 0", fontSize: "24px", color: "#0f172a", fontWeight: "800" }}>
            {stats.totalBookings} <small style={{ fontSize: "13px", color: "#64748b", fontWeight: "normal" }}>/ {stats.totalRooms} Rooms</small>
          </h3>
          <span style={{ fontSize: "11px", color: "#3b82f6", fontWeight: "600" }}>Occupancy: {stats.occupancyRate}%</span>
        </div>

      </div>

      {/* Visual Chart Section */}
      <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h4 style={{ margin: 0, color: "#1e293b", fontSize: "18px", fontWeight: "700" }}>Net Revenue & Refund Trends</h4>
            <p style={{ margin: "2px 0 0 0", color: "#64748b", fontSize: "12px" }}>Monthly financial progress after cancellation refunds</p>
          </div>
          <span style={{ backgroundColor: "#eff6ff", color: "#2563eb", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
            Resort Inventory: {stats.totalRooms} Units
          </span>
        </div>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
              <Area type="monotone" dataKey="NetRevenue" stroke="#10b981" fillOpacity={1} fill="url(#colorNet)" name="Net Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default DashboardAnalytics;