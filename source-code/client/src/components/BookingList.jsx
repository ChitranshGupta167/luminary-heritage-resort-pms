import React, { useEffect, useState } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
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

  const handleStatusChange = (id, newStatus) => {
    axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status: newStatus })
      .then(() => {
        alert(`✅ Booking Status Updated to "${newStatus}"!`);
        fetchBookings();
      })
      .catch((err) => {
        console.error("Status update error:", err);
        alert("❌ Failed to update status: " + (err.response?.data?.message || err.message));
      });
  };

  const handleInitiateRefund = (bookingId, roomName, amount) => {
    if (window.confirm(`Initiate Refund of ₹${amount.toLocaleString()} for ${roomName}?`)) {
      axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, { status: 'Refund Initiated' })
        .then(() => {
          alert(`💸 Refund of ₹${amount.toLocaleString()} Initiated Successfully!`);
          fetchBookings();
        })
        .catch((err) => {
          alert(`❌ Failed to trigger refund: ` + (err.response?.data?.message || err.message));
        });
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#718096' }}>⏳ Loading Customer Bookings...</div>;
  }

  const totalRevenue = bookings
    .filter(b => b.bookingStatus !== 'Cancelled by User' && b.bookingStatus !== 'Refund Initiated' && b.bookingStatus !== 'Cancelled')
    .reduce((sum, b) => sum + (Number(b.totalAmount || b.room?.price) || 0), 0);

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto 40px auto', fontFamily: "'Poppins', sans-serif" }}>
      
      <div style={{ backgroundColor: '#319795', color: 'white', padding: '22px 28px', borderRadius: '16px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>The Luminary Heritage Resort - Net Realized Earnings</h3>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '13px' }}>Excludes User Cancelled & Refunded Bookings</p>
        </div>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800' }}>
          ₹{totalRevenue.toLocaleString()}
        </h1>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', padding: '25px', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#2D3748', fontSize: '22px', fontWeight: '800' }}>
            📋 All Customer Reservations ({bookings.length})
          </h2>
          <button 
            onClick={fetchBookings} 
            style={{ padding: '8px 14px', backgroundColor: '#319795', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
          >
            🔄 Sync / Refresh Bookings
          </button>
        </div>

        {bookings.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#718096', padding: '20px 0' }}>No active bookings found in database.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#EDF2F7', color: '#2D3748' }}>
                  <th style={{ padding: '12px 16px' }}>Customer Name</th>
                  <th style={{ padding: '12px 16px' }}>Room Allocated</th>
                  <th style={{ padding: '12px 16px' }}>Amount Paid</th>
                  <th style={{ padding: '12px 16px' }}>Booking Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const roomNumberDisplay = b.room?.roomNumber ? `Room ${b.room.roomNumber}` : '';
                  const roomNameDisplay = b.room?.name || 'Luxury Room';
                  const fullRoomTitle = roomNumberDisplay ? `${roomNumberDisplay} (${roomNameDisplay})` : roomNameDisplay;

                  const displayAmount = b.totalAmount || b.room?.price || 0;
                  const isCancelled = b.bookingStatus === 'Cancelled by User' || b.bookingStatus === 'Cancelled';
                  const isRefunded = b.bookingStatus === 'Refund Initiated';

                  return (
                    <tr key={b._id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: isCancelled ? '#FFF5F5' : isRefunded ? '#FFFAF0' : 'white' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#2B6CB0' }}>
                        {b.customerName || "Valued Guest"}
                        <div style={{ fontSize: '11px', color: '#718096', fontWeight: 'normal' }}>{b.customerEmail || 'guest@luminary.com'}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#2D3748', fontWeight: 'bold' }}>
                        🏨 {fullRoomTitle}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 'bold', color: isCancelled || isRefunded ? '#E53E3E' : '#2F855A', fontSize: '14px' }}>
                        ₹{Number(displayAmount).toLocaleString()}
                        {isRefunded && <div style={{ fontSize: '10px', color: '#DD6B20' }}>[Refund Initiated]</div>}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <select
                          value={b.bookingStatus || 'Confirmed'}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            border: '1px solid #CBD5E0',
                            backgroundColor: isCancelled ? '#FFF5F5' : isRefunded ? '#FFFAF0' : b.bookingStatus === 'Checked-In' ? '#C6F6D5' : '#EBF8FF',
                            color: isCancelled ? '#C53030' : isRefunded ? '#C05621' : b.bookingStatus === 'Checked-In' ? '#22543D' : '#2B6CB0',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Confirmed">🔵 Confirmed</option>
                          <option value="Checked-In">🟢 Checked-In</option>
                          <option value="Checked-Out">⚪ Checked-Out</option>
                          <option value="Cancelled by User">🔴 Cancelled by User</option>
                          <option value="Refund Initiated">💸 Refund Initiated</option>
                        </select>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {isCancelled ? (
                            <button
                              onClick={() => handleInitiateRefund(b._id, fullRoomTitle, displayAmount)}
                              style={{ padding: '6px 12px', backgroundColor: '#DD6B20', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                            >
                              💸 Initiate Refund
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold' }}>
                              {isRefunded ? '💸 Refund Processing' : 'Active Stay'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingList;