// src/App.jsx
import React, { useState } from 'react';
import SearchForm from './components/SearchForm.jsx';
import ResultsList from './components/ResultsList.jsx';
import { fetchListings } from './services/api.js';
import './App.css';

function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm này được gọi từ SearchForm khi người dùng nhấn "Tìm kiếm"
  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListings(searchParams);
      setListings(data.data.listings);
    } catch (err) {
      setError(err);
      setListings([]); // Xóa kết quả cũ nếu có lỗi
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>AMing Platform</h1>
      <p style={{ textAlign: 'center' }}>Nền tảng giao dịch pin và xe điện qua sử dụng</p>
      <hr />
      <SearchForm onSearch={handleSearch} />
      <ResultsList listings={listings} loading={loading} error={error} />
    </div>
  );
}

export default App;