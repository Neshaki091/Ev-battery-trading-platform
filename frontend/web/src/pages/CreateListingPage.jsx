import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// --- Hằng số ---
const CLOUDINARY_CLOUD_NAME = 'dgoze8lyy';
const CLOUDINARY_UPLOAD_PRESET = 'EVB_listing';

// --- Icons (Đã thêm SparkleIcon) ---
const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
// === MỚI: Icon cho nút Gợi ý ===
const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"></path>
  </svg>
);


function CreateListingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    images: [],
    category: 'Vehicle',
    condition: 'Used',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_manufacturing_year: '',
    vehicle_mileage_km: '',
    battery_capacity_kwh: '',
    battery_condition_percentage: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // === MỚI: State cho nút Gợi ý giá ===
  const [suggestingPrice, setSuggestingPrice] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('evb_token');
    if (!token) navigate('/login');
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 10) {
      setError('Bạn chỉ có thể chọn tối đa 10 ảnh.');
      return;
    }
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    setFormData(prev => ({ ...prev, images: [] }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, idx) => idx !== indexToRemove));
  };

  // Upload Cloudinary (Giữ nguyên)
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    data.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data
    });
    const result = await res.json();
    if (result.error) {
      throw new Error(result.error.message || 'Lỗi upload ảnh');
    }
    return result.secure_url;
  };

  // === MỚI: Hàm Gợi ý giá ===
  const handleSuggestPrice = async () => {
    // Yêu cầu nhập các trường cơ bản trước
    if (!formData.title || !formData.description || !formData.category) {
      setError('Vui lòng nhập Tiêu đề, Mô tả và chọn Danh mục trước khi gợi ý giá.');
      return;
    }

    setSuggestingPrice(true);
    setError('');

    try {
      // 1. Gói dữ liệu cho AI
      const suggestionData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        condition: formData.condition,
        category: formData.category,
      };

      // 2. Thêm chi tiết xe/pin
      if (formData.category === 'Vehicle') {
        suggestionData.vehicle_brand = formData.vehicle_brand;
        suggestionData.vehicle_model = formData.vehicle_model;
        suggestionData.vehicle_manufacturing_year = parseInt(formData.vehicle_manufacturing_year) || null;
        suggestionData.vehicle_mileage_km = parseInt(formData.vehicle_mileage_km) || null;
      } else if (formData.category === 'Battery') {
        suggestionData.battery_capacity_kwh = parseFloat(formData.battery_capacity_kwh) || null;
        suggestionData.battery_condition_percentage = parseInt(formData.battery_condition_percentage) || null;
      }

      // 3. Gọi API (Backend của bạn phải xử lý endpoint này)
      const response = await api.post('/listings/suggest-price', suggestionData);

      const suggestedPrice = response.data?.data?.suggestedPrice || response.data?.suggestedPrice;

      if (suggestedPrice && suggestedPrice > 0) {
        // 4. Tự động điền giá
        setFormData(prev => ({
          ...prev,
          // Làm tròn đến 1000 đồng gần nhất và chuyển sang string
          price: (Math.round(suggestedPrice / 1000) * 1000).toString()
        }));
      } else {
        setError('AI không thể đưa ra gợi ý. Vui lòng tự nhập giá.');
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi kết nối với AI gợi ý');
    } finally {
      setSuggestingPrice(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedFiles.length === 0) {
      setError('Vui lòng chọn ít nhất một ảnh sản phẩm.');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Giá phải là một số dương.');
      return;
    }

    setLoading(true);

    try {
      const uploadPromises = selectedFiles.map(file => uploadToCloudinary(file));
      const imageUrls = await Promise.all(uploadPromises);

      const body = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        condition: formData.condition,
        category: formData.category,
        images: imageUrls,
      };

      if (formData.category === 'Vehicle') {
        body.vehicle_brand = formData.vehicle_brand;
        body.vehicle_model = formData.vehicle_model;
        body.vehicle_manufacturing_year = parseInt(formData.vehicle_manufacturing_year) || undefined;
        body.vehicle_mileage_km = parseInt(formData.vehicle_mileage_km) || undefined;
      } else if (formData.category === 'Battery') {
        body.battery_capacity_kwh = parseFloat(formData.battery_capacity_kwh) || undefined;
        body.battery_condition_percentage = parseInt(formData.battery_condition_percentage) || undefined;
      }

      await api.post('/listings/', body);
      alert('Tạo thành công. Đợi admin duyệt.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi tạo tin đăng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      <div className="container py-8">
        <div className="card p-8" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-heading)' }}>Tạo tin mới</h2>

          {error && <div className="error-message mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* --- 1. Thông tin cơ bản --- */}
            <h3 className="text-xl font-semibold mb-4 mt-4 border-t pt-4" style={{ color: 'var(--text-heading)', borderColor: 'var(--color-border)' }}>
              1. Thông tin cơ bản
            </h3>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Tiêu đề *</label>
              <input id="title" name="title" type="text" required className="form-input" value={formData.title} onChange={handleChange} placeholder="VD: Vinfast VF8 Plus 2022" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Mô tả chi tiết *</label>
              <textarea id="description" name="description" required className="form-input" rows="5" value={formData.description} onChange={handleChange} placeholder="Mô tả tình trạng xe, lịch sử sử dụng, lý do bán..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">

                {/* === CẬP NHẬT: Thêm nút Gợi ý giá === */}
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label" htmlFor="price" style={{ marginBottom: 0 }}>
                    Giá (VND) *
                  </label>
                  <button
                    type="button"
                    onClick={handleSuggestPrice}
                    disabled={suggestingPrice || loading}
                    className="btn-link"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.875rem',
                      opacity: suggestingPrice ? 0.6 : 1
                    }}
                  >
                    <SparkleIcon />
                    {suggestingPrice ? 'Đang...' : 'Gợi ý giá'}
                  </button>
                </div>
                {/* === KẾT THÚC CẬP NHẬT === */}

                <input id="price" name="price" type="number" required className="form-input" value={formData.price} onChange={handleChange} min="0" placeholder="VD: 800000000" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="location">Vị trí *</label>
                <input id="location" name="location" type="text" required className="form-input" value={formData.location} onChange={handleChange} placeholder="VD: Quận 1, TP. HCM" />
              </div>
            </div>

            {/* --- 2. Hình ảnh (Giữ nguyên) --- */}
            <h3 className="text-xl font-semibold mb-4 mt-6 border-t pt-4" style={{ color: 'var(--text-heading)', borderColor: 'var(--color-border)' }}>
              2. Hình ảnh
            </h3>
            <div className="form-group">
              <label className="form-label" htmlFor="images">Ảnh sản phẩm (chọn nhiều ảnh, tối đa 10) *</label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="form-input"
              />
              {selectedFiles.length > 0 && (
                <div className="flex gap-3 mt-4 flex-wrap">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Xem trước"
                        className="w-24 h-24 object-cover border rounded-lg shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- 3. Phân loại (Giữ nguyên) --- */}
            <h3 className="text-xl font-semibold mb-4 mt-6 border-t pt-4" style={{ color: 'var(--text-heading)', borderColor: 'var(--color-border)' }}>
              3. Phân loại
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="category">Danh mục</label>
                <select id="category" name="category" className="form-input" value={formData.category} onChange={handleChange}>
                  <option value="Vehicle">Xe Điện</option>
                  <option value="Battery">Pin/Ắc Quy</option>
                  <option value="Other">Linh kiện khác</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="condition">Tình trạng</label>
                <select id="condition" name="condition" className="form-input" value={formData.condition} onChange={handleChange}>
                  <option value="Used">Đã qua sử dụng</option>
                  <option value="New">Mới</option>
                  <option value="Refurbished">Đã tân trang</option>
                </select>
              </div>
            </div>

            {/* --- 4. Chi tiết (Giữ nguyên) --- */}
            <div className="mt-6">
              {formData.category === 'Vehicle' && (
                <div className="p-4 rounded-lg" style={{ background: 'var(--bg-muted)', border: '1px solid var(--color-border)' }}>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>Chi tiết Xe</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="vehicle_brand" placeholder="Hãng xe (VD: Vinfast)" value={formData.vehicle_brand} onChange={handleChange} className="form-input" />
                    <input name="vehicle_model" placeholder="Mẫu xe (VD: VF8)" value={formData.vehicle_model} onChange={handleChange} className="form-input" />
                    <input name="vehicle_manufacturing_year" placeholder="Năm sản xuất" type="number" min="1900" max={new Date().getFullYear()} value={formData.vehicle_manufacturing_year} onChange={handleChange} className="form-input" />
                    <input name="vehicle_mileage_km" placeholder="Số KM đã đi" type="number" min="0" value={formData.vehicle_mileage_km} onChange={handleChange} className="form-input" />
                  </div>
                </div>
              )}

              {formData.category === 'Battery' && (
                <div className="p-4 rounded-lg" style={{ background: 'var(--bg-muted)', border: '1px solid var(--color-border)' }}>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>Chi tiết Pin</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="battery_capacity_kwh" placeholder="Dung lượng (kWh)" type="number" min="0" step="0.1" value={formData.battery_capacity_kwh} onChange={handleChange} className="form-input" />
                    <input name="battery_condition_percentage" placeholder="Tình trạng Pin (%)" type="number" min="0" max="100" value={formData.battery_condition_percentage} onChange={handleChange} className="form-input" />
                  </div>
                </div>
              )}
            </div>

            {/* --- Nút Submit (Giữ nguyên) --- */}
            <button
              type="submit"
              disabled={loading || suggestingPrice} // Vô hiệu hóa khi đang gợi ý giá
              className="btn btn-primary btn-full mt-6 flex items-center justify-center"
            >
              {loading && <SpinnerIcon />}
              {loading ? 'Đang xử lý...' : 'Đăng tin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateListingPage;