import '../../../core/network/api_client.dart';
import '../models/chat_message.dart';
import '../models/chat_room.dart';

class ChatRepository {
  ChatRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<ChatRoom>> fetchRooms() async {
    final response = await _apiClient.get<dynamic>(
      '/chat/rooms',
      requiresAuth: true,
    );
    final data = response.data;
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(ChatRoom.fromJson)
          .toList();
    }
    if (data is Map<String, dynamic> && data['rooms'] is List) {
      return (data['rooms'] as List)
          .whereType<Map<String, dynamic>>()
          .map(ChatRoom.fromJson)
          .toList();
    }
    return const [];
  }

  Future<List<ChatMessage>> fetchMessages(String roomId) async {
    final response = await _apiClient.get<dynamic>(
      '/chat/rooms/$roomId/messages',
      requiresAuth: true,
    );

    final data = response.data;
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(ChatMessage.fromJson)
          .toList();
    }
    if (data is Map<String, dynamic> && data['messages'] is List) {
      return (data['messages'] as List)
          .whereType<Map<String, dynamic>>()
          .map(ChatMessage.fromJson)
          .toList();
    }
    return const [];
  }

  Future<void> sendMessage(String roomId, String text) async {
    await _apiClient.post<Map<String, dynamic>>(
      '/chat/rooms/$roomId/messages',
      data: {'text': text},
      requiresAuth: true,
    );
  }
}

