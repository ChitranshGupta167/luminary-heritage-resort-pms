import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import RoomList from './components/RoomList.jsx';
import AddRoom from './components/AddRoom.jsx';
import BookingList from './components/BookingList.jsx';
import Login from './components/Login.jsx';
import DashboardAnalytics from './components/DashboardAnalytics.jsx';
import RestaurantMenu from './components/RestaurantMenu.jsx';
import GuestHelpdesk from './components/GuestHelpdesk.jsx';
import MyBookings from './components/MyBookings.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleRoomAdded = () => {
    setRefreshKey((prev) => prev + 1);
    navigate('/');
  };

  return (
    <div className="App" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Dynamic Navbar */}
      <div style={{
        backgroundColor: '#1E293B',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '20px', fontWeight: '700' }}>
          🏰 The Luminary Heritage Resort
        </h2>

        <div style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#F8FAFC', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
            🏨 Rooms
          </Link>

          <Link to="/restaurant" style={{ color: '#FBBF24', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
            🍽️ Restaurant
          </Link>

          <Link to="/help" style={{ color: '#F472B6', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
            🆘 Help & Support
          </Link>

          {/* Guest Personal Dashboard */}
          {user && user.role === 'Guest' && (
            <Link to="/my-bookings" style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
              🧳 My Bookings
            </Link>
          )}

          {/* Admin / Staff Navigation Links */}
          {user && (user.role === 'Admin' || user.role === 'Staff') && (
            <>
              <Link to="/add-room" style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                ➕ Add Room
              </Link>
              <Link to="/bookings" style={{ color: '#FB923C', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                📋 All Bookings
              </Link>
              <Link to="/analytics" style={{ color: '#4ADE80', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                📊 Analytics
              </Link>
            </>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#94A3B8', fontSize: '13px' }}>
                👤 {user.name} <strong style={{ color: '#38BDF8' }}>({user.role})</strong>
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                padding: '7px 16px',
                backgroundColor: '#38BDF8',
                color: '#0F172A',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* Main Routes Container */}
      <div style={{ padding: '30px 20px' }}>
        <Routes>
          <Route path="/" element={<RoomList key={refreshKey} />} />
          <Route path="/restaurant" element={<RestaurantMenu />} />
          <Route path="/help" element={<GuestHelpdesk />} />
          <Route path="/my-bookings" element={user ? <MyBookings /> : <Navigate to="/login" />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
          <Route 
            path="/add-room" 
            element={user && (user.role === 'Admin' || user.role === 'Staff') ? <AddRoom onRoomAdded={handleRoomAdded} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/bookings" 
            element={user && (user.role === 'Admin' || user.role === 'Staff') ? <BookingList /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/analytics" 
            element={user && (user.role === 'Admin' || user.role === 'Staff') ? <DashboardAnalytics /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;