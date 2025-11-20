# Phân Tích Khác Biệt và Kế Hoạch Đồng Bộ Hóa Web → Mobile

## BƯỚC 1: PHÂN TÍCH VÀ LIỆT KÊ KHÁC BIỆT

### 1. QUẢN LÝ PROFILE

#### Web Version (ProfilePage.jsx)
**Tính năng có:**
- ✅ Lấy thông tin profile từ `/auth/me`
- ✅ Hiển thị đầy đủ: ID, Họ, Tên, Email, Phone, Username, Role, Status
- ✅ Modal chỉnh sửa với 2 tabs:
  - Tab "Chỉnh sửa thông tin": Cập nhật email, phonenumber, firstName, lastName
  - Tab "Đổi mật khẩu": Đổi mật khẩu với oldPassword/newPassword
- ✅ API endpoints:
  - `GET /auth/me` - Lấy thông tin user
  - `PUT /auth/users/{userId}` - Cập nhật profile
  - `POST /auth/users/{userId}/change-password` - Đổi mật khẩu
- ✅ Validation và error handling đầy đủ
- ✅ Cập nhật localStorage sau khi sửa

#### Mobile Version (profile_screen.dart)
**Tính năng thiếu:**
- ❌ Không có chức năng cập nhật profile
- ❌ Không có chức năng đổi mật khẩu
- ❌ Chỉ hiển thị thông tin cơ bản (username, email, role)
- ❌ Không có API call để lấy thông tin chi tiết từ `/auth/me`
- ❌ Không có form chỉnh sửa

**Khác biệt:**
| Tính năng | Web | Mobile | Trạng thái |
|-----------|-----|--------|------------|
| Hiển thị thông tin đầy đủ | ✅ | ❌ | Thiếu |
| Cập nhật email/phonenumber | ✅ | ❌ | Thiếu |
| Cập nhật firstName/lastName | ✅ | ❌ | Thiếu |
| Đổi mật khẩu | ✅ | ❌ | Thiếu |
| Modal/Dialog chỉnh sửa | ✅ | ❌ | Thiếu |

---

### 2. TÌM KIẾM NÂNG CAO

#### Web Version (ProductsPage.jsx, HomePage.jsx)
**Tính năng có:**
- ✅ Search query từ URL params (`?q=...`)
- ✅ Filters: location, model, minPrice, maxPrice
- ✅ Client-side filtering với useMemo
- ✅ API endpoint: `/search/listings/` với params:
  - `q`: query string
  - `sort_by`: newest, price_asc, price_desc
  - `limit`: số lượng kết quả
  - `category`: Vehicle, Battery, Other
- ✅ Fallback sang `/listings/public` nếu search API lỗi
- ✅ Hiển thị filter UI với toggle
- ✅ Clear filters functionality

#### Mobile Version (products_screen.dart, listing_search_controller.dart)
**Tính năng có:**
- ✅ Search query cơ bản
- ✅ Filters: location, model, minPrice, maxPrice
- ✅ API endpoint tương tự
- ✅ Fallback mechanism

**Tính năng thiếu:**
- ❌ Pagination (phân trang)
- ❌ Sort options (sắp xếp) - chỉ có newest
- ❌ Infinite scroll / Load more
- ❌ URL params sync (không có deep linking)

**Khác biệt:**
| Tính năng | Web | Mobile | Trạng thái |
|-----------|-----|--------|------------|
| Search query | ✅ | ✅ | OK |
| Filters cơ bản | ✅ | ✅ | OK |
| Pagination | ⚠️ (limit) | ❌ | Thiếu |
| Sort options | ⚠️ (newest) | ❌ | Thiếu |
| Infinite scroll | ❌ | ❌ | Cả hai thiếu |

---

### 3. THÔNG BÁO (NOTIFICATIONS)

#### Web Version
**Tính năng có:**
- ✅ API endpoint: `/chat/notifications` (từ chat.js)
- ✅ Hiển thị trong ChatRoomPage
- ✅ Quản lý trạng thái đã đọc

#### Mobile Version
**Tính năng thiếu:**
- ❌ Không có màn hình notifications riêng
- ❌ Không có service để fetch notifications
- ❌ Không có badge hiển thị số thông báo chưa đọc
- ❌ Không có push notifications

