import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Guest'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const endpoint = isSignup ? 'register' : 'login';

    try {
      const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, formData);
      setLoading(false);

      // Save Token and User Info in Browser Storage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (onLoginSuccess) onLoginSuccess(res.data.user);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'Something went wrong!');
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    try {
      // API Trigger for Password Reset
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email: resetEmail });
      setResetMsg('📩 Password reset link sent to your registered email address!');
    } catch (err) {
      setResetMsg('📩 Password reset request generated! Check your inbox.');
    }
  };

  return (
    <div style={{
      maxWidth: '420px',
      margin: '50px auto',
      backgroundColor: '#FFFFFF',
      padding: '35px 30px',
      borderRadius: '20px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
      fontFamily: "'Poppins', sans-serif",
      border: '1px solid #E2E8F0'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#2D3748', fontSize: '22px', fontWeight: '800' }}>
          🏰 The Luminary Heritage Resort
        </h2>
        <p style={{ color: '#718096', fontSize: '13px', margin: '5px 0 0 0' }}>
          {isSignup ? 'Create a guest or staff account' : 'Access your luxury stay & portal'}
        </p>
      </div>

      <h3 style={{ textAlign: 'center', marginTop: 0, color: '#319795', fontSize: '18px' }}>
        {isSignup ? '📝 Register Account' : '🔐 Account Login'}
      </h3>

      {errorMsg && (
        <div style={{
          backgroundColor: '#FED7D7',
          color: '#9B2C2C',
          padding: '10px 12px',
          borderRadius: '8px',
          marginBottom: '15px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {isSignup && (
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box', fontSize: '13px' }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Email Address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="guest@luminaryresort.com"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box', fontSize: '13px' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#4A5568' }}>Password</label>
            {!isSignup && (
              <button
                type="button"
                onClick={() => { setShowForgotModal(true); setResetMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#319795', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box', fontSize: '13px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#718096'
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>
        </div>

        {isSignup && (
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4A5568', marginBottom: '5px' }}>Select Account Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box', backgroundColor: 'white', fontSize: '13px' }}
            >
              <option value="Guest">Guest User</option>
              <option value="Admin">Resort Admin</option>
              <option value="Staff">Hotel Staff</option>
            </select>
          </div>
        )}

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
            marginTop: '10px'
          }}
        >
          {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Login to Resort Portal'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => { setIsSignup(!isSignup); setErrorMsg(''); }}
          style={{ background: 'none', border: 'none', color: '#2B6CB0', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline', fontSize: '13px' }}
        >
          {isSignup ? 'Already have an account? Login here' : "Don't have an account? Sign Up"}
        </button>
      </div>

      {/* 🔐 FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '28px',
            borderRadius: '20px',
            width: '400px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            fontFamily: "'Poppins', sans-serif"
          }}>
            <h3 style={{ marginTop: 0, color: '#2D3748', fontSize: '18px', fontWeight: '800' }}>🔑 Reset Password</h3>
            <p style={{ color: '#718096', fontSize: '12px', lineHeight: '1.5' }}>
              Enter your registered email address below. We will send a secure password reset link.
            </p>

            {resetMsg && (
              <div style={{ backgroundColor: '#E6FFFA', color: '#234E52', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', fontWeight: '600' }}>
                {resetMsg}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A5568', marginBottom: '4px' }}>Registered Email</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0', boxSizing: 'border-box', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#319795', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                  Send Reset Link
                </button>
                <button type="button" onClick={() => setShowForgotModal(false)} style={{ padding: '10px 16px', backgroundColor: '#E2E8F0', color: '#4A5568', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;