# Frontend Mobile – EVB Market

Ứng dụng Flutter mô phỏng lại trải nghiệm của `frontend` web hiện tại trên di động, phục vụ các tính năng cốt lõi của sàn giao dịch pin & xe điện EVB.

## Tính năng chính

- Trang chủ giàu nội dung với danh mục, thống kê và danh sách tin nổi bật.
- Kho sản phẩm với tìm kiếm, lọc nâng cao (khu vực, model, khoảng giá).
- Chi tiết tin đăng, tạo tin mới và quản lý tin đăng cá nhân.
- Đăng nhập/đăng ký, hồ sơ cá nhân, wishlist, giao dịch.
- Module đấu giá (xem danh sách, chi tiết, đặt giá/mua ngay).
- Trò chuyện realtime (danh sách phòng, tin nhắn, gửi tin mới).

## Cấu trúc thư mục

```
lib/
 ├── app.dart                # MaterialApp + router
 ├── core/                   # config, theme, network, widgets chung
 ├── router/                 # GoRouter routes
 └── features/               # từng miền chức năng (auth, listings, chat,…)
```

## Thiết lập & chạy

```bash
cd Frontend_mobile
flutter pub get
flutter run -d chrome   # hoặc android/ios device tùy chọn
```

### Biến môi trường

Ứng dụng đọc các `dart-define` sau, mặc định trỏ về môi trường local:

| Key           | Mặc định                      | Mô tả                         |
|---------------|-------------------------------|--------------------------------|
| `API_BASE_URL`| `http://localhost:3000/api`   | Gateway REST backend           |
| `WS_BASE_URL` | `ws://localhost:3000`         | Endpoint websocket/chat        |

Ví dụ:

```bash
flutter run --dart-define API_BASE_URL=https://api.evb.market
```

## Backend tương thích

Ứng dụng tái sử dụng các REST API đã dùng ở `frontend` web:

- Listings: `/search/listings`, `/listings/public`, `/listings/:id`, `/listings/me`.
- Auctions: `/auctions`, `/auctions/:id`, `/auctions/:id/bids`, `/auctions/:id/buy-now`.
- Auth: `/auth/users/login`, `/auth/users/register`.
- Chat: `/chat/rooms`, `/chat/rooms/:roomId/messages`.

Đảm bảo gateway/API-Gateway đang chạy (xem thư mục `backend` của repo gốc).

## Kiểm thử

```bash
flutter test
```

## Ghi chú

- Một số màn hình (wishlist, cart, dashboard…) hiện hiển thị dữ liệu giả và sẽ cần nối với service tương ứng khi backend hoàn thiện.
- Khi triển khai thực tế hãy cấu hình DeepLink, push notification và provider dành riêng để nhận socket event real-time.*** End Patch
