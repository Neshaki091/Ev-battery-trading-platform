# 💳 Giao diện Thanh toán Casso - Hướng dẫn sử dụng

## 📋 Tổng quan

Giao diện thanh toán Casso đã được tích hợp hoàn chỉnh vào hệ thống EVB Trading Platform, cho phép khách hàng thanh toán đơn hàng qua chuyển khoản ngân hàng và tự động cập nhật trạng thái khi webhook Casso nhận được thông báo.

## 🎯 Các tính năng đã triển khai

### 1. **Trang thanh toán Casso** (`PaymentPage.jsx`)
- ✅ Hiển thị thông tin đơn hàng (mã đơn, loại sản phẩm, giá)
- ✅ Hiển thị thông tin ngân hàng để chuyển khoản
- ✅ Tự động tạo nội dung chuyển khoản với format `ORDER#<orderId>`
- ✅ Nút sao chép nhanh (số tài khoản, số tiền, nội dung)
- ✅ Hướng dẫn chi tiết từng bước thanh toán
- ✅ Tự động kiểm tra trạng thái thanh toán mỗi 5 giây
- ✅ Tự động chuyển hướng về giỏ hàng khi thanh toán thành công

### 2. **Component theo dõi trạng thái** (`PaymentStatus.jsx`)
- ✅ Hiển thị trạng thái thanh toán real-time
- ✅ Tự động polling để kiểm tra trạng thái
- ✅ Hiển thị thông tin chi tiết từ Casso (mã giao dịch, ngân hàng, số tiền)
- ✅ Nút làm mới thủ công
- ✅ Callback khi thanh toán thành công

### 3. **Service API** (`payment.js`)
- ✅ `getOrderDetails()` - Lấy thông tin đơn hàng
- ✅ `checkPaymentStatus()` - Kiểm tra trạng thái thanh toán
- ✅ `processManualPayment()` - Thanh toán thủ công (không qua Casso)
- ✅ `downloadContract()` - Tải hợp đồng PDF

### 4. **Cập nhật CartPage**
- ✅ Nút "Thanh toán qua Casso" (chính)
- ✅ Nút "Thanh toán thủ công" (phụ, cho admin test)
- ✅ Link đến trang thanh toán `/payment/:orderId`

## 🚀 Cách sử dụng

### Luồng thanh toán của khách hàng

1. **Tạo đơn hàng**
   - Khách hàng vào trang sản phẩm
   - Nhấn "Mua ngay"
   - Đơn hàng được tạo với status `pending`

2. **Chuyển đến trang thanh toán**
   - Vào giỏ hàng (`/cart`)
   - Nhấn nút "Thanh toán qua Casso"
   - Chuyển đến `/payment/:orderId`

3. **Thực hiện chuyển khoản**
   - Xem thông tin ngân hàng
   - Sao chép số tài khoản, số tiền, nội dung
   - Mở app ngân hàng và chuyển khoản
   - **Quan trọng**: Nhập đúng nội dung `ORDER#<orderId>`

4. **Hệ thống tự động cập nhật**
   - Casso nhận thông báo từ ngân hàng
   - Webhook gửi về backend
   - Backend cập nhật status: `pending` → `paid`
   - Frontend tự động phát hiện và chuyển về giỏ hàng

## 📁 Cấu trúc file

```
frontend/web/src/
├── pages/
│   ├── PaymentPage.jsx          # Trang thanh toán chính
│   └── CartPage.jsx             # Đã cập nhật với nút Casso
├── components/
│   └── PaymentStatus.jsx        # Component theo dõi trạng thái
├── services/
│   └── payment.js               # API service cho payment
├── css/
│   ├── PaymentPage.css          # Styles cho trang thanh toán
│   └── PaymentStatus.css        # Styles cho component status
└── App.jsx                      # Đã thêm route /payment/:orderId
```

## 🎨 Giao diện

### Trang thanh toán
- **Cột trái**: Thông tin đơn hàng + Component theo dõi trạng thái
- **Cột phải**: Thông tin ngân hàng (gradient đẹp mắt)
- **Responsive**: Tự động chuyển sang 1 cột trên mobile

### Component trạng thái
- **Pending**: Màu vàng, icon đồng hồ
- **Paid**: Màu xanh, icon check, hiển thị thông tin Casso

## 🔧 Cấu hình

### Thông tin ngân hàng

Hiện tại thông tin ngân hàng được hard-code trong `PaymentPage.jsx`:

```javascript
const bankInfo = {
  bankName: 'Vietcombank',
  bankCode: 'VCB',
  accountNumber: '1234567890',
  accountName: 'CONG TY TNHH EVB TRADING',
  branch: 'Chi nhánh Hà Nội'
};
```

**Khuyến nghị**: Di chuyển vào environment variables hoặc config file:

```javascript
const bankInfo = {
  bankName: import.meta.env.VITE_BANK_NAME || 'Vietcombank',
  bankCode: import.meta.env.VITE_BANK_CODE || 'VCB',
  accountNumber: import.meta.env.VITE_BANK_ACCOUNT || '1234567890',
  accountName: import.meta.env.VITE_BANK_ACCOUNT_NAME || 'CONG TY TNHH EVB TRADING',
  branch: import.meta.env.VITE_BANK_BRANCH || 'Chi nhánh Hà Nội'
};
```

### Polling interval

Mặc định kiểm tra trạng thái mỗi 5 giây. Có thể thay đổi:

```jsx
<PaymentStatus 
  orderId={orderId}
  pollInterval={3000}  // 3 giây
/>
```

## 🧪 Testing

### Test local

1. Tạo đơn hàng test
2. Vào trang thanh toán
3. Sử dụng script test webhook:

```bash
cd backend/services/transaction-service
node test-webhook.js <orderId> <amount>
```

4. Xem giao diện tự động cập nhật

### Test production

1. Cấu hình webhook URL trên Casso dashboard
2. Thực hiện chuyển khoản thật
3. Kiểm tra log backend và frontend

## 📱 Responsive Design

- ✅ Desktop: 2 cột (thông tin đơn hàng | thông tin ngân hàng)
- ✅ Tablet: 2 cột thu nhỏ
- ✅ Mobile: 1 cột, stack vertical

## 🎯 Các bước tiếp theo (tùy chọn)

- [ ] Tạo trang chi tiết giao dịch (`TransactionDetailPage.jsx`)
- [ ] Thêm QR code thanh toán
- [ ] Thêm thông báo push khi thanh toán thành công
- [ ] Lưu lịch sử thanh toán vào localStorage
- [ ] Thêm filter/search trong lịch sử giao dịch

## 🐛 Troubleshooting

### Không tự động cập nhật trạng thái
- Kiểm tra webhook backend có hoạt động không
- Kiểm tra nội dung chuyển khoản có đúng format `ORDER#<orderId>`
- Xem console log để debug

### Lỗi khi sao chép
- Kiểm tra browser có hỗ trợ Clipboard API
- Thử trên HTTPS (localhost OK)

### Không chuyển hướng sau khi thanh toán
- Kiểm tra callback `onPaymentSuccess`
- Xem console log

## 📞 Liên hệ

Nếu có vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 2024-11-20

