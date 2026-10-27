import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MENU_ITEMS = [
  { id: 1, name: 'Paneer Butter Masala & Garlic Naan', category: 'Indian', price: 450, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=80' },
  { id: 2, name: 'Heritage Special Chicken Biryani', category: 'Indian', price: 550, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80' },
  { id: 3, name: 'Woodfired Truffle Mushroom Pizza', category: 'Italian', price: 650, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80' },
  { id: 4, name: 'Classic Creamy Pasta Alfredo', category: 'Italian', price: 480, image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281288?auto=format&fit=crop&w=500&q=80' },
  { id: 5, name: 'Fresh Mango Mocktail & Cold Coffee', category: 'Beverages', price: 250, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80' },
  { id: 6, name: 'Saffron Gulab Jamun with Ice Cream', category: 'Desserts', price: 280, image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=500&q=80' }
];

const RestaurantMenu = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRoom, setUserRoom] = useState('101');
  const [selectedRoom, setSelectedRoom] = useState('101');
  const [deliveryTime, setDeliveryTime] = useState('ASAP (In 20-30 Mins)');
  const [customTime, setCustomTime] = useState('');
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [paymentMode, setPaymentMode] = useState('folio'); 
  const [viewOrdersModal, setViewOrdersModal] = useState(false);

  // Live Orders State (Initialized from Local Storage for persistence without breaking backend)
  const [roomOrders, setRoomOrders] = useState([]);

  // Load User, Assigned Booking Room, and Live Orders
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        
        // Auto-assign booked room for this specific logged-in user
        axios.get('http://localhost:5000/api/bookings')
          .then(res => {
            const userBooking = (res.data || []).find(b => 
              (b.customerEmail && b.customerEmail.toLowerCase() === parsed.email?.toLowerCase()) || 
              (b.customerName && b.customerName.toLowerCase() === parsed.name?.toLowerCase())
            );
            if (userBooking) {
              const activeRoom = userBooking.room?.roomNumber || userBooking.roomNumber || '101';
              setUserRoom(activeRoom);
              setSelectedRoom(activeRoom);
            }
          })
          .catch(() => console.log("Booking fetch fallback for room assignment"));
      } catch (e) {
        console.error("User parse error");
      }
    }

    // Load initial orders
    syncOrdersFromStorage();

    // 🔄 Auto Sync / Polling every 4 seconds to reflect real-time order updates
    const interval = setInterval(() => {
      syncOrdersFromStorage();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const syncOrdersFromStorage = () => {
    try {
      const savedOrders = localStorage.getItem('luminary_restaurant_orders');
      if (savedOrders) {
        setRoomOrders(JSON.parse(savedOrders));
      } else {
        setRoomOrders([]);
      }
    } catch (err) {
      console.error("Orders sync error", err);
    }
  };

  const saveOrdersToStorage = (updatedOrders) => {
    setRoomOrders(updatedOrders);
    localStorage.setItem('luminary_restaurant_orders', JSON.stringify(updatedOrders));
  };

  const addToCart = (item) => setCart([...cart, item]);
  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const handleOrderCheckout = async () => {
    if (cart.length === 0) {
      alert("Please add food items to tray first!");
      return;
    }

    const finalDeliveryTime = deliveryTime === 'Custom Time' ? customTime || '08:00 PM' : deliveryTime;
    const guestName = currentUser?.name || 'Guest User';
    const guestEmail = currentUser?.email || 'guest@luminary.com';

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: guestName,
      guestEmail: guestEmail,
      room: selectedRoom,
      items: cart.map(i => i.name).join(', '),
      deliveryTime: finalDeliveryTime,
      total: totalAmount,
      paymentStatus: paymentMode === 'razorpay' ? 'Paid via Razorpay' : 'Added to Room Folio (Pay at Checkout)',
      orderStatus: 'Preparing',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (paymentMode === 'razorpay') {
      alert(`⚡ Redirecting to Razorpay Gateway for ₹${totalAmount}...`);
      setTimeout(() => {
        const currentList = JSON.parse(localStorage.getItem('luminary_restaurant_orders') || '[]');
        const updated = [newOrder, ...currentList];
        saveOrdersToStorage(updated);

        alert(`🎉 Food Order Confirmed for ${guestName} (Room ${selectedRoom})!\nPaid via Razorpay.`);
        setCart([]);
      }, 800);
    } else {
      const currentList = JSON.parse(localStorage.getItem('luminary_restaurant_orders') || '[]');
      const updated = [newOrder, ...currentList];
      saveOrdersToStorage(updated);

      alert(`🍽️ Food Order Placed for ${guestName} (Room ${selectedRoom})!\n₹${totalAmount} added to Room Folio.`);
      setCart([]);
    }
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm(`Cancel Food Order ${orderId}?`)) {
      const currentList = JSON.parse(localStorage.getItem('luminary_restaurant_orders') || '[]');
      const updated = currentList.map(o => o.id === orderId ? { ...o, orderStatus: 'Cancelled' } : o);
      saveOrdersToStorage(updated);
      alert(`❌ Food Order ${orderId} has been cancelled.`);
    }
  };

  const handleUpdateStatusByAdmin = (orderId, newStatus) => {
    const currentList = JSON.parse(localStorage.getItem('luminary_restaurant_orders') || '[]');
    const updated = currentList.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o);
    saveOrdersToStorage(updated);
  };

  const filteredItems = activeCategory === 'ALL' ? MENU_ITEMS : MENU_ITEMS.filter(i => i.category === activeCategory);

  // 🔒 STRICT ROLE-BASED PRIVACY FILTER
  // Admin/Staff sees ALL orders across all rooms.
  // Guests ONLY see their own orders (matched by Email, Name, or Assigned Room).
  const isAdminOrStaff = currentUser?.role === 'Admin' || currentUser?.role === 'Staff' || currentUser?.isAdmin;
  
  const visibleOrders = isAdminOrStaff 
    ? roomOrders 
    : roomOrders.filter(o => {
        const userEmail = (currentUser?.email || '').toLowerCase();
        const userName = (currentUser?.name || '').toLowerCase();
        const orderEmail = (o.guestEmail || '').toLowerCase();
        const orderName = (o.guestName || '').toLowerCase();

        return (userEmail && orderEmail === userEmail) || 
               (userName && orderName === userName) || 
               (o.room === userRoom);
      });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto 40px auto', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ color: '#2D3748', margin: 0, fontSize: '26px', fontWeight: '800' }}>
            🍽️ Multi-Cuisine In-Room Dining & Restaurant
          </h2>
          <p style={{ color: '#718096', margin: '4px 0 0 0', fontSize: '14px' }}>
            The Luminary Heritage Resort • Gourmet Room Dining
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {currentUser && (
            <div style={{ backgroundColor: '#EBF8FF', border: '1px solid #BEE3F8', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', color: '#2B6CB0', fontWeight: 'bold' }}>
              👤 Guest: {currentUser.name} | 🔑 Booked: Room {userRoom}
            </div>
          )}
          <button
            onClick={() => setViewOrdersModal(true)}
            style={{ padding: '10px 18px', backgroundColor: '#2B6CB0', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
            📋 {isAdminOrStaff ? 'Manage All Room Orders' : 'My Orders History'} ({visibleOrders.length})
          </button>
        </div>
      </div>

      {/* Category Bar & Room Selector */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '14px', marginBottom: '25px', display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'Indian', 'Italian', 'Beverages', 'Desserts'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeCategory === cat ? '#319795' : '#EDF2F7',
                color: activeCategory === cat ? 'white' : '#4A5568',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: '700', color: '#4A5568' }}>Delivering to:</label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            disabled={!isAdminOrStaff} // Guests are locked to their own room
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontWeight: 'bold', fontSize: '13px', backgroundColor: !isAdminOrStaff ? '#EDF2F7' : 'white' }}
          >
            {Array.from({ length: 35 }, (_, i) => {
              const rNum = 101 + i;
              return <option key={rNum} value={rNum}>Room {rNum}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr', gap: '25px' }}>
        
        {/* Menu Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '20px' }}>
          {filteredItems.map((item) => (
            <div key={item.id} style={{ backgroundColor: '#FFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                <div style={{ padding: '14px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#319795', textTransform: 'uppercase' }}>{item.category}</span>
                  <h4 style={{ margin: '4px 0 8px 0', fontSize: '15px', color: '#2D3748' }}>{item.name}</h4>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#2B6CB0' }}>₹{item.price}</div>
                </div>
              </div>

              <div style={{ padding: '0 14px 14px 14px' }}>
                <button
                  onClick={() => addToCart(item)}
                  style={{ width: '100%', padding: '9px', backgroundColor: '#319795', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                >
                  + Add to Tray
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Tray Panel */}
        <div style={{ backgroundColor: '#FFF', padding: '22px', borderRadius: '18px', border: '1px solid #E2E8F0', height: 'fit-content', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#2D3748', fontSize: '17px', borderBottom: '2px solid #F7FAFC', paddingBottom: '10px', fontWeight: '800' }}>
            🛒 Room {selectedRoom} Order Tray
          </h3>

          {cart.length === 0 ? (
            <p style={{ color: '#A0AEC0', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Your tray is empty.</p>
          ) : (
            <div>
              <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '15px' }}>
                {cart.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px dashed #E2E8F0', fontSize: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#2D3748' }}>{c.name}</div>
                      <div style={{ color: '#319795', fontWeight: '600' }}>₹{c.price}</div>
                    </div>
                    <button onClick={() => removeFromCart(idx)} style={{ background: 'none', border: 'none', color: '#E53E3E', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                  </div>
                ))}
              </div>

              {/* Delivery Time Selection */}
              <div style={{ marginBottom: '14px', backgroundColor: '#F7FAFC', padding: '12px', borderRadius: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '6px' }}>🕒 Delivery Preferred Time:</label>
                <select
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E0', fontSize: '12px', backgroundColor: 'white' }}
                >
                  <option value="ASAP (In 20-30 Mins)">⚡ ASAP (In 20-30 Mins)</option>
                  <option value="In 45 Mins">⏱️ In 45 Mins</option>
                  <option value="In 1 Hour">⏰ In 1 Hour</option>
                  <option value="Custom Time">📅 Choose Custom Time</option>
                </select>

                {deliveryTime === 'Custom Time' && (
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginTop: '8px', borderRadius: '6px', border: '1px solid #CBD5E0', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                )}
              </div>

              <div style={{ backgroundColor: '#EDF2F7', padding: '12px', borderRadius: '10px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#2D3748', fontSize: '15px' }}>
                  <span>Total Amount:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '6px' }}>Payment Option:</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setPaymentMode('razorpay')}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: paymentMode === 'razorpay' ? '2px solid #319795' : '1px solid #CBD5E0', backgroundColor: paymentMode === 'razorpay' ? '#E6FFFA' : 'white', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    💳 Razorpay
                  </button>
                  <button
                    onClick={() => setPaymentMode('folio')}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: paymentMode === 'folio' ? '2px solid #319795' : '1px solid #CBD5E0', backgroundColor: paymentMode === 'folio' ? '#E6FFFA' : 'white', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    🏨 Room Folio
                  </button>
                </div>
              </div>

              <button
                onClick={handleOrderCheckout}
                style={{ width: '100%', padding: '12px', backgroundColor: '#38A169', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
              >
                Place Food Order ➔
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders Monitor Modal */}
      {viewOrdersModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '20px', width: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#2D3748', fontSize: '20px', borderBottom: '2px solid #EDF2F7', paddingBottom: '10px', fontWeight: '800' }}>
              📋 {isAdminOrStaff ? 'Admin Food Orders Monitor (All Guests)' : 'My Orders & Delivery History'}
            </h3>

            {visibleOrders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#718096', padding: '30px 0' }}>No active food orders found for your account.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '15px 0' }}>
                {visibleOrders.map((ord) => (
                  <div key={ord.id} style={{ padding: '14px', border: '1px solid #E2E8F0', borderRadius: '12px', backgroundColor: '#F7FAFC', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                      <span style={{ color: '#2B6CB0', fontSize: '15px' }}>
                        👤 {ord.guestName} — Room {ord.room} ({ord.id})
                      </span>
                      
                      {/* Admin can change status; Guests see live badge */}
                      {isAdminOrStaff ? (
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateStatusByAdmin(ord.id, e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E0', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          <option value="Preparing">🍳 Preparing</option>
                          <option value="Out for Delivery">🚚 Out for Delivery</option>
                          <option value="Delivered">🟢 Delivered</option>
                          <option value="Cancelled">🔴 Cancelled</option>
                        </select>
                      ) : (
                        <span style={{ color: ord.orderStatus === 'Cancelled' ? '#E53E3E' : '#38A169', backgroundColor: ord.orderStatus === 'Cancelled' ? '#FFF5F5' : '#E6FFFA', padding: '3px 10px', borderRadius: '20px', fontSize: '11px' }}>
                          Status: {ord.orderStatus}
                        </span>
                      )}
                    </div>

                    <div style={{ color: '#4A5568', margin: '6px 0' }}>
                      🍔 <strong>Items Ordered:</strong> {ord.items}<br/>
                      ⏰ <strong>Delivery Time:</strong> {ord.deliveryTime}<br/>
                      💰 <strong>Payment Mode:</strong> {ord.paymentStatus}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px dashed #CBD5E0', paddingTop: '8px' }}>
                      <span style={{ fontWeight: '800', color: '#2D3748', fontSize: '15px' }}>Total Bill: ₹{ord.total}</span>
                      
                      {ord.orderStatus !== 'Cancelled' && ord.orderStatus !== 'Delivered' && (
                        <button
                          onClick={() => handleCancelOrder(ord.id)}
                          style={{ padding: '6px 12px', backgroundColor: '#FFF5F5', color: '#E53E3E', border: '1px solid #FEB2B2', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                        >
                          ❌ Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setViewOrdersModal(false)} style={{ padding: '12px', backgroundColor: '#E2E8F0', color: '#4A5568', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '13px' }}>
              Close Monitor
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RestaurantMenu;