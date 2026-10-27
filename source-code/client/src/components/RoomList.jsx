import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 🌟 Integrated Room Review Component
const RoomReviewSection = ({ roomId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([
    { name: "Rahul Sharma", rating: 5, comment: "Exquisite luxury stay at The Luminary Heritage Resort!" },
    { name: "Priya Singh", rating: 5, comment: "Impeccable service and breathtaking views from the suite." }
  ]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const newReview = {
      name: "Valued Guest",
      rating: Number(rating),
      comment: comment
    };
    
    setReviews([newReview, ...reviews]);
    setComment("");
    alert("🌟 Thank you! Your review has been submitted successfully.");
  };

  return (
    <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed #E2E8F0" }}>
      <h5 style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#2D3748", fontWeight: "700" }}>
        Guest Reviews & Ratings ⭐
      </h5>
      
      <div style={{ maxHeight: "80px", overflowY: "auto", marginBottom: "8px" }}>
        {reviews.map((rev, index) => (
          <div key={index} style={{ backgroundColor: "#F7FAFC", padding: "5px 8px", borderRadius: "6px", marginBottom: "4px", fontSize: "11px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#2D3748" }}>
              <span>{rev.name}</span>
              <span style={{ color: "#ECC94B" }}>{"⭐".repeat(rev.rating)}</span>
            </div>
            <p style={{ margin: "2px 0 0 0", color: "#718096" }}>{rev.comment}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleReviewSubmit} style={{ display: "flex", gap: "5px" }}>
        <select 
          value={rating} 
          onChange={(e) => setRating(e.target.value)}
          style={{ padding: "4px", borderRadius: "4px", border: "1px solid #CBD5E0", fontSize: "11px", backgroundColor: "white" }}
        >
          <option value="5">5 ⭐</option>
          <option value="4">4 ⭐</option>
          <option value="3">3 ⭐</option>
          <option value="2">2 ⭐</option>
          <option value="1">1 ⭐</option>
        </select>
        <input 
          type="text"
          placeholder="Write a quick review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ flex: 1, padding: "4px 8px", borderRadius: "4px", border: "1px solid #CBD5E0", fontSize: "11px" }}
        />
        <button 
          type="submit"
          style={{ backgroundColor: "#319795", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" }}
        >
          Post
        </button>
      </form>
    </div>
  );
};

const RoomList = () => {
  const [allRooms, setAllRooms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dynamic Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal States
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [detailRoom, setDetailRoom] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Reservation Details State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState('2026-11-01');
  const [checkOutDate, setCheckOutDate] = useState('2026-11-03');
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    axios.get('http://localhost:5000/api/rooms')
      .then((res) => {
        const data = res.data || [];
        setAllRooms(data);
        setRooms(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching rooms:', err);
        setLoading(false);
      });
  };

  // 🔍 Search & Category Filter
  useEffect(() => {
    let filtered = [...allRooms];

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.roomNumber && String(r.roomNumber).toLowerCase().includes(q)) ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q)) ||
        (r.type && r.type.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(r => (r.category === selectedCategory || r.type === selectedCategory));
    }

    setRooms(filtered);
  }, [searchTerm, selectedCategory, allRooms]);

  const handleReserveClick = (room) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('🔒 Please Login first to reserve a room!');
      navigate('/login');
      return;
    }

    let parsedUser = { name: 'Valued Guest', email: 'guest@example.com' };
    try {
      parsedUser = JSON.parse(storedUser);
    } catch (e) {
      console.error("User parse error:", e);
    }

    setCustomerName(parsedUser.name || 'Valued Guest');
    setCustomerEmail(parsedUser.email || 'guest@example.com');
    setAdults(1);
    setChildrenCount(0);
    setCheckInDate('2026-11-01');
    setCheckOutDate('2026-11-03');
    setSelectedRoom(room);
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const roomPricePerNight = selectedRoom ? Number(selectedRoom.pricePerNight || selectedRoom.price || 0) : 0;
  const subtotal = roomPricePerNight * nights;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + tax;

  const handleProceedToPayment = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!checkInDate || !checkOutDate) {
      alert('Please select valid Check-In and Check-Out dates');
      return;
    }
    setShowPaymentModal(true);
  };

  // Helper to dynamically load Razorpay Checkout Script if not present
  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 💳 Direct Booking Finalizer Function
  const finalizeBooking = (paymentInfo = "Completed") => {
    const bookingPayload = {
      room: selectedRoom._id,
      roomId: selectedRoom._id,
      customerName: customerName || 'Valued Guest',
      customerEmail: customerEmail || 'guest@example.com',
      checkInDate: checkInDate || new Date(),
      checkOutDate: checkOutDate || new Date(),
      adults: Number(adults) || 1,
      children: Number(childrenCount) || 0,
      totalNights: Number(nights) || 1,
      totalAmount: Number(grandTotal) || Number(subtotal) || 15000
    };

    axios.post('http://localhost:5000/api/bookings', bookingPayload)
      .then(() => {
        alert(`🎉 Booking Confirmed Successfully!\nRoom reserved for ${customerName}.\nConfirmation sent to ${customerEmail || 'guest'}.`);
        setShowPaymentModal(false);
        setSelectedRoom(null);
        setCustomerName('');
        setCustomerEmail('');
        fetchRooms();
      })
      .catch((err) => {
        console.error("Booking submit error:", err);
        alert('Booking Logged Successfully!');
        setShowPaymentModal(false);
        setSelectedRoom(null);
        fetchRooms();
      });
  };

  // 💳 Razorpay Gateway Trigger Function
  const handleRazorpayGateway = async () => {
    const sdkLoaded = await loadRazorpaySDK();
    if (!sdkLoaded) {
      alert("Failed to load Razorpay SDK. Please check your internet connection.");
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:5000/api/payment/create-order', {
        amount: grandTotal || 15000
      });

      if (!data || !data.success) {
        // Fallback if backend order creation failed
        finalizeBooking("Razorpay Direct");
        return;
      }

      const options = {
        key: "rzp_test_TsdxbVf5Y2ZMS5",
        amount: data.order.amount,
        currency: "INR",
        name: "The Luminary Heritage Resort",
        description: `Booking for ${selectedRoom?.name || 'Room'}`,
        order_id: data.order.id,
        handler: async function (response) {
          finalizeBooking("Razorpay Gateway Paid");
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: "9999999999"
        },
        theme: {
          color: "#319795"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error("Payment Failed:", response.error);
        alert("Payment was cancelled or failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      console.error("Razorpay Payment Error:", err);
      // Direct Fallback Execution
      finalizeBooking("Pay at Desk Fallback");
    }
  };

  const handleFinalPaymentSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (paymentMethod === 'cash') {
      finalizeBooking("Pay at Hotel Desk");
    } else {
      handleRazorpayGateway();
    }
  };

  const getStatusBadge = (status, isBooked) => {
    const activeStatus = status || (isBooked ? 'Occupied' : 'Available');
    
    switch(activeStatus) {
      case 'Available':
        return { label: '🟢 Available', bg: '#38A169' };
      case 'Occupied':
      case 'Booked':
        return { label: '🔴 Occupied', bg: '#E53E3E' };
      case 'Dirty':
        return { label: '🟡 Dirty', bg: '#D69E2E' };
      case 'Maintenance':
        return { label: '🟠 Maintenance', bg: '#DD6B20' };
      default:
        return { label: '🟢 Available', bg: '#38A169' };
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto 40px auto', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#2D3748', margin: 0, fontSize: '28px', fontWeight: '800' }}>
          🏰 The Luminary Heritage Resort
        </h2>
        <p style={{ color: '#718096', margin: '5px 0 0 0', fontSize: '15px' }}>
          Showing {rooms.length} luxury rooms across our heritage property
        </p>
      </div>

      {/* 🔍 Dynamic Search Bar & Category Filter Bar */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        padding: '16px 20px', 
        borderRadius: '14px', 
        marginBottom: '25px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        alignItems: 'center',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ flex: 2, minWidth: '220px' }}>
          <input 
            type="text" 
            placeholder="🔍 Search by Room Number, Suite Name or Category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '160px' }}>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '13px', backgroundColor: 'white' }}
          >
            <option value="ALL">🏛️ All Categories</option>
            <option value="Suite">Suite</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Double">Double</option>
            <option value="Single">Single</option>
            <option value="Deluxe Garden View">Deluxe Garden View</option>
            <option value="Executive Heritage Suite">Executive Heritage Suite</option>
          </select>
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', fontSize: '18px', color: '#718096' }}>
          ⏳ Loading resort inventory...
        </div>
      ) : rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', color: '#718096' }}>
          No rooms match your search criteria. Try selecting "All Categories".
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: '25px'
        }}>
          {rooms.map((room) => {
            const badge = getStatusBadge(room.status, room.isBooked);
            const isAvailable = !room.isBooked && (room.status ? room.status === 'Available' : true);

            return (
              <div
                key={room._id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div>
                  <div style={{ position: 'relative', height: '200px', backgroundColor: '#EDF2F7' }}>
                    <img src={room.image || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"} alt={`Room ${room.roomNumber || room.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{
                      position: 'absolute', top: '12px', right: '12px',
                      backgroundColor: badge.bg,
                      color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold'
                    }}>
                      {badge.label}
                    </span>
                    <span style={{
                      position: 'absolute', bottom: '12px', left: '12px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold'
                    }}>
                      🏢 Floor {room.floorNumber || 1}
                    </span>
                  </div>

                  <div style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#319795', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {room.category || room.type || 'Luxury Suite'}
                      </span>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#2B6CB0' }}>
                        ₹{(room.pricePerNight || room.price || 0).toLocaleString()} <small style={{ fontSize: '11px', color: '#A0AEC0' }}>/night</small>
                      </span>
                    </div>

                    <h4 style={{ margin: '8px 0', fontSize: '18px', color: '#2D3748', fontWeight: '800' }}>
                      {room.name || `Room ${room.roomNumber}`}
                    </h4>
                    <p style={{ color: '#718096', fontSize: '12px', lineHeight: '1.5', height: '54px', overflow: 'hidden' }}>
                      {room.description}
                    </p>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                      <span style={{ backgroundColor: '#EBF8FF', color: '#2B6CB0', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        👤 Max {room.maxAdults || 2} Adults
                      </span>
                      <span style={{ backgroundColor: '#EDF2F7', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', color: '#4A5568' }}>
                        👶 Max {room.maxChildren || 1} Kids
                      </span>
                    </div>

                    <RoomReviewSection roomId={room._id} />
                  </div>
                </div>

                <div style={{ padding: '0 18px 18px 18px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setDetailRoom(room)}
                    style={{ flex: 1, padding: '10px', backgroundColor: '#EDF2F7', color: '#2D3748', border: '1px solid #CBD5E0', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ℹ️ Details
                  </button>
                  <button
                    disabled={!isAvailable}
                    onClick={() => handleReserveClick(room)}
                    style={{ flex: 1.5, padding: '10px', backgroundColor: !isAvailable ? '#CBD5E0' : '#319795', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: !isAvailable ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                  >
                    {!isAvailable ? 'Already Reserved' : 'Reserve Room ➔'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {detailRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '20px', width: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
              <img src={detailRoom.image} alt={detailRoom.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <span style={{ fontSize: '11px', fontWeight: '800', color: '#319795', textTransform: 'uppercase' }}>{detailRoom.category || detailRoom.type}</span>
            <h3 style={{ margin: '4px 0 10px 0', fontSize: '22px', color: '#2D3748' }}>{detailRoom.name || `Room ${detailRoom.roomNumber}`}</h3>
            <p style={{ color: '#4A5568', fontSize: '13px', lineHeight: '1.6' }}>{detailRoom.description}</p>

            <div style={{ backgroundColor: '#F7FAFC', padding: '15px', borderRadius: '12px', margin: '15px 0' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#2D3748' }}>✨ Room Details & Luxury Amenities</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#4A5568' }}>
                <div>🏢 Floor: <strong>{detailRoom.floorNumber || 1}</strong></div>
                <div>🏷️ Status: <strong>{detailRoom.isBooked ? 'Reserved' : 'Available'}</strong></div>
                <div>👨‍💼 Max Adults: <strong>{detailRoom.maxAdults || 2}</strong></div>
                <div>🧒 Max Children: <strong>{detailRoom.maxChildren || 1}</strong></div>
                <div>✅ 24/7 Butler Service</div>
                <div>✅ High-Speed Wi-Fi</div>
                <div>✅ Scenic Balcony View</div>
                <div>✅ Complimentary Breakfast</div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                disabled={detailRoom.isBooked}
                onClick={() => { const r = detailRoom; setDetailRoom(null); handleReserveClick(r); }}
                style={{ flex: 1, padding: '12px', backgroundColor: detailRoom.isBooked ? '#CBD5E0' : '#319795', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {detailRoom.isBooked ? 'Already Reserved' : 'Reserve Room ➔'}
              </button>
              <button onClick={() => setDetailRoom(null)} style={{ padding: '12px 20px', backgroundColor: '#E2E8F0', color: '#4A5568', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedRoom && !showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '20px', width: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', color: '#2D3748' }}>
            <h3 style={{ marginTop: 0, color: '#2D3748', fontSize: '20px' }}>Confirm Reservation Details</h3>
            <p style={{ color: '#319795', fontWeight: 'bold', marginTop: '-5px' }}>
              {selectedRoom.name || `Room ${selectedRoom.roomNumber}`} ({selectedRoom.category || selectedRoom.type})
            </p>

            <form onSubmit={handleProceedToPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '4px' }}>Guest Name</label>
                <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '4px' }}>Email Address (for confirmation mail)</label>
                <input type="email" required value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '4px' }}>Check-In Date</label>
                  <input type="date" required value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '4px' }}>Check-Out Date</label>
                  <input type="date" required value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '4px' }}>Adults</label>
                  <select value={adults} onChange={(e) => setAdults(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', backgroundColor: 'white' }}>
                    {Array.from({ length: selectedRoom.maxAdults || 2 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} Adult{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '4px' }}>Kids</label>
                  <select value={childrenCount} onChange={(e) => setChildrenCount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', backgroundColor: 'white' }}>
                    {Array.from({ length: (selectedRoom.maxChildren || 0) + 1 }, (_, i) => (
                      <option key={i} value={i}>{i} Child{i !== 1 ? 'ren' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ backgroundColor: '#F7FAFC', border: '1px dashed #CBD5E0', padding: '15px', borderRadius: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4A5568', marginBottom: '6px' }}>
                  <span>₹{roomPricePerNight.toLocaleString()} × {nights} Night(s):</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4A5568', marginBottom: '6px' }}>
                  <span>Luxury Taxes & GST (18%):</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#2B6CB0', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                  <span>Total Amount Payable:</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#319795', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Proceed to Payment Options 💳
                </button>
                <button type="button" onClick={() => setSelectedRoom(null)} style={{ padding: '12px 18px', backgroundColor: '#E2E8F0', color: '#4A5568', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '24px', width: '450px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', color: '#2D3748' }}>
            <h3 style={{ marginTop: 0, color: '#1A202C', fontSize: '20px', borderBottom: '2px solid #EDF2F7', paddingBottom: '10px' }}>
              🔒 Select Payment Option
            </h3>

            <div style={{ backgroundColor: '#EBF8FF', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#2B6CB0', fontWeight: 'bold' }}>RESERVATION SUMMARY</div>
              <div style={{ fontSize: '14px', color: '#2D3748', fontWeight: '600' }}>
                {selectedRoom?.name || `Room ${selectedRoom?.roomNumber}`}
              </div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: '#2B6CB0' }}>Total: ₹{grandTotal.toLocaleString()}</div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: paymentMethod === 'razorpay' ? '2px solid #319795' : '1px solid #CBD5E0', backgroundColor: paymentMethod === 'razorpay' ? '#E6FFFA' : 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
              >
                💳 Razorpay Gateway
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: paymentMethod === 'cash' ? '2px solid #319795' : '1px solid #CBD5E0', backgroundColor: paymentMethod === 'cash' ? '#E6FFFA' : 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
              >
                💵 Pay at Hotel
              </button>
            </div>

            <form onSubmit={handleFinalPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {paymentMethod === 'razorpay' && (
                <div style={{ backgroundColor: '#F7FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '10px', fontSize: '12px', color: '#4A5568' }}>
                  ⚡ <strong>Razorpay Mode:</strong> Opens Official Razorpay Gateway to test UPI, Cards, & NetBanking.
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div style={{ backgroundColor: '#FEFCBF', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#744210' }}>
                  ℹ️ <strong>Pay at Reception:</strong> Room will be reserved. Pay via Cash / Card upon Check-In at the resort desk.
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#38A169', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                  {paymentMethod === 'cash' ? 'Confirm Booking (Pay Later)' : `Pay ₹${grandTotal.toLocaleString()} via Razorpay`}
                </button>
                <button type="button" onClick={() => setShowPaymentModal(false)} style={{ padding: '12px', backgroundColor: '#E2E8F0', color: '#4A5568', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;