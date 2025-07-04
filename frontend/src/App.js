import React, { useState } from 'react';

function App() {
  const [orderNumber, setOrderNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use environment variable for API URL, fallback to localhost for local dev
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${apiUrl}/api/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber }),
      });

      // Handle non-200 responses gracefully
      if (!response.ok) {
        const errorData = await response.json();
        setResult({ success: false, message: errorData.message || 'Server error.' });
        setLoading(false);
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, message: 'Network error.' });
    }
    setLoading(false);
  };

  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #e0e7ef 0%, #f8fafc 100%)',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        margin: 0
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 24,
          boxShadow: '0 12px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 6px 0 rgba(99,102,241,0.08)',
          padding: 44,
          maxWidth: 440,
          width: '100%',
          margin: '32px 0',
          backdropFilter: 'blur(8px)',
          border: '1.5px solid rgba(99,102,241,0.08)'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontWeight: 900,
            fontSize: 36,
            letterSpacing: '-1.5px',
            marginBottom: 36,
            color: '#1a202c',
            textShadow: '0 2px 8px rgba(99,102,241,0.08)'
          }}>
            <span role="img" aria-label="star">🌟</span> Premium Course Redeem
          </h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter Shopee Order Number"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                marginBottom: 20,
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                fontSize: 17,
                background: '#f9fafb',
                transition: 'border 0.2s, box-shadow 0.2s',
                outline: 'none',
                boxShadow: '0 1px 4px 0 rgba(99,102,241,0.04)'
              }}
              onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
              onBlur={e => e.target.style.border = '1.5px solid #cbd5e1'}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(90deg, #6366f1 0%, #0ea5e9 100%)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: '0.5px',
                boxShadow: '0 2px 12px 0 rgba(99,102,241,0.13)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'background 0.2s, opacity 0.2s, box-shadow 0.2s'
              }}
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Redeem Now'}
            </button>
          </form>
          {result && (
            <div style={{
              marginTop: 36,
              background: 'rgba(243,244,246,0.95)',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 1px 8px 0 rgba(99,102,241,0.06)'
            }}>
              {result.success && Array.isArray(result.courses) ? (
                <div>
                  <div style={{
                    fontWeight: 800,
                    fontSize: 20,
                    marginBottom: 16,
                    color: '#2563eb',
                    letterSpacing: '-0.5px'
                  }}>
                    🎉 Courses Found:
                  </div>
                  <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                    {result.courses.map((course, idx) => (
                      <li key={idx} style={{
                        marginBottom: 22,
                        padding: '14px 16px',
                        background: '#fff',
                        borderRadius: 10,
                        boxShadow: '0 1px 6px 0 rgba(99,102,241,0.07)',
                        border: '1px solid #e0e7ef'
                      }}>
                        <div style={{ fontWeight: 700, color: '#0ea5e9', marginBottom: 6, fontSize: 16 }}>
                          {course.courseName}
                        </div>
                        <div style={{ wordBreak: 'break-all', fontSize: 15 }}>
                          <a
                            href={course.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#6366f1',
                              textDecoration: 'underline',
                              fontWeight: 600,
                              transition: 'color 0.2s'
                            }}
                            onMouseOver={e => e.target.style.color = '#0ea5e9'}
                            onMouseOut={e => e.target.style.color = '#6366f1'}
                          >
                            {course.link}
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {/* Shipping warning/status is intentionally hidden from the user */}
                </div>
              ) : (
                <span style={{ color: '#dc2626', fontWeight: 700, fontSize: 16 }}>{result && result.message}</span>
              )}
            </div>
          )}

          <div style={{
            marginTop: 40,
            textAlign: 'center',
            color: '#64748b',
            fontSize: 14,
            letterSpacing: '0.2px'
          }}>
            <span style={{
              color: '#6366f1',
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: '0.5px'
            }}>EducationHub</span> &mdash; Excellence in Learning
          </div>
        </div>
      </div>
      {/* --- Advertising Banner Start --- */}
      <div style={{
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: '100%',
        background: 'rgba(249,250,251,0.95)',
        borderTop: '1px solid #e0e7ef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 400,
        color: '#64748b',
        boxShadow: '0 -1px 6px 0 rgba(99,102,241,0.04)',
        padding: '7px 8px',
        zIndex: 1000
      }}>
        <span>
          Build by <span style={{fontWeight: 600, color: '#6366f1'}}>Luffy</span> &bull; <a href="tel:0172020358" style={{color: '#0ea5e9', textDecoration: 'underline'}}>0172020358</a>
        </span>
        <a href="https://wa.link/wmpiyo" target="_blank" rel="noopener noreferrer">
          <button style={{
            background: '#25d366',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '4px 12px',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 1px 2px 0 rgba(37,211,102,0.10)',
            marginLeft: 12
          }}>
            WhatsApp
          </button>
        </a>
      </div>
      {/* --- Advertising Banner End --- */}
    </>
  );
}

export default App;