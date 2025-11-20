# Firebase Setup cho Mobile App

## Cài đặt Dependencies

Sau khi thêm các dependencies vào `pubspec.yaml`, chạy:

```bash
flutter pub get
```

## Cấu hình Firebase

### 1. Android Setup

1. Tải file `google-services.json` từ Firebase Console
2. Đặt file vào `android/app/google-services.json`
3. File này đã có sẵn trong project

### 2. iOS Setup (nếu cần)

1. Tải file `GoogleService-Info.plist` từ Firebase Console
2. Đặt file vào `ios/Runner/GoogleService-Info.plist`

### 3. Environment Variables (Optional)

Nếu muốn cấu hình qua environment variables, sử dụng `--dart-define`:

```bash
flutter run --dart-define=FIREBASE_API_KEY=your_api_key \
           --dart-define=FIREBASE_APP_ID=your_app_id \
           --dart-define=FIREBASE_MESSAGING_SENDER_ID=your_sender_id \
           --dart-define=FIREBASE_PROJECT_ID=your_project_id \
           --dart-define=FIREBASE_DATABASE_URL=your_database_url
```

**Lưu ý:** Nếu không cung cấp environment variables, Firebase sẽ tự động đọc từ `google-services.json` (Android) hoặc `GoogleService-Info.plist` (iOS).

## Firebase Realtime Database Rules

Đảm bảo Firebase Realtime Database có rules phù hợp:

```json
{
  "rules": {
    "chatRooms": {
      "$roomId": {
        ".read": "auth != null && (data.child('participants').child(auth.uid).exists() || root.child('chatRooms').child($roomId).child('participants').child(auth.uid).exists())",
        ".write": "auth != null && (data.child('participants').child(auth.uid).exists() || root.child('chatRooms').child($roomId).child('participants').child(auth.uid).exists())",
        "messages": {
          ".read": "auth != null && (data.parent().child('participants').child(auth.uid).exists() || root.child('chatRooms').child($roomId).child('participants').child(auth.uid).exists())",
          ".write": "auth != null && (data.parent().child('participants').child(auth.uid).exists() || root.child('chatRooms').child($roomId).child('participants').child(auth.uid).exists())"
        }
      }
    }
  }
}
```

## Fallback Behavior

Nếu Firebase không được cấu hình hoặc không khả dụng, app sẽ tự động fallback về REST API cho chat. Điều này đảm bảo app vẫn hoạt động bình thường.

## Testing

1. Đảm bảo Firebase đã được khởi tạo thành công (check logs)
2. Test chat realtime giữa 2 users
3. Verify messages được sync realtime











