// src/components/ResultsList.jsx
import React from 'react';
import ResultItem from './ResultItem.jsx';

const ResultsList = ({ listings, loading, error }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tìm kiếm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Có lỗi xảy ra: {error.message || 'Vui lòng thử lại.'}</p>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="no-results-container">
        <p>Không tìm thấy kết quả nào phù hợp.</p>
      </div>
    );
  }

  return (
    <div className="results-list">
      {listings.map(item => (
        <ResultItem key={item._id} item={item} />
      ))}
    </div>
  );
};

export default ResultsList;