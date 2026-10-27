import React, { useState } from 'react';
import axios from 'axios';

const AddRoom = ({ onRoomAdded }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    floorNumber: 1,
    category: 'Deluxe Garden View',
    pricePerNight: '',
    description: '',
    image: '',
    status: 'Available',
    maxAdults: 2,
    maxChildren: 1
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post('http://localhost:5000/api/rooms/add', formData);
      setMessage('✅ New Room Added to The Luminary Heritage Resort Inventory!');
      setFormData({
        roomNumber: '',
        floorNumber: 1,
        category: 'Deluxe Garden View',
        pricePerNight: '',
        description: '',
        image: '',
        status: 'Available',
        maxAdults: 2,
        maxChildren: 1
      });
      setLoading(false);
      if (onRoomAdded) onRoomAdded();
    } catch (error) {
      console.error('Error adding room:', error);
      setMessage('❌ Failed to add room. Check server or duplicate room number.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      padding: '30px',
      borderRadius: '20px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
      maxWidth: '550px',
      margin: '0 auto 40px auto',
      fontFamily: "'Poppins', sans-serif",
      border: '1px solid #E2E8F0'
    }}>
      <h2 style={{ marginTop: 0, color: '#2D3748', fontSize: '22px', textAlign: 'center', fontWeight: '800' }}>
        🏰 Add Room - The Luminary Heritage Resort
      </h2>

      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '18px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '13px',
          backgroundColor: message.includes('✅') ? '#C6F6D5' : '#FED7D7',
          color: message.includes('✅') ? '#22543D' : '#9B2C2C'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Room Number & Floor */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Room Number</label>
            <input
              type="text"
              name="roomNumber"
              required
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder="e.g. 101, 204, 301"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box', fontSize: '13px' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Floor Number</label>
            <select
              name="floorNumber"
              value={formData.floorNumber}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box', backgroundColor: 'white', fontSize: '13px' }}
            >
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
              <option value="4">Floor 4</option>
            </select>
          </div>
        </div>

        {/* Category & Price */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1.2 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Resort Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box', backgroundColor: 'white', fontSize: '13px' }}
            >
              <option value="Deluxe Garden View">Deluxe Garden View</option>
              <option value="Executive Heritage Suite">Executive Heritage Suite</option>
              <option value="Presidential Palm Villa">Presidential Palm Villa</option>
              <option value="Royal Family Suite">Royal Family Suite</option>
            </select>
          </div>

          <div style={{ flex: 0.8 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Price (₹ / Night)</label>
            <input
              type="number"
              name="pricePerNight"
              required
              value={formData.pricePerNight}
              onChange={handleChange}
              placeholder="e.g. 12000"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Status & Max Occupancy */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Initial Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box', backgroundColor: 'white', fontSize: '13px' }}
            >
              <option value="Available">🟢 Available</option>
              <option value="Occupied">🔴 Occupied</option>
              <option value="Dirty">🟡 Dirty (Housekeeping)</option>
              <option value="Maintenance">🟠 Maintenance</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Max Adults / Kids</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="number"
                name="maxAdults"
                value={formData.maxAdults}
                onChange={handleChange}
                placeholder="Adults"
                style={{ width: '50%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '12px' }}
              />
              <input
                type="number"
                name="maxChildren"
                value={formData.maxChildren}
                onChange={handleChange}
                placeholder="Kids"
                style={{ width: '50%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Image URL</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/photo-..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Room Description</label>
          <textarea
            name="description"
            required
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe luxury features, balcony view, bed specs..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box', fontSize: '13px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            backgroundColor: '#319795',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '8px',
            boxShadow: '0 4px 10px rgba(49, 151, 149, 0.3)'
          }}
        >
          {loading ? 'Adding Room...' : 'Save Room to Resort Inventory 🏨'}
        </button>
      </form>
    </div>
  );
};

export default AddRoom;