**Khác biệt:**
| Tính năng | Web | Mobile | Trạng thái |
|-----------|-----|--------|------------|
| Fetch notifications | ✅ | ❌ | Thiếu |
| Hiển thị notifications | ✅ | ❌ | Thiếu |
| Đánh dấu đã đọc | ✅ | ❌ | Thiếu |
| Badge số lượng | ❌ | ❌ | Cả hai thiếu |

---

### 4. ĐĂNG TIN/SẢN PHẨM

#### Web Version (CreateListingPage.jsx, EditListingPage.jsx)
**Tính năng có:**
- ✅ Upload ảnh lên Cloudinary:
  - Cloud name: `dgoze8lyy`
  - Upload preset: `EVB_listing`
  - Hỗ trợ multiple files (tối đa 10)
  - Preview ảnh trước khi upload
  - Xóa ảnh đã chọn
- ✅ AI Gợi ý giá:
  - API: `POST /listings/suggest-price`
  - Input: title, description, location, condition, category, + chi tiết Vehicle/Battery
  - Output: suggestedPrice (làm tròn đến 1000 VND)
  - Button "Gợi ý giá" với icon sparkle
- ✅ Validation đầy đủ:
  - Bắt buộc có ít nhất 1 ảnh
  - Giá phải > 0
  - Các field required
- ✅ Edit Listing:
  - Tách biệt existing images và new images
  - Gộp ảnh cũ + ảnh mới khi submit
  - API: `PUT /listings/{id}`

#### Mobile Version (create_listing_screen.dart)
**Tính năng có:**
- ✅ Form với đầy đủ fields
- ✅ Category và condition dropdowns
- ✅ Vehicle/Battery specific fields
- ✅ Validation cơ bản

**Tính năng thiếu:**
- ❌ Upload ảnh (chỉ có TODO comment)
- ❌ Image picker integration
- ❌ Cloudinary upload
- ❌ Preview ảnh
- ❌ AI gợi ý giá
- ❌ Edit Listing screen

**Khác biệt:**
| Tính năng | Web | Mobile | Trạng thái |
|-----------|-----|--------|------------|
| Form fields | ✅ | ✅ | OK |
| Upload ảnh | ✅ | ❌ | Thiếu |
| Image picker | ✅ | ❌ | Thiếu |
| Preview ảnh | ✅ | ❌ | Thiếu |
| AI gợi ý giá | ✅ | ❌ | Thiếu |
| Edit listing | ✅ | ❌ | Thiếu |

---

### 5. CÁC DỊCH VỤ KHÁC

#### A. TRANSACTION/PAYMENT (CartPage.jsx)
**Web Version có:**
- ✅ Lịch sử giao dịch: `GET /transactions/orders/history`
- ✅ Thanh toán: `POST /transactions/orders/{orderId}/payment/`
- ✅ Tải hợp đồng: `GET /transactions/orders/{orderId}/contract/` (PDF)
- ✅ Hiển thị chi tiết transaction với modal
- ✅ Tính tổng pending và paid
- ✅ Status badges (pending, paid)
- ✅ Link đến product detail

**Mobile Version thiếu:**
- ❌ Không có màn hình transaction history
- ❌ Không có chức năng thanh toán
- ❌ Không có download contract
- ❌ CartScreen chỉ là placeholder

**Khác biệt:**
| Tính năng | Web | Mobile | Trạng thái |
|-----------|-----|--------|------------|
| Transaction history | ✅ | ❌ | Thiếu |
| Payment | ✅ | ❌ | Thiếu |
| Download contract | ✅ | ❌ | Thiếu |
| Transaction details | ✅ | ❌ | Thiếu |

#### B. WISHLIST
**Web Version có:**
- ✅ API: `GET /wishlist/my` - Lấy danh sách IDs
- ✅ Fetch details cho từng listing
- ✅ Delete: `DELETE /wishlist/{listingId}`

**Mobile Version:**
- ⚠️ Có WishlistScreen nhưng chỉ là placeholder
- ❌ Không có API integration

#### C. EDIT LISTING
**Web Version có:**
- ✅ EditListingPage.jsx đầy đủ
- ✅ Load existing data
- ✅ Update với PUT API
- ✅ Quản lý ảnh cũ/mới

**Mobile Version:**
- ❌ Không có Edit Listing screen

