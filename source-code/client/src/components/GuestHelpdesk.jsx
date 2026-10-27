import React, { useState, useEffect } from 'react';

const GuestHelpdesk = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [roomNumber, setRoomNumber] = useState('101');
  const [category, setCategory] = useState('Housekeeping / Cleaning');
  const [issueText, setIssueText] = useState('');
  
  // Support Tickets List with Guest Identifiers
  const [tickets, setTickets] = useState([
    { id: 'TCK-501', room: '104', name: 'Rahul Sharma', email: 'rahul@example.com', category: 'AC / Maintenance', issue: 'AC cooling is low in bedroom', status: 'In Progress', createdAt: '10 Mins ago' },
    { id: 'TCK-502', room: '101', name: 'Chitrang Gupta', email: 'chitrang@example.com', category: 'Housekeeping / Cleaning', issue: 'Extra towels and fresh linen required', status: 'Open', createdAt: '25 Mins ago' }
  ]);

  const [activeTab, setActiveTab] = useState('submit'); 

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch (e) {
        console.error("Error parsing user from localStorage");
      }
    }
  }, []);

  const isAdminOrStaff = currentUser?.role === 'Admin' || currentUser?.role === 'Staff';

  // 🔒 PRIVACY FILTER: Guest sees ONLY their own tickets, Admin/Staff see ALL
  const visibleTickets = isAdminOrStaff
    ? tickets
    : tickets.filter(t => 
        t.email?.toLowerCase() === currentUser?.email?.toLowerCase() || 
        t.name?.toLowerCase() === currentUser?.name?.toLowerCase()
      );

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!issueText.trim()) return;

    const newTicket = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      room: roomNumber,
      name: currentUser?.name || 'Valued Guest',
      email: currentUser?.email || 'guest@luminary.com',
      category: category,
      issue: issueText,
      status: 'Open',
      createdAt: 'Just now'
    };

    setTickets([newTicket, ...tickets]);
    alert(`✅ Support Request Logged Successfully!\nTicket ID: ${newTicket.id}\nOur Front-Desk team has been notified.`);
    setIssueText('');
    setActiveTab('my-tickets');
  };

  const handleUpdateStatus = (ticketId, newStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    alert(`Status for Ticket ${ticketId} updated to "${newStatus}".`);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto 40px auto', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Header */}
      <div style={{ marginBottom: '25px', textAlign: 'center' }}>
        <h2 style={{ color: '#2D3748', margin: 0, fontSize: '26px', fontWeight: '800' }}>
          🆘 The Luminary Heritage Resort - Concierge & Guest Helpdesk
        </h2>
        <p style={{ color: '#718096', margin: '5px 0 0 0', fontSize: '14px' }}>
          {isAdminOrStaff ? 'Admin Resolution Desk for Guest Inquiries' : 'Need assistance during your stay? Submit requests directly to Front Desk'}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '25px' }}>
        <button
          onClick={() => setActiveTab('submit')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'submit' ? '#319795' : '#E2E8F0',
            color: activeTab === 'submit' ? 'white' : '#4A5568',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          ✍️ Raise Support Request
        </button>
        <button
          onClick={() => setActiveTab('my-tickets')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'my-tickets' ? '#2B6CB0' : '#E2E8F0',
            color: activeTab === 'my-tickets' ? 'white' : '#4A5568',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          📋 {isAdminOrStaff ? 'All Guest Queries Desk' : 'My Support Tickets History'} ({visibleTickets.length})
        </button>
      </div>

      {/* Form: Submit Ticket */}
      {activeTab === 'submit' && (
        <div style={{ backgroundColor: '#FFF', padding: '30px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', maxWidth: '550px', margin: '0 auto' }}>
          <h3 style={{ marginTop: 0, color: '#2D3748', fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>
            📝 Guest Assistance Form
          </h3>

          <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Room Number</label>
                <select
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '13px', fontWeight: 'bold' }}
                >
                  {Array.from({ length: 35 }, (_, i) => {
                    const rNum = 101 + i;
                    return <option key={rNum} value={rNum}>Room {rNum}</option>;
                  })}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Logged In Guest</label>
                <input
                  type="text"
                  readOnly
                  value={currentUser?.name || 'Valued Guest'}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '13px', backgroundColor: '#EDF2F7', fontWeight: 'bold', color: '#2B6CB0' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Assistance Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '13px', backgroundColor: 'white' }}
              >
                <option value="Housekeeping / Cleaning">🧹 Housekeeping / Cleaning</option>
                <option value="AC / Electrical Maintenance">⚡ AC / Electrical Maintenance</option>
                <option value="Plumbing & Bathroom">🚰 Plumbing & Bathroom</option>
                <option value="Billing & Reception">💳 Billing & Reception</option>
                <option value="General Concierge">🛎️ General Concierge</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Describe Query / Request</label>
              <textarea
                rows="4"
                required
                placeholder="Mention issue details or special requests..."
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              style={{ padding: '12px', backgroundColor: '#319795', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '5px' }}
            >
              Submit Ticket to Front Desk ➔
            </button>
          </form>
        </div>
      )}

      {/* Tickets Monitor */}
      {activeTab === 'my-tickets' && (
        <div style={{ backgroundColor: '#FFF', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
          <h3 style={{ marginTop: 0, color: '#2D3748', fontSize: '18px', fontWeight: '800', marginBottom: '18px' }}>
            📋 {isAdminOrStaff ? 'All Guest Support Queries (Admin Monitor)' : 'My Active Support Queries'}
          </h3>

          {visibleTickets.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#718096', padding: '30px 0' }}>No active support requests found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {visibleTickets.map((t) => (
                <div key={t.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F7FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: '#2B6CB0' }}>Room {t.room} ({t.id})</span>
                      <span style={{ fontSize: '11px', backgroundColor: '#EBF8FF', color: '#2B6CB0', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{t.category}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#2D3748', marginTop: '6px' }}>
                      <strong>Guest:</strong> {t.name} • <span style={{ color: '#718096' }}>{t.createdAt}</span>
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#4A5568' }}>"{t.issue}"</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4A5568' }}>Status:</label>
                    {isAdminOrStaff ? (
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          border: '1px solid #CBD5E0',
                          backgroundColor: t.status === 'Resolved' ? '#C6F6D5' : t.status === 'In Progress' ? '#FEFCBF' : '#FED7D7',
                          color: t.status === 'Resolved' ? '#22543D' : t.status === 'In Progress' ? '#744210' : '#9B2C2C',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Open">🔴 Open</option>
                        <option value="In Progress">🟡 In Progress</option>
                        <option value="Resolved">🟢 Resolved</option>
                      </select>
                    ) : (
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: t.status === 'Resolved' ? '#C6F6D5' : t.status === 'In Progress' ? '#FEFCBF' : '#FED7D7',
                        color: t.status === 'Resolved' ? '#22543D' : t.status === 'In Progress' ? '#744210' : '#9B2C2C'
                      }}>
                        {t.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default GuestHelpdesk;