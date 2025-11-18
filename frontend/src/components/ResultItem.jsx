// src/components/ResultItem.jsx
import React from 'react';

const ResultItem = ({ item }) => {
  return (
    <div className="result-item">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <p className="price">Giá: {item.price.toLocaleString('vi-VN')} VNĐ</p>
      <p className="location">Địa điểm: {item.location}</p>
      <p>Người bán: {item.seller.name} {item.seller.is_verified ? '(Đã kiểm định)' : ''}</p>
    </div>
  );
};

export default ResultItem;