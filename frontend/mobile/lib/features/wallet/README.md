# Wallet Feature - Mobile App

## 📱 Tổng quan

Tính năng Ví Nội bộ cho phép seller quản lý số dư và yêu cầu rút tiền về tài khoản ngân hàng.

## 🎯 Tính năng

### Seller Features
1. **Xem số dư ví** - Hiển thị số tiền nhận được từ các giao dịch
2. **Yêu cầu rút tiền** - Gửi yêu cầu rút tiền về ngân hàng
3. **Lịch sử rút tiền** - Xem trạng thái các yêu cầu rút tiền

### Admin Features
1. **Quản lý yêu cầu** - Xem danh sách yêu cầu chờ duyệt
2. **Duyệt/Từ chối** - Xử lý yêu cầu rút tiền
3. **Lịch sử** - Xem các yêu cầu đã xử lý

## 📁 Cấu trúc File

```
lib/features/wallet/
├── data/
│   ├── models/
│   │   └── wallet_models.dart          # WalletBalance, WithdrawalRequest, BankInfo
│   └── api/
│       └── wallet_api_service.dart     # API service
└── presentation/
    ├── wallet_screen.dart              # Màn hình ví cho seller
    └── admin_withdrawal_screen.dart    # Màn hình quản lý cho admin
```

## 🔧 Cài đặt

### 1. Thêm dependencies vào `pubspec.yaml`

```yaml
dependencies:
  dio: ^5.0.0
  intl: ^0.18.0
```

### 2. Khởi tạo WalletApiService

```dart
import 'package:dio/dio.dart';
import 'features/wallet/data/api/wallet_api_service.dart';

// Trong main.dart hoặc dependency injection
final dio = Dio(BaseOptions(
  baseURL: 'YOUR_API_URL',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
  },
));

final walletApiService = WalletApiService(dio);
```

### 3. Thêm routes

```dart
// Trong router/app_router.dart hoặc tương tự
import 'features/wallet/presentation/wallet_screen.dart';
import 'features/wallet/presentation/admin_withdrawal_screen.dart';

// Route cho seller
GoRoute(
  path: '/wallet',
  builder: (context, state) => WalletScreen(
    walletApiService: walletApiService,
  ),
),

// Route cho admin
GoRoute(
  path: '/admin/withdrawals',
  builder: (context, state) => AdminWithdrawalScreen(
    walletApiService: walletApiService,
  ),
),
```

### 4. Thêm navigation

```dart
// Trong profile screen hoặc menu
ListTile(
  leading: const Icon(Icons.account_balance_wallet),
  title: const Text('Ví của tôi'),
  onTap: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WalletScreen(
          walletApiService: walletApiService,
        ),
      ),
    );
  },
),

// Cho admin
ListTile(
  leading: const Icon(Icons.money_off),
  title: const Text('Quản lý Rút tiền'),
  onTap: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AdminWithdrawalScreen(
          walletApiService: walletApiService,
        ),
      ),
    );
  },
),
```

## 🎨 UI Components

### Wallet Screen (Seller)
- **Gradient Balance Card** - Hiển thị số dư với gradient đẹp mắt
- **Withdrawal Button** - Nút yêu cầu rút tiền
- **Withdrawal Dialog** - Form nhập số tiền và ghi chú
- **History List** - Danh sách yêu cầu với status badges

### Admin Withdrawal Screen
- **Tab View** - Chờ duyệt / Lịch sử
- **Withdrawal Cards** - Hiển thị chi tiết yêu cầu
- **Bank Info Display** - Thông tin ngân hàng đầy đủ
- **Action Buttons** - Duyệt / Từ chối

## 🔌 API Endpoints

### Seller Endpoints
- `GET /wallet/balance` - Lấy số dư ví
- `GET /withdrawals/my-requests` - Lấy danh sách yêu cầu
- `POST /withdrawals/request` - Tạo yêu cầu rút tiền

### Admin Endpoints
- `GET /admin/withdrawals/pending` - Danh sách chờ duyệt
- `GET /admin/withdrawals/history` - Lịch sử đã xử lý
- `POST /admin/withdrawals/:id/approve` - Duyệt yêu cầu
- `POST /admin/withdrawals/:id/reject` - Từ chối yêu cầu

## 💡 Sử dụng

### Seller - Yêu cầu rút tiền

1. Mở màn hình "Ví của tôi"
2. Xem số dư hiện tại
3. Nhấn "💸 Yêu cầu rút tiền"
4. Nhập số tiền và ghi chú (tùy chọn)
5. Nhấn "Gửi yêu cầu"
6. Đợi admin xử lý trong vòng 24h

### Admin - Duyệt yêu cầu

1. Mở màn hình "Quản lý Rút tiền"
2. Tab "Chờ duyệt" - xem danh sách yêu cầu
3. Nhấn "Duyệt" trên yêu cầu muốn xử lý
4. Kiểm tra thông tin ngân hàng
5. Nhập mã giao dịch (sau khi chuyển khoản)
6. Xác nhận

## 🎯 Validation

### Yêu cầu rút tiền
- Số tiền phải > 0
- Số tiền không được vượt quá số dư
- Phải có thông tin ngân hàng đầy đủ

### Admin duyệt
- Phải nhập lý do khi từ chối
- Có thể nhập mã giao dịch khi duyệt

## 🎨 Customization

### Màu sắc
Bạn có thể tùy chỉnh màu sắc trong code:

```dart
// Gradient cho balance card
gradient: const LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [Color(0xFF667eea), Color(0xFF764ba2)], // Thay đổi màu tại đây
),

// Status colors
Color get statusColor {
  switch (status) {
    case 'pending':
      return Colors.orange;  // Thay đổi màu
    case 'completed':
      return Colors.green;
    case 'rejected':
      return Colors.red;
    default:
      return Colors.grey;
  }
}
```

### Format tiền tệ
```dart
final NumberFormat _currencyFormat = NumberFormat.currency(
  locale: 'vi_VN',  // Thay đổi locale
  symbol: 'đ',      // Thay đổi ký hiệu
  decimalDigits: 0, // Số chữ số thập phân
);
```

## 🐛 Troubleshooting

### Lỗi "Failed to get wallet balance"
- Kiểm tra token authorization
- Kiểm tra API endpoint URL
- Kiểm tra network connection

### Lỗi "Số dư không đủ"
- Đảm bảo số tiền nhập <= số dư hiện tại
- Reload lại màn hình để cập nhật số dư mới nhất

### Lỗi "Vui lòng cập nhật thông tin ngân hàng"
- Seller cần cập nhật thông tin ngân hàng trong Profile trước khi rút tiền

## 📝 Notes

- Tất cả số tiền được format theo locale Việt Nam
- Ngày tháng được format theo định dạng dd/MM/yyyy HH:mm
- Pull-to-refresh được hỗ trợ trên tất cả danh sách
- Loading states và error handling đã được implement đầy đủ

## 🚀 Future Enhancements

- [ ] Push notification khi yêu cầu được duyệt/từ chối
- [ ] Biểu đồ thống kê thu nhập
- [ ] Export lịch sử rút tiền
- [ ] Tích hợp QR code cho thông tin ngân hàng
- [ ] Dark mode support