#### D. PRODUCT DETAIL ENHANCEMENTS
**Web Version có:**
- ✅ Seller orders: `GET /transactions/seller/{sellerId}`
- ✅ Create order: `POST /transactions/orders/`
- ✅ Wishlist add/remove
- ✅ Reviews (có thể có)

**Mobile Version:**
- ⚠️ Có ListingDetailScreen cơ bản
- ❌ Thiếu seller orders
- ❌ Thiếu create order
- ❌ Thiếu wishlist integration

---

## BƯỚC 2: KẾ HOẠCH THỰC THI

### PHASE 1: PROFILE MANAGEMENT

#### 1.1. Tạo/Update Services

**File mới: `lib/features/profile/data/profile_repository.dart`**
```dart
class ProfileRepository {
  Future<User> fetchProfile() async {
    // GET /auth/me
  }
  
  Future<User> updateProfile({
    required String userId,
    String? email,
    String? phonenumber,
    String? firstName,
    String? lastName,
  }) async {
    // PUT /auth/users/{userId}
  }
  
  Future<void> changePassword({
    required String userId,
    required String oldPassword,
    required String newPassword,
  }) async {
    // POST /auth/users/{userId}/change-password
  }
}
```

**File mới: `lib/features/profile/controllers/profile_controller.dart`**
```dart
class ProfileController extends StateNotifier<ProfileState> {
  // State management cho profile
  // Loading states, error handling
}
```

#### 1.2. Update Models

**Update: `lib/features/auth/models/user.dart`**
```dart
class User {
  final String id;
  final String username;
  final String email;
  final String? phonenumber;
  final String? firstName;
  final String? lastName;
  final String role;
  final bool isActive;
  // ... existing fields
}
```

#### 1.3. UI Implementation

**Update: `lib/features/profile/presentation/profile_screen.dart`**
- Thêm button "Chỉnh sửa"
- Tạo `EditProfileDialog` hoặc `EditProfileScreen`
- 2 tabs: Profile Info và Change Password
- Form validation
- Error handling

**Files cần tạo:**
- `lib/features/profile/presentation/widgets/edit_profile_dialog.dart`
- `lib/features/profile/presentation/widgets/change_password_dialog.dart`

---

### PHASE 2: IMAGE UPLOAD & AI PRICE SUGGESTION

#### 2.1. Dependencies

**Update: `pubspec.yaml`**
```yaml
dependencies:
  image_picker: ^1.0.0
  http: ^1.1.0  # For Cloudinary upload
```

#### 2.2. Services

**File mới: `lib/core/services/image_upload_service.dart`**
```dart
class ImageUploadService {
  static const String cloudName = 'dgoze8lyy';
  static const String uploadPreset = 'EVB_listing';
  
  Future<String> uploadToCloudinary(File imageFile) async {
    // Upload to Cloudinary
    // Return secure_url
  }
  
  Future<List<String>> uploadMultiple(List<File> files) async {
    // Upload multiple images in parallel
  }
}
```

**File mới: `lib/features/listings/data/listing_price_service.dart`**
```dart
class ListingPriceService {
  Future<double> suggestPrice({
    required String title,
    required String description,
    required String category,
    String? location,
    String? condition,
    // Vehicle/Battery specific fields
  }) async {
    // POST /listings/suggest-price
    // Return suggestedPrice
  }
}
```

#### 2.3. Update CreateListingScreen

**Update: `lib/features/listings/presentation/create_listing_screen.dart`**
- Thêm image picker button
- Thêm image preview grid
- Thêm remove image functionality
- Thêm "Gợi ý giá" button
- Integrate ImageUploadService
- Integrate ListingPriceService
- Update submit để upload ảnh trước

**Files cần tạo:**
- `lib/features/listings/presentation/widgets/image_picker_grid.dart`
- `lib/features/listings/presentation/widgets/price_suggestion_button.dart`

---

### PHASE 3: EDIT LISTING

#### 3.1. Update Repository

**Update: `lib/features/listings/data/listing_repository.dart`**
```dart
Future<Listing> fetchListingById(String id) async {
  // Already exists, verify it works
}

Future<void> updateListing(String id, Map<String, dynamic> payload) async {
  // PUT /listings/{id}
}
```

#### 3.2. Create Edit Screen

**File mới: `lib/features/listings/presentation/edit_listing_screen.dart`**
- Similar to CreateListingScreen
- Load existing data
- Separate existing images and new images
- Merge on submit
- Use same image upload service

