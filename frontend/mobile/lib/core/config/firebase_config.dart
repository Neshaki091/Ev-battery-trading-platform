import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/foundation.dart';

class FirebaseConfig {
  static DatabaseReference? _database;
  static bool _initialized = false;

  static Future<void> initialize() async {
    if (_initialized || Firebase.apps.isNotEmpty) {
      _database = FirebaseDatabase.instance.ref();
      return;
    }

    try {
      // Firebase config từ environment variables
      // Sử dụng dart-define khi chạy: flutter run --dart-define=FIREBASE_API_KEY=xxx
      final apiKey = const String.fromEnvironment(
        'FIREBASE_API_KEY',
        defaultValue: '',
      );
      final appId = const String.fromEnvironment(
        'FIREBASE_APP_ID',
        defaultValue: '',
      );
      final messagingSenderId = const String.fromEnvironment(
        'FIREBASE_MESSAGING_SENDER_ID',
        defaultValue: '',
      );
      final projectId = const String.fromEnvironment(
        'FIREBASE_PROJECT_ID',
        defaultValue: '',
      );
      final databaseURL = const String.fromEnvironment(
        'FIREBASE_DATABASE_URL',
        defaultValue: '',
      );

      // Nếu không có config từ environment, thử khởi tạo với default options
      // (Firebase sẽ tự động tìm file google-services.json cho Android và GoogleService-Info.plist cho iOS)
      if (apiKey.isEmpty || databaseURL.isEmpty) {
        if (kDebugMode) {
          debugPrint(
            '⚠️ Firebase config not found in environment. Trying default initialization...',
          );
        }
        await Firebase.initializeApp();
      } else {
        await Firebase.initializeApp(
          options: FirebaseOptions(
            apiKey: apiKey,
            appId: appId,
            messagingSenderId: messagingSenderId,
            projectId: projectId,
            databaseURL: databaseURL,
          ),
        );
      }

      _database = FirebaseDatabase.instance.ref();
      _initialized = true;

      if (kDebugMode) {
        debugPrint('✅ Firebase initialized successfully');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Firebase initialization error: $e');
        debugPrint('⚠️ Chat will fallback to REST API');
      }
      // Không throw error, app vẫn có thể chạy với REST API fallback
    }
  }

  static DatabaseReference? get database {
    return _database;
  }

  static bool get isAvailable => _database != null;

  static DatabaseReference chatRoomsRef() {
    if (_database == null) {
      throw Exception(
        'Firebase not initialized. Call FirebaseConfig.initialize() first.',
      );
    }
    return _database!.child('chatRooms');
  }

  static DatabaseReference chatRoomRef(String roomId) {
    return chatRoomsRef().child(roomId);
  }

  static DatabaseReference messagesRef(String roomId) {
    return chatRoomRef(roomId).child('messages');
  }
}
