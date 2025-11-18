// src/components/SearchForm.jsx
import React, { useState } from 'react';

const SearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    q: '',
    type: '',
    brand: '',
    model: '',
    location: '',
    price_min: '',
    price_max: '',
    sort_by: 'newest',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn form tải lại trang
    onSearch(formData); // Gọi hàm từ component cha (App.js)
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input name="q" value={formData.q} onChange={handleChange} placeholder="Từ khóa..." />
      <select name="type" value={formData.type} onChange={handleChange}>
        <option value="">Tất cả</option>
        <option value="XE">Xe điện</option>
        <option value="PIN">Pin</option>
      </select>
      <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Hãng xe (VD: VinFast)" />
      <input name="model" value={formData.model} onChange={handleChange} placeholder="Mẫu xe (VD: Blade)" />
      <input name="location" value={formData.location} onChange={handleChange} placeholder="Địa điểm (VD: Hà Nội)" />
      <input name="price_min" value={formData.price_min} onChange={handleChange} placeholder="Giá tối thiểu" type="number" />
      <input name="price_max" value={formData.price_max} onChange={handleChange} placeholder="Giá tối đa" type="number" />
      <select name="sort_by" value={formData.sort_by} onChange={handleChange}>
        <option value="newest">Mới nhất</option>
        <option value="price_asc">Giá tăng dần</option>
        <option value="price_desc">Giá giảm dần</option>
      </select>
      <button type="submit">Tìm kiếm</button>
    </form>
  );
};

export default SearchForm;