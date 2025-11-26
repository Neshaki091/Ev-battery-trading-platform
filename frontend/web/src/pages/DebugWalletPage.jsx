import { useState, useEffect } from 'react';
import api from '../services/api';

const DebugWalletPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      console.log('🔍 Full Response:', response);
      console.log('🔍 Response Data:', response.data);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateWallet = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('evb_user') || '{}');
      const userId = userData._id || data?.user_id;

      const walletData = {
        wallet: {
          bankName: 'Vietcombank',
          bankCode: 'VCB',
          accountNumber: '1234567890',
          accountName: 'NGUYEN VAN A',
          branch: 'Chi nhánh Hà Nội'
        }
      };

      console.log('📤 Updating wallet for user:', userId);
      console.log('📤 Wallet data:', walletData);

      const response = await api.put(`/auth/users/${userId}`, walletData);
      console.log('✅ Update response:', response.data);

      alert('Update thành công! Refresh để xem kết quả.');
      await fetchData();
    } catch (err) {
      console.error('❌ Update error:', err);
      alert('Lỗi: ' + err.message);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🐛 Debug Wallet Page</h1>
      
      <button 
        onClick={fetchData}
        style={{ 
          padding: '10px 20px', 
          marginRight: '10px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔄 Refresh Data
      </button>

      <button 
        onClick={updateWallet}
        style={{ 
          padding: '10px 20px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        💾 Update Test Wallet
      </button>

      <hr style={{ margin: '20px 0' }} />

      {error && (
        <div style={{ 
          padding: '15px', 
          background: '#ffebee', 
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {data && (
        <>
          <h2>📥 API Response</h2>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>

          <h2>💳 Wallet Data</h2>
          {data.wallet && Object.keys(data.wallet).length > 0 ? (
            <div style={{ 
              background: '#e8f5e9', 
              padding: '15px', 
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <p><strong>✅ Wallet found!</strong></p>
              <pre>{JSON.stringify(data.wallet, null, 2)}</pre>
            </div>
          ) : (
            <div style={{ 
              background: '#fff3cd', 
              padding: '15px', 
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <p><strong>⚠️ No wallet data!</strong></p>
              <p>Wallet value: {JSON.stringify(data.wallet)}</p>
            </div>
          )}

          <h2>👤 User Info</h2>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            background: 'white'
          }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>User ID:</td>
                <td style={{ padding: '10px' }}>{data.user_id}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>Email:</td>
                <td style={{ padding: '10px' }}>{data.profile?.email}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>Username:</td>
                <td style={{ padding: '10px' }}>{data.profile?.username}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>Role:</td>
                <td style={{ padding: '10px' }}>{data.role}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <hr style={{ margin: '20px 0' }} />

      <h2>📝 Instructions</h2>
      <ol>
        <li>Mở DevTools Console (F12)</li>
        <li>Click "🔄 Refresh Data" để load lại</li>
        <li>Xem logs trong Console</li>
        <li>Kiểm tra "💳 Wallet Data" section</li>
        <li>Nếu không có wallet, click "💾 Update Test Wallet"</li>
        <li>Refresh lại và kiểm tra</li>
      </ol>
    </div>
  );
};

export default DebugWalletPage;

