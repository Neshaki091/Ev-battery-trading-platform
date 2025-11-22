import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../../auth/controllers/auth_controller.dart';
import '../data/chat_repository.dart';
import '../data/firebase_chat_service.dart';
import '../models/chat_message.dart';
import '../models/chat_room.dart';

final chatRepositoryProvider = Provider<ChatRepository>(
  (ref) => ChatRepository(ref.watch(apiClientProvider)),
);

final firebaseChatServiceProvider = Provider<FirebaseChatService>(
  (ref) => FirebaseChatService(),
);

// Stream provider cho rooms từ Firebase
final chatRoomsStreamProvider = StreamProvider<List<ChatRoom>>((ref) {
  final authState = ref.watch(authControllerProvider);
  final currentUserId = authState.user?.id ?? '';
  
  if (currentUserId.isEmpty) {
    return Stream.value([]);
  }
  
  final service = ref.watch(firebaseChatServiceProvider);
  return service.watchRooms(currentUserId);
});

// Fallback: Future provider cho rooms từ API
final chatRoomsProvider = FutureProvider<List<ChatRoom>>(
  (ref) => ref.watch(chatRepositoryProvider).fetchRooms(),
);

// Stream provider cho messages từ Firebase
final chatMessagesStreamProvider =
    StreamProvider.family<List<ChatMessage>, String>((ref, roomId) {
  final authState = ref.watch(authControllerProvider);
  final currentUserId = authState.user?.id ?? '';
  
  if (currentUserId.isEmpty) {
    return Stream.value([]);
  }
  
  final service = ref.watch(firebaseChatServiceProvider);
  return service.watchMessages(roomId, currentUserId);
});

// Fallback: Future provider cho messages từ API
final chatMessagesProvider =
    FutureProvider.family<List<ChatMessage>, String>((ref, roomId) {
  return ref.watch(chatRepositoryProvider).fetchMessages(roomId);
});