#### 3.3. Update Router

**Update: `lib/router/app_router.dart`**
```dart
GoRoute(
  path: '/listings/:id/edit',
  builder: (context, state) => EditListingScreen(
    listingId: state.pathParameters['id']!,
  ),
),
```

---

### PHASE 4: TRANSACTION & PAYMENT

#### 4.1. Models

**File mới: `lib/features/transactions/models/transaction.dart`**
```dart
class Transaction {
  final String id;
  final String listingId;
  final String name;
  final double price;
  final String status; // pending, paid
  final DateTime createdAt;
  final TransactionDetails? details;
}

class TransactionDetails {
  final Order? order;
  final Listing? listing;
}

class Order {
  final String id;
  final String listingId;
  final double price;
  final String status;
  final String type;
  final DateTime createdAt;
}
```

#### 4.2. Repository

**File mới: `lib/features/transactions/data/transaction_repository.dart`**
```dart
class TransactionRepository {
  Future<List<Transaction>> fetchHistory() async {
    // GET /transactions/orders/history
  }
  
  Future<void> payOrder(String orderId) async {
    // POST /transactions/orders/{orderId}/payment/
  }
  
  Future<Uint8List> downloadContract(String orderId) async {
    // GET /transactions/orders/{orderId}/contract/
    // Return PDF bytes
  }
}
```

#### 4.3. UI

**Update: `lib/features/cart/presentation/cart_screen.dart`**
- Replace placeholder với full implementation
- List transactions
- Payment buttons
- Download contract
- Transaction detail modal
- Summary card (pending total, paid total)

**Files cần tạo:**
- `lib/features/transactions/presentation/transaction_detail_modal.dart`
- `lib/features/transactions/presentation/widgets/transaction_card.dart`
- `lib/features/transactions/presentation/widgets/payment_summary_card.dart`

---

### PHASE 5: NOTIFICATIONS

#### 5.1. Repository

**File mới: `lib/features/notifications/data/notification_repository.dart`**
```dart
class NotificationRepository {
  Future<List<Notification>> fetchNotifications({
    int? limit,
    bool? unreadOnly,
  }) async {
    // GET /chat/notifications
  }
  
  Future<void> markAsRead(String notificationId) async {
    // PUT /chat/notifications/{id}/read
  }
}
```

#### 5.2. Model

**File mới: `lib/features/notifications/models/notification.dart`**
```dart
class Notification {
  final String id;
  final String title;
  final String message;
  final bool isRead;
  final DateTime createdAt;
  final String? type;
  final Map<String, dynamic>? data;
}
```

#### 5.3. UI

**File mới: `lib/features/notifications/presentation/notifications_screen.dart`**
- List notifications
- Unread badge
- Mark as read
- Pull to refresh

**Update: HomeScreen hoặc AppBar**
- Thêm notification icon với badge
- Navigate to notifications screen

---

### PHASE 6: WISHLIST INTEGRATION

#### 6.1. Repository

**File mới: `lib/features/wishlist/data/wishlist_repository.dart`**
```dart
class WishlistRepository {
  Future<List<String>> fetchWishlistIds() async {
    // GET /wishlist/my
  }
  
  Future<void> addToWishlist(String listingId) async {
    // POST /wishlist/{listingId}
  }
  
  Future<void> removeFromWishlist(String listingId) async {
    // DELETE /wishlist/{listingId}
  }
}
```

#### 6.2. Update Screens

**Update: `lib/features/wishlist/presentation/wishlist_screen.dart`**
- Fetch wishlist IDs
- Fetch listing details
- Display listings
- Remove functionality

**Update: `lib/features/listings/presentation/listing_detail_screen.dart`**
- Add wishlist button
- Toggle wishlist on tap

---

### PHASE 7: PRODUCT DETAIL ENHANCEMENTS

#### 7.1. Create Order

**Update: `lib/features/listings/data/listing_repository.dart`**
```dart
Future<void> createOrder({
  required String listingId,
  required String type, // 'xe' or 'pin'
}) async {
  // POST /transactions/orders/
}
```

#### 7.2. Seller Orders

**File mới: `lib/features/transactions/data/seller_repository.dart`**
```dart
class SellerRepository {
  Future<List<Order>> fetchSellerOrders(String sellerId) async {
    // GET /transactions/seller/{sellerId}
  }
}
```

