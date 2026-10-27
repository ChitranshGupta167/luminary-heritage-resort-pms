import React, { useEffect, useState } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

const MyBookings = () => {
  const [myBookings, setMyBookings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        fetchUserBookings(parsed);
      } catch (e) {
        console.error("Error parsing user profile:", e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserBookings = (user) => {
    setLoading(true);
    axios.get('http://localhost:5000/api/bookings')
      .then((res) => {
        const allBookings = res.data || [];
        
        // Smart Case-Insensitive Email & Name Matching
        const userSpecific = allBookings.filter(b => {
          const userEmail = (user.email || '').toLowerCase().trim();
          const userName = (user.name || '').toLowerCase().trim();
          const bEmail = (b.customerEmail || '').toLowerCase().trim();
          const bName = (b.customerName || '').toLowerCase().trim();

          return (userEmail && bEmail === userEmail) || (userName && bName === userName);
        });

        setMyBookings(userSpecific);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching user bookings:', err);
        setLoading(false);
      });
  };

  const handleUserCancelBooking = (bookingId, roomName) => {
    if (window.confirm(`Are you sure you want to cancel your reservation for ${roomName}?`)) {
      axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, { status: 'Cancelled by User' })
        .then(() => {
          alert('🔴 Reservation Cancelled Successfully!\nYour cancellation has been sent to Admin for refund processing.');
          if (currentUser) fetchUserBookings(currentUser);
        })
        .catch((err) => {
          console.error("Cancellation error:", err);
          alert('❌ Failed to update cancellation status on backend: ' + (err.response?.data?.message || err.message));
        });
    }
  };

  const downloadPDFInvoice = (booking) => {
    const roomName = booking.room?.name || (booking.room?.roomNumber ? `Room ${booking.room.roomNumber}` : 'Luxury Heritage Room');

    const element = document.createElement("div");
    element.innerHTML = `
      <div style="padding: 30px; font-family: Arial, sans-serif; border: 2px solid #319795; border-radius: 12px; max-width: 600px; margin: auto; color: #2D3748; background-color: #FFFFFF;">
        <h1 style="color: #2D3748; text-align: center; margin-bottom: 4px; font-size: 24px; font-weight: bold;">🏰 The Luminary Heritage Resort</h1>
        <p style="text-align: center; color: #718096; margin-top: 0; font-size: 13px;">Official Guest Stay Folio & Invoice Receipt</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
        
        <div style="margin-bottom: 20px; color: #2D3748; line-height: 1.8; font-size: 13px;">
          <strong>Booking Reference ID:</strong> ${booking._id}<br/>
          <strong>Guest Name:</strong> ${booking.customerName || currentUser?.name}<br/>
          <strong>Registered Email:</strong> ${booking.customerEmail || currentUser?.email}<br/>
          <strong>Allocated Accommodation:</strong> ${roomName}<br/>
          <strong>Check-In Date:</strong> ${booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'}<br/>
          <strong>Check-Out Date:</strong> ${booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A'}
        </div>

        <div style="background-color: #F7FAFC; padding: 18px; border-radius: 10px; margin-top: 20px; border: 1px solid #E2E8F0;">
          <h3 style="margin: 0 0 10px 0; color: #2D3748; font-size: 15px;">Settlement Details</h3>
          <p style="margin: 5px 0; font-size: 13px;"><strong>Reservation Status:</strong> <span style="color: #38A169; font-weight: bold;">${booking.bookingStatus || 'Confirmed'}</span></p>
          <p style="margin: 5px 0; font-size: 18px; color: #2B6CB0; font-weight: bold;"><strong>Total Paid:</strong> ₹${Number(booking.totalAmount || 0).toLocaleString()}</p>
        </div>
      </div>
    `;

    html2pdf().set({ margin: 10, filename: `Luminary_Invoice.pdf` }).from(element).save();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px 20px', fontSize: '18px', color: '#718096' }}>⏳ Loading your stays...</div>;
  }

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto 40px auto', fontFamily: "'Poppins', sans-serif" }}>
      
      <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #2B6CB0 100%)', color: 'white', padding: '28px 32px', borderRadius: '18px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800' }}>🧳 My Stays & Reservations Dashboard</h2>
          <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Welcome, {currentUser?.name || 'Guest'}!</p>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
          Active Stays: {myBookings.length}
        </div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
        {myBookings.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#718096', padding: '40px 0', fontSize: '16px' }}>
            🏨 <strong>No Active Bookings Found!</strong><br/>
            <span style={{ fontSize: '13px', color: '#A0AEC0' }}>Reserve a room from the Rooms section to see your active booking details here.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {myBookings.map((b) => {
              // 🎯 FIXED ROOM NUMBER & NAME DISPLAY
              const roomNumberDisplay = b.room?.roomNumber ? `Room ${b.room.roomNumber}` : '';
              const roomNameDisplay = b.room?.name || 'Luxury Suite';
              const fullRoomTitle = roomNumberDisplay ? `${roomNumberDisplay} - ${roomNameDisplay}` : roomNameDisplay;

              const displayAmount = b.totalAmount || b.room?.price || 0;
              const isCancelled = b.bookingStatus === 'Cancelled by User' || b.bookingStatus === 'Cancelled';
              const isRefunded = b.bookingStatus === 'Refund Initiated';

              return (
                <div key={b._id} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', borderLeft: isCancelled ? '6px solid #E53E3E' : isRefunded ? '6px solid #DD6B20' : '6px solid #319795', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', color: '#2D3748', fontWeight: '800' }}>
                        🏨 {fullRoomTitle}
                      </h3>
                      {b.room?.type && (
                        <span style={{ backgroundColor: '#EBF8FF', color: '#2B6CB0', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                          {b.room.type}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '13px', color: '#4A5568', lineHeight: '1.8', marginTop: '10px' }}>
                      👤 <strong>Guest Name:</strong> {b.customerName || currentUser?.name}<br/>
                      ✉️ <strong>Email:</strong> {b.customerEmail || currentUser?.email}<br/>
                      📅 <strong>Check-In / Out:</strong> {b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : 'N/A'} ➔ {b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : 'N/A'}<br/>
                      💰 <strong>Total Amount:</strong> <span style={{ fontWeight: 'bold', color: '#2D3748', fontSize: '15px' }}>₹{Number(displayAmount).toLocaleString()}</span>
                      
                      {isRefunded ? (
                        <span style={{ color: '#C05621', backgroundColor: '#FFFAF0', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', marginLeft: '10px', fontSize: '11px' }}>💸 Refund Initiated by Admin</span>
                      ) : isCancelled ? (
                        <span style={{ color: '#C53030', backgroundColor: '#FFF5F5', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', marginLeft: '10px', fontSize: '11px' }}>🔴 Cancelled by User</span>
                      ) : (
                        <span style={{ color: '#22543D', backgroundColor: '#C6F6D5', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', marginLeft: '10px', fontSize: '11px' }}>🟢 Confirmed</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={() => downloadPDFInvoice(b)} style={{ padding: '10px 16px', backgroundColor: '#2B6CB0', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>📄 Download Invoice PDF</button>
                    {!isCancelled && !isRefunded && (
                      <button onClick={() => handleUserCancelBooking(b._id, fullRoomTitle)} style={{ padding: '10px 16px', backgroundColor: '#FFF5F5', color: '#E53E3E', border: '1px solid #FEB2B2', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>❌ Cancel Reservation</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;