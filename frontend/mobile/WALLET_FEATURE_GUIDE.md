# 💳 Hướng dẫn tính năng Ví - Mobile App

## 📋 Tổng quan

Tài liệu này mô tả các thay đổi đã thực hiện cho mobile app để hỗ trợ tính năng quản lý thông tin ví (wallet) của người dùng.

---

## 🗂️ Files đã thay đổi

### 1. Models
- ✅ **`lib/features/auth/models/user.dart`**
  - Thêm class `Wallet` với các fields: bankName, bankCode, accountNumber, accountName, branch
  - Cập nhật class `User` để có field `wallet`
  - Thêm các fields: firstName, lastName, phonenumber
  - Thêm method `copyWith()` cho User và Wallet

### 2. Data Layer
- ✅ **`lib/features/auth/data/auth_repository.dart`**
  - Thêm method `getProfile()` - Lấy thông tin user từ `/auth/me`
  - Thêm method `updateProfile()` - Cập nhật profile và wallet
  - Cập nhật `_extractUser()` để parse wallet và profile fields

### 3. Controller
- ✅ **`lib/features/auth/controllers/auth_controller.dart`**
  - Thêm method `refreshProfile()` - Refresh user data
  - Thêm method `updateProfile()` - Cập nhật profile với firstName, lastName, wallet

### 4. UI - Screens
- ✅ **`lib/features/profile/presentation/profile_screen.dart`**
  - Hiển thị thông tin user đầy đủ hơn
  - Thêm card "💳 Thông tin ví"
  - Hiển thị wallet info nếu đã có
  - Cảnh báo nếu chưa cập nhật ví
  - Thêm nút Edit ở AppBar

- ✅ **`lib/features/profile/presentation/edit_profile_screen.dart`** ⭐ MỚI
  - Màn hình edit profile với 2 tabs
  - Tab "Thông tin cá nhân": Edit firstName, lastName
  - Tab "💳 Thông tin ví": Edit wallet info
  - Validation cho các trường bắt buộc
  - Auto uppercase cho accountName và bankCode

### 5. Network
- ✅ **`lib/core/network/api_client.dart`**
  - Thêm method `put()` để support PUT requests

---

## 🎨 Giao diện

### Profile Screen

```
┌─────────────────────────────┐
│ Thông tin cá nhân      [✏️] │
├─────────────────────────────┤
│                             │
│    ┌─────────────────┐      │
│    │   User Card     │      │
│    │   - Avatar      │      │
│    │   - Username    │      │
│    │   - Email       │      │
│    │   - Role        │      │
│    │   - Name        │      │
│    └─────────────────┘      │
│                             │
│    ┌─────────────────┐      │
│    │ 💳 Thông tin ví │ ✓/⚠ │
│    ├─────────────────┤      │
│    │ Ngân hàng: VCB  │      │
│    │ Số TK: 123...   │      │
│    │ Tên TK: NGUYEN..│      │
│    └─────────────────┘      │
│                             │
│    ┌─────────────────┐      │
│    │ Menu            │      │
│    │ - Yêu thích     │      │
│    │ - Tin đăng      │      │
│    │ - Hộp thư       │      │
│    └─────────────────┘      │
│                             │
│    [Đăng xuất]              │
│                             │
└─────────────────────────────┘
```

### Edit Profile Screen