**Update: `lib/features/listings/presentation/listing_detail_screen.dart`**
- Add "Mua ngay" button
- Show seller orders count
- Create order on tap

---

## TỔNG KẾT FILES CẦN TẠO/CẬP NHẬT

### Files mới cần tạo (25 files):

#### Profile (3 files):
1. `lib/features/profile/data/profile_repository.dart`
2. `lib/features/profile/controllers/profile_controller.dart`
3. `lib/features/profile/presentation/widgets/edit_profile_dialog.dart`

#### Image Upload & Price Suggestion (3 files):
4. `lib/core/services/image_upload_service.dart`
5. `lib/features/listings/data/listing_price_service.dart`
6. `lib/features/listings/presentation/widgets/image_picker_grid.dart`

#### Edit Listing (1 file):
7. `lib/features/listings/presentation/edit_listing_screen.dart`

#### Transactions (4 files):
8. `lib/features/transactions/models/transaction.dart`
9. `lib/features/transactions/models/order.dart`
10. `lib/features/transactions/data/transaction_repository.dart`
11. `lib/features/transactions/presentation/transaction_detail_modal.dart`

#### Notifications (3 files):
12. `lib/features/notifications/models/notification.dart`
13. `lib/features/notifications/data/notification_repository.dart`
14. `lib/features/notifications/presentation/notifications_screen.dart`

#### Wishlist (1 file):
15. `lib/features/wishlist/data/wishlist_repository.dart`

#### Seller (1 file):
16. `lib/features/transactions/data/seller_repository.dart`

### Files cần cập nhật (10 files):

1. `lib/features/profile/presentation/profile_screen.dart`
2. `lib/features/auth/models/user.dart`
3. `lib/features/listings/presentation/create_listing_screen.dart`
4. `lib/features/listings/data/listing_repository.dart`
5. `lib/features/cart/presentation/cart_screen.dart`
6. `lib/features/wishlist/presentation/wishlist_screen.dart`
7. `lib/features/listings/presentation/listing_detail_screen.dart`
8. `lib/router/app_router.dart`
9. `pubspec.yaml` (dependencies)
10. `lib/features/listings/presentation/products_screen.dart` (pagination)

---

## THỨ TỰ ƯU TIÊN THỰC HIỆN

### Priority 1 (Critical):
1. Profile Management (Update & Change Password)
2. Image Upload trong Create Listing
3. AI Price Suggestion
4. Edit Listing

### Priority 2 (Important):
5. Transaction History & Payment
6. Wishlist Integration
7. Product Detail Enhancements (Create Order)

### Priority 3 (Nice to have):
8. Notifications Screen
9. Pagination trong Search
10. Sort options trong Search

---

## LƯU Ý KỸ THUẬT

### Dependencies cần thêm:
```yaml
dependencies:
  image_picker: ^1.0.0
  http: ^1.1.0
  file_picker: ^6.0.0  # Alternative to image_picker
  path_provider: ^2.1.0  # For file paths
  open_filex: ^4.3.0  # For opening PDFs
```

### API Endpoints cần verify:
- `/auth/me` - Get current user
- `/auth/users/{id}` - Update user (PUT)
- `/auth/users/{id}/change-password` - Change password (POST)
- `/listings/suggest-price` - AI price suggestion (POST)
- `/transactions/orders/history` - Transaction history (GET)
- `/transactions/orders/{id}/payment/` - Payment (POST)
- `/transactions/orders/{id}/contract/` - Download contract (GET)
- `/transactions/seller/{id}` - Seller orders (GET)
- `/wishlist/my` - Get wishlist (GET)
- `/wishlist/{id}` - Add/Remove wishlist (POST/DELETE)
- `/chat/notifications` - Get notifications (GET)

### Cloudinary Configuration:
- Cloud Name: `dgoze8lyy`
- Upload Preset: `EVB_listing`
- API: `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`

---

## KẾT LUẬN

Tổng cộng cần:
- **25 files mới** cần tạo
- **10 files** cần cập nhật
- **3 dependencies** mới cần thêm
- **10+ API endpoints** cần integrate

Ước tính thời gian: **2-3 tuần** cho toàn bộ tính năng (tùy vào độ phức tạp và testing).





