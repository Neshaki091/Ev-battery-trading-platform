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

// === Danh sách tỉnh/thành sau sáp nhập (rút gọn, có thể chỉnh sửa thêm nếu cần) ===
const MERGED_PROVINCES = [
  'Hà Nội',
  'Huế',
  'Lai Châu',
  'Điện Biên',
  'Sơn La',
  'Lạng Sơn',
  'Quảng Ninh',
  'Thanh Hóa',
  'Nghệ An',
  'Hà Tĩnh',
  'Cao Bằng',
  'Tuyên Quang',
  'Lào Cai',
  'Thái Nguyên',
  'Phú Thọ',
  'Bắc Ninh',
  'Hưng Yên',
  'Hải Phòng',
  'Ninh Bình',
  'Quảng Trị',
  'Đà Nẵng',
  'Quảng Ngãi',
  'Gia Lai',
  'Khánh Hòa',
  'Lâm Đồng',
  'Đắk Lắk',
  'Hồ Chí Minh',
  'Đồng Nai',
  'Tây Ninh',
  'Cần Thơ',
  'Vĩnh Long',
  'Đồng Tháp',
  'Cà Mau',
  'An Giang',
];


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


  const handleSubmit = async (e, createAuction = false) => {
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

      const response = await api.post('/listings/', body);
      const listingId = response.data?.data?._id || response.data?._id;

      if (createAuction && listingId) {
        alert('Tin đăng đã tạo! Bây giờ hãy thiết lập đấu giá.');
        navigate(`/create-auction/${listingId}`, {
          state: {
            listingTitle: formData.title,
            listingPrice: formData.price
          }
        });
      } else {
        alert('Tạo thành công. Đợi admin duyệt.');
        navigate('/');
      }
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
        <div
          className="card card-lg"
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '2.25rem 2rem',
          }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h2 className="text-3xl font-bold" style={{ color: 'var(--text-heading)' }}>
                Tạo tin đăng mới
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-body)' }}>
                Điền thông tin chi tiết, thêm hình ảnh rõ nét để tin của bạn nổi bật hơn trên EVB Marketplace.
              </p>
            </div>
            <div
              className="hidden md:flex flex-col items-end text-xs"
              style={{ color: 'var(--text-body)' }}
            >
              <span>⚡ Thời gian hoàn tất trung bình: 2–3 phút</span>
              <span>✅ Tin sẽ được admin duyệt trước khi hiển thị công khai</span>
            </div>
          </div>

          {error && <div className="error-message mb-4">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)] gap-8">
            {/* Cột trái: Form chính */}
            <form onSubmit={(e) => handleSubmit(e, false)}>
              {/* --- 1. Thông tin cơ bản --- */}
              <section className="mb-6">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>
                    1. Thông tin cơ bản
                  </h3>
                  <span className="text-xs" style={{ color: 'var(--text-body)' }}>
                    Các trường có dấu * là bắt buộc
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="title">
                    Tiêu đề *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="VD: VinFast VF8 Plus 2022, chạy 20.000km"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">
                    Mô tả chi tiết *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    className="form-input"
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả tình trạng xe/pin, lịch sử sử dụng, bảo dưỡng, phụ kiện đi kèm và lý do bán..."
                  />
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-body)' }}>
                    Gợi ý: nội dung rõ ràng, trung thực sẽ giúp tin được duyệt nhanh hơn và thu hút nhiều người mua.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <div className="flex justify-between items-center mb-1">
                      <label
                        className="form-label"
                        htmlFor="price"
                        style={{ marginBottom: 0 }}
                      >
                        Giá (VND) *
                      </label>
                      <button
                        type="button"
                        onClick={handleSuggestPrice}
                        disabled={suggestingPrice || loading}
                        className="btn-secondary"
                        style={{
                          borderRadius: '999px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          borderColor: 'transparent',
                          background: 'var(--bg-muted)',
                        }}
                      >
                        <SparkleIcon />
                        {suggestingPrice ? 'Đang gợi ý...' : 'Gợi ý giá'}
                      </button>
                    </div>

                    <input
                      id="price"
                      name="price"
                      type="number"
                      required
                      className="form-input"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      placeholder="VD: 800000000"
                    />
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-body)' }}>
                      Giá niêm yết đã bao gồm các loại phí mà bạn mong muốn (nếu có).
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="location">
                      Vị trí *
                    </label>
                    <select
                      id="location"
                      name="location"
                      required
                      className="form-input"
                      value={formData.location}
                      onChange={handleChange}
                      style={{
                        maxHeight: '220px',
                        overflowY: 'auto',
                      }}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {MERGED_PROVINCES.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* --- 2. Hình ảnh --- */}
              <section className="mb-6">
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: 'var(--text-heading)' }}
                >
                  2. Hình ảnh sản phẩm
                </h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="images">
                    Ảnh sản phẩm (chọn nhiều ảnh, tối đa 10) *
                  </label>
                  <input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="form-input"
                  />
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-body)' }}>
                    Nên dùng ảnh thực tế, rõ nét (tối thiểu 3 ảnh) chụp nhiều góc khác nhau của xe/pin.
                  </p>

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
              </section>

              {/* --- 3. Phân loại --- */}
              <section className="mb-6">
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: 'var(--text-heading)' }}
                >
                  3. Phân loại & tình trạng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="category">
                      Danh mục
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="form-input"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="Vehicle">Xe Điện</option>
                      <option value="Battery">Pin/Ắc Quy</option>
                      <option value="Other">Linh kiện khác</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="condition">
                      Tình trạng
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      className="form-input"
                      value={formData.condition}
                      onChange={handleChange}
                    >
                      <option value="Used">Đã qua sử dụng</option>
                      <option value="New">Mới</option>
                      <option value="Refurbished">Đã tân trang</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* --- 4. Chi tiết bổ sung --- */}
              <section className="mb-6">
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: 'var(--text-heading)' }}
                >
                  4. Thông số chi tiết
                </h3>
                <div className="mt-2">
                  {formData.category === 'Vehicle' && (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <h4
                        className="text-sm font-semibold mb-3 uppercase tracking-wide"
                        style={{ color: 'var(--text-heading)' }}
                      >
                        Thông tin xe điện
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          name="vehicle_brand"
                          placeholder="Hãng xe (VD: VinFast)"
                          value={formData.vehicle_brand}
                          onChange={handleChange}
                          className="form-input"
                        />
                        <input
                          name="vehicle_model"
                          placeholder="Mẫu xe (VD: VF8)"
                          value={formData.vehicle_model}
                          onChange={handleChange}
                          className="form-input"
                        />
                        <input
                          name="vehicle_manufacturing_year"
                          placeholder="Năm sản xuất"
                          type="number"
                          min="1900"
                          max={new Date().getFullYear()}
                          value={formData.vehicle_manufacturing_year}
                          onChange={handleChange}
                          className="form-input"
                        />
                        <input
                          name="vehicle_mileage_km"
                          placeholder="Số KM đã đi"
                          type="number"
                          min="0"
                          value={formData.vehicle_mileage_km}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                    </div>
                  )}

                  {formData.category === 'Battery' && (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <h4
                        className="text-sm font-semibold mb-3 uppercase tracking-wide"
                        style={{ color: 'var(--text-heading)' }}
                      >
                        Thông tin pin / ắc quy
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          name="battery_capacity_kwh"
                          placeholder="Dung lượng (kWh)"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.battery_capacity_kwh}
                          onChange={handleChange}
                          className="form-input"
                        />
                        <input
                          name="battery_condition_percentage"
                          placeholder="Tình trạng Pin (%)"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.battery_condition_percentage}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Nút Submit */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="submit"
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={loading || suggestingPrice}
                  className="btn btn-primary btn-full flex items-center justify-center"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {loading && <SpinnerIcon />}
                  {loading ? 'Đang xử lý...' : '🏪 Đăng tin ngay'}
                </button>
              </div>
            </form>

            {/* Cột phải: Tóm tắt & tips */}
            <aside
              className="hidden lg:block"
              style={{
                alignSelf: 'flex-start',
                position: 'sticky',
                top: '6rem',
              }}
            >
              <div
                className="p-4 rounded-lg mb-4"
                style={{
                  background:
                    'linear-gradient(135deg, #eff6ff 0%, #ecfeff 50%, #fef9c3 100%)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <h4
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-heading)' }}
                >
                  Tóm tắt nhanh
                </h4>
                <ul className="text-xs space-y-1" style={{ color: 'var(--text-body)' }}>
                  <li>
                    <strong>Tiêu đề:</strong>{' '}
                    {formData.title || 'Chưa nhập'}
                  </li>
                  <li>
                    <strong>Giá:</strong>{' '}
                    {formData.price
                      ? `${Number(formData.price).toLocaleString('vi-VN')} VND`
                      : 'Chưa nhập'}
                  </li>
                  <li>
                    <strong>Vị trí:</strong> {formData.location || 'Chưa chọn'}
                  </li>
                  <li>
                    <strong>Danh mục:</strong>{' '}
                    {formData.category === 'Vehicle'
                      ? 'Xe Điện'
                      : formData.category === 'Battery'
                      ? 'Pin/Ắc Quy'
                      : 'Linh kiện khác'}
                  </li>
                  <li>
                    <strong>Tình trạng:</strong>{' '}
                    {formData.condition === 'New'
                      ? 'Mới'
                      : formData.condition === 'Refurbished'
                      ? 'Đã tân trang'
                      : 'Đã qua sử dụng'}
                  </li>
                  <li>
                    <strong>Ảnh đã chọn:</strong> {selectedFiles.length} / 10
                  </li>
                </ul>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <h4
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-heading)' }}
                >
                  Mẹo đăng tin hiệu quả
                </h4>
                <ul className="list-disc ml-4 text-xs space-y-1" style={{ color: 'var(--text-body)' }}>
                  <li>Tiêu đề rõ ràng, có năm sản xuất và phiên bản.</li>
                  <li>Đăng ít nhất 5 ảnh, chụp đủ ngoại thất, nội thất và odo.</li>
                  <li>Trung thực về tình trạng, nêu rõ lỗi (nếu có).</li>
                  <li>Chọn đúng khu vực để người mua dễ tìm kiếm.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateListingPage;