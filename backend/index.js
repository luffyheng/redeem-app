import React, { useState } from 'react';

function App() {
  const [orderNumber, setOrderNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, message: 'Network error.' });
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(120deg, #6366f1 0%, #0ea5e9 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 12s ease infinite',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      overflow: 'auto'
    }}>
      <style>
        {`
          @keyframes gradientBG {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }
          .glass-card input:focus {
            border: 2px solid #6366f1 !important;
            box-shadow: 0 0 0 2px #6366f133;
          }
          .glass-card button:active {
            transform: scale(0.98);
          }
        `}
      </style>
      <div className="glass-card" style={{
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 28,
        boxShadow: '0 12px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 6px 0 rgba(99,102,241,0.08)',
        padding: 48,
        maxWidth: 420,
        width: '100%',
        margin: '32px 0',
        backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(99,102,241,0.10)',
        transition: 'box-shadow 0.2s',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 24,
          right: 32,
          fontSize: 22,
          color: '#6366f1',
          opacity: 0.12,
          fontWeight: 900,
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          <span role="img" aria-label="logo">🎓</span>
        </div>
        <h2 style={{
          textAlign: 'center',
          fontWeight: 900,
          fontSize: 34,
          letterSpacing: '-1.5px',
          marginBottom: 32,
          color: '#1a202c',
          textShadow: '0 2px 8px rgba(99,102,241,0.08)'
        }}>
          Redeem Your Course
        </h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            type="text"
            placeholder="Enter Shopee Order Number"
            value={orderNumber}
            onChange={e => setOrderNumber(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '15px 18px',
              marginBottom: 22,
              borderRadius: 12,
              border: '2px solid #e0e7ef',
              fontSize: 17,
              background: '#f9fafb',
              transition: 'border 0.2s, box-shadow 0.2s',
              outline: 'none',
              fontWeight: 600,
              boxShadow: '0 1px 4px 0 rgba(99,102,241,0.04)'
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px 0',
              borderRadius: 12,
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
            background: 'rgba(243,244,246,0.97)',
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
  );
}

export default App;