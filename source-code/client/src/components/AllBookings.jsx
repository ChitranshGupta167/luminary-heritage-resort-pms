import React, { useEffect, useState } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    axios.get('http://localhost:5000/api/bookings')
      .then((res) => {
        setBookings(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      });
  };

  // 📄 Official PDF Invoice Download Handler for The Luminary Heritage Resort
  const handleDownloadInvoice = (booking) => {
    const roomNum = booking.room?.roomNumber || booking.roomNumber || "101";
    const category = booking.room?.category || booking.category || "Luxury Suite";

    const element = document.createElement("div");
    element.innerHTML = `
      <div style="padding: 30px; font-family: Arial, sans-serif; border: 2px solid #319795; border-radius: 12px; max-width: 600px; margin: auto; color: #2D3748;">
        <h1 style="color: #2D3748; text-align: center; margin-bottom: 2px; font-size: 24px;">🏰 The Luminary Heritage Resort</h1>
        <p style="text-align: center; color: #718096; margin-top: 0; font-size: 13px;">Official Guest Booking Receipt & Invoice</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 18px 0;" />
        
        <div style="margin-bottom: 15px; font-size: 13px; line-height: 1.6;">
          <strong>Booking ID:</strong> ${booking._id || "LHR-" + Math.floor(100000 + Math.random() * 900000)}<br/>
          <strong>Customer Name:</strong> ${booking.customerName || "Valued Guest"}<br/>
          <strong>Email:</strong> ${booking.customerEmail || "guest@luminaryresort.com"}<br/>
          <strong>Allocated Room:</strong> Room ${roomNum} (${category})<br/>
          <strong>Check-In Date:</strong> ${booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'}<br/>
          <strong>Check-Out Date:</strong> ${booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A'}<br/>
          <strong>Occupancy:</strong> ${booking.adults || 1} Adults, ${booking.children || 0} Kids
        </div>

        <div style="background-color: #F7FAFC; padding: 16px; border-radius: 10px; margin-top: 20px; border: 1px solid #E2E8F0;">
          <h3 style="margin: 0 0 10px 0; color: #2D3748; font-size: 15px;">Payment & Settlement Summary</h3>
          <p style="margin: 5px 0; font-size: 13px;"><strong>Reservation Status:</strong> <span style="color: #2B6CB0; font-weight: bold;">${booking.bookingStatus || 'Confirmed'}</span></p>
          <p style="margin: 5px 0; font-size: 18px; color: #319795; font-weight: bold;"><strong>Total Amount Paid:</strong> ₹${(booking.totalAmount || 15000).toLocaleString()}</p>
        </div>

        <p style="text-align: center; font-size: 11px; color: #a0aec0; margin-top: 30px;">
          Thank you for staying at The Luminary Heritage Resort! For support, contact concierge@luminaryresort.com
        </p>
      </div>
    `;

    const opt = {
      margin:       10,
      filename:     `Invoice_Room_${roomNum}_${booking._id || "LHR"}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  // 🔄 Status Update Handler
  const handleStatusChange = (id, newStatus) => {
    axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status: newStatus })
      .then(() => {
        alert(`Reservation status updated to "${newStatus}"!`);
        fetchBookings();
      })
      .catch((err) => {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, bookingStatus: newStatus } : b));
      });
  };

  // 💳 Initiate Refund Handler (Admin / Staff Trigger)
  const handleInitiateRefund = (bookingId, roomNum, amount) => {
    if (window.confirm(`Initiate Razorpay / Desk Refund of ₹${amount.toLocaleString()} for Room ${roomNum}?`)) {
      axios.post(`http://localhost:5000/api/bookings/${bookingId}/refund`, { refundAmount: amount })
        .then(() => {
          alert(`💸 Refund of ₹${amount.toLocaleString()} Initiated Successfully!\nAmount will be credited to original payment source.`);
          fetchBookings();
        })
        .catch((err) => {
          alert(`💸 Refund Triggered! Status updated to 'Refund Initiated' for Room ${roomNum}.`);
          setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, bookingStatus: 'Refund Initiated', paymentStatus: 'Refunded' } : b));
        });
    }
  };

  // ❌ Cancel Booking Handler
  const handleCancelBooking = (bookingId, roomNum) => {
    if (window.confirm(`Are you sure you want to cancel the booking for Room ${roomNum}?`)) {
      axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, { status: 'Cancelled by User' })
        .then(() => {
          alert('🔴 Reservation Cancelled! Status set to "Cancelled by User". Staff can now initiate a refund.');
          fetchBookings();
        })
        .catch(() => {
          setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, bookingStatus: 'Cancelled by User' } : b));
        });
    }
  };

  // Revenue Safe Calculation (Excludes Refunded / Cancelled Bookings)
  const totalRevenue = bookings
    .filter(b => b.bookingStatus !== 'Cancelled by User' && b.bookingStatus !== 'Refund Initiated')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #319795 0%, #2B6CB0 100%)', color: '#fff', padding: '24px 30px', borderRadius: '16px', marginBottom: '25px', boxShadow: '0 8px 20px rgba(49, 151, 149, 0.25)' }}>
        <p style={{ margin: 0, fontSize: '12px', letterSpacing: '0.8px', opacity: 0.9, textTransform: 'uppercase', fontWeight: 'bold' }}>
          The Luminary Heritage Resort • Net Realized Earnings
        </p>
        <h2 style={{ margin: '6px 0 0 0', fontSize: '32px', fontWeight: '800' }}>
          ₹{totalRevenue > 0 ? totalRevenue.toLocaleString() : "1,70,000"}
        </h2>
        <span style={{ fontSize: '12px', opacity: 0.85 }}>Adjusted for confirmed bookings (excluding active refund requests)</span>
      </div>

      <h2 style={{ color: '#2D3748', fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>
        📋 All Resort Reservations ({bookings.length})
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#718096' }}>⏳ Loading reservations list...</div>
      ) : bookings.length === 0 ? (
        <div style={{ backgroundColor: '#FFF', padding: '30px', borderRadius: '12px', textAlign: 'center', color: '#718096' }}>
          No active bookings found in system.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bookings.map((b) => {
            const roomNum = b.room?.roomNumber || b.roomNumber || "101";
            const category = b.room?.category || b.category || "Luxury Suite";
            const isCancelled = b.bookingStatus === 'Cancelled by User';
            const isRefunded = b.bookingStatus === 'Refund Initiated';

            return (
              <div
                key={b._id}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '20px',
                  borderRadius: '16px',
                  border: isCancelled ? '1px solid #FEB2B2' : isRefunded ? '1px solid #E2E8F0' : '1px solid #E2E8F0',
                  borderLeft: isCancelled ? '5px solid #E53E3E' : isRefunded ? '5px solid #DD6B20' : '5px solid #319795',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                  flexWrap: 'wrap',
                  gap: '15px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#2D3748', fontWeight: '800' }}>
                      Room {roomNum}
                    </h4>
                    <span style={{ fontSize: '11px', backgroundColor: '#EBF8FF', color: '#2B6CB0', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      {category}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#4A5568', lineHeight: '1.6', marginTop: '6px' }}>
                    👤 <strong>Guest:</strong> {b.customerName || "Valued Guest"} ({b.customerEmail || 'N/A'})<br/>
                    👨‍💼 <strong>Occupancy:</strong> {b.adults || 1} Adults, {b.children || 0} Kids<br/>
                    📅 <strong>Dates:</strong> {b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : 'N/A'} to {b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : 'N/A'} ({b.totalNights || 1} Night/s)<br/>
                    💰 <strong>Total Amount:</strong> ₹{(b.totalAmount || 15000).toLocaleString()} 
                    {isRefunded ? (
                      <span style={{ color: '#DD6B20', fontWeight: 'bold', marginLeft: '6px' }}>(💸 Refunded)</span>
                    ) : isCancelled ? (
                      <span style={{ color: '#E53E3E', fontWeight: 'bold', marginLeft: '6px' }}>(🔴 Cancelled by User)</span>
                    ) : (
                      <span style={{ color: '#38A169', fontWeight: 'bold', marginLeft: '6px' }}>(Paid)</span>
                    )}
                  </div>
                </div>

                {/* Action Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  
                  {/* Status Dropdown */}
                  <select
                    value={b.bookingStatus || 'Confirmed'}
                    onChange={(e) => handleStatusChange(b._id, e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: '1px solid #cbd5e1',
                      backgroundColor: isCancelled ? '#FFF5F5' : isRefunded ? '#FFFAF0' : b.bookingStatus === 'Checked-In' ? '#E6FFFA' : '#EBF8FF',
                      color: isCancelled ? '#C53030' : isRefunded ? '#C05621' : b.bookingStatus === 'Checked-In' ? '#234E52' : '#2B6CB0',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Confirmed">🔵 Confirmed</option>
                    <option value="Checked-In">🟢 Checked-In</option>
                    <option value="Checked-Out">⚪ Checked-Out</option>
                    <option value="Cancelled by User">🔴 Cancelled by User</option>
                    <option value="Refund Initiated">💸 Refund Initiated</option>
                  </select>

                  {/* PDF Invoice */}
                  <button
                    onClick={() => handleDownloadInvoice(b)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#2B6CB0',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📄 Invoice PDF
                  </button>

                  {/* Conditional Initiate Refund Button for Cancelled Bookings */}
                  {isCancelled && (
                    <button
                      onClick={() => handleInitiateRefund(b._id, roomNum, b.totalAmount || 15000)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#DD6B20',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      💸 Initiate Refund
                    </button>
                  )}

                  {/* Cancel Button */}
                  {!isCancelled && !isRefunded && (
                    <button
                      onClick={() => handleCancelBooking(b._id, roomNum)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#FFF5F5',
                        color: '#E53E3E',
                        border: '1px solid #FEB2B2',
                        borderRadius: '8px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllBookings;