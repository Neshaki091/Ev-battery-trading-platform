import React, { useEffect, useState } from 'react';

/**
 * Global Alert Provider
 * Thay thế window.alert mặc định bằng popup đẹp mắt, thống nhất trong toàn bộ app.
 */
const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState(null); // { message, title, type }

  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (msg) => {
      const message = typeof msg === 'string' ? msg : JSON.stringify(msg);
      setAlertState({
        message,
        title: 'Thông báo',
        type: 'info',
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  const handleClose = () => {
    setAlertState(null);
  };

  return (
    <>
      {children}
      {alertState && (
        <div
          className="evb-alert-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={handleClose}
        >
          <div
            className="evb-alert-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: '90%',
              background:
                'linear-gradient(135deg, #ffffff 0%, #f3f4ff 40%, #eef9ff 100%)',
              borderRadius: '18px',
              boxShadow:
                '0 18px 45px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(148, 163, 184, 0.25)',
              padding: '20px 22px 18px',
              color: '#0f172a',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '999px',
                  background:
                    'radial-gradient(circle at 30% 30%, #e0f2fe, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 2px rgba(191, 219, 254, 0.9)',
                  color: 'white',
                  fontSize: 18,
                }}
              >
                i
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                  }}
                >
                  {alertState.title || 'Thông báo'}
                </h3>
              </div>
            </div>

            <div
              style={{
                marginBottom: '16px',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                color: '#0f172a',
                whiteSpace: 'pre-line',
              }}
            >
              {alertState.message}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={handleClose}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  background:
                    'linear-gradient(135deg, #2563eb 0%, #4f46e5 40%, #7c3aed 100%)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  boxShadow:
                    '0 10px 25px rgba(37, 99, 235, 0.45), 0 0 0 1px rgba(191, 219, 254, 0.9)',
                  transition: 'transform 0.08s ease, box-shadow 0.08s ease',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(1px) scale(0.99)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(37, 99, 235, 0.35)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow =
                    '0 10px 25px rgba(37, 99, 235, 0.45), 0 0 0 1px rgba(191, 219, 254, 0.9)';
                }}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlertProvider;