```
┌─────────────────────────────┐
│ Chỉnh sửa thông tin   [Lưu] │
├─────────────────────────────┤
│ [Thông tin cá nhân] [💳 Ví] │
├─────────────────────────────┤
│                             │
│  Tab 1: Thông tin cá nhân   │
│  ┌─────────────────────┐    │
│  │ Họ: [________]      │    │
│  │ Tên: [________]     │    │
│  └─────────────────────┘    │
│                             │
│  Tab 2: Thông tin ví        │
│  ┌─────────────────────┐    │
│  │ ℹ️ Lưu ý quan trọng │    │
│  │ • Tên TK viết HOA   │    │
│  │ • Kiểm tra số TK    │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ Tên NH: [________]  │    │
│  │ Mã NH: [________]   │    │
│  │ Số TK: [________]   │    │
│  │ Tên TK: [________]  │    │
│  │ Chi nhánh: [_____]  │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

---

## 🚀 Cách sử dụng

### Cho User

1. **Xem thông tin ví:**
   - Mở app → Vào Profile
   - Xem card "💳 Thông tin ví"
   - Nếu chưa có, sẽ hiển thị cảnh báo màu cam

2. **Cập nhật thông tin ví:**
   - Vào Profile → Click nút Edit (✏️) ở góc phải trên
   - Chọn tab "💳 Thông tin ví"
   - Điền đầy đủ thông tin:
     - Tên ngân hàng (bắt buộc)
     - Mã ngân hàng (bắt buộc)
     - Số tài khoản (bắt buộc)
     - Tên chủ tài khoản (bắt buộc, tự động viết HOA)
     - Chi nhánh (tùy chọn)
   - Click "Lưu"

3. **Cập nhật thông tin cá nhân:**
   - Vào Profile → Click nút Edit (✏️)
   - Chọn tab "Thông tin cá nhân"
   - Điền Họ và Tên
   - Click "Lưu"

---

## 🔌 API Integration

### Endpoints sử dụng

```dart
// Get profile
GET /auth/me
Headers: Authorization: Bearer <token>

// Update profile
PUT /auth/users/:userId
Headers: Authorization: Bearer <token>
Body: {
  "firstName": "Văn A",
  "lastName": "Nguyễn",
  "wallet": {
    "bankName": "Vietcombank",
    "bankCode": "VCB",
    "accountNumber": "1234567890",
    "accountName": "NGUYEN VAN A",
    "branch": "Chi nhánh Hà Nội"
  }
}
```

---

## ✅ Validation

### Wallet Form
- **Tên ngân hàng**: Bắt buộc
- **Mã ngân hàng**: Bắt buộc, tự động uppercase
- **Số tài khoản**: Bắt buộc, chỉ số
- **Tên chủ tài khoản**: Bắt buộc, tự động uppercase
- **Chi nhánh**: Tùy chọn

### Profile Form
- **Họ**: Tùy chọn
- **Tên**: Tùy chọn

---

## 🎯 Features

### Wallet Class
```dart
class Wallet {
  final String bankName;
  final String bankCode;
  final String accountNumber;
  final String accountName;
  final String branch;
  
  bool get hasWalletInfo; // Check if wallet is complete
  Wallet copyWith({...});
}
```

### User Class Updates
```dart
class User {
  final String id;
  final String email;
  final String username;
  final String role;
  final bool isActive;
  final String? firstName;      // ⭐ NEW
  final String? lastName;       // ⭐ NEW
  final String? phonenumber;    // ⭐ NEW
  final Wallet wallet;          // ⭐ NEW
  
  User copyWith({...});
}
```

---

## 📱 Screenshots (Mô tả)

### Profile Screen - Chưa có ví
- Card ví hiển thị icon ⚠️ màu cam
- Thông báo: "Vui lòng cập nhật thông tin ví để nhận tiền từ giao dịch"

### Profile Screen - Đã có ví
- Card ví hiển thị icon ✓ màu xanh
- Hiển thị đầy đủ thông tin: Ngân hàng, Mã NH, Số TK, Tên TK, Chi nhánh

### Edit Profile Screen
- 2 tabs: "Thông tin cá nhân" và "💳 Thông tin ví"
- Tab ví có info box màu xanh với lưu ý quan trọng
- Tất cả fields có border và label rõ ràng
- Nút "Lưu" ở AppBar

---

## 🔮 Tính năng tương lai

- [ ] Upload ảnh avatar
- [ ] Xác thực OTP khi đổi email/phone
- [ ] Lịch sử giao dịch
- [ ] Thông báo khi nhận được tiền
- [ ] QR code cho thông tin ví

---

**Ngày cập nhật:** 2024-11-22
**Version:** 1.0.0
**Status:** ✅ Hoàn thành

