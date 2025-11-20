import 'package:intl/intl.dart';

class ChatMessage {
  ChatMessage({
    required this.id,
    required this.senderId,
    required this.text,
    required this.createdAt,
    required this.isMine,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
        id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
        senderId: json['senderId']?.toString() ?? '',
        text: json['text']?.toString() ?? '',
        createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
            DateTime.now(),
        isMine: json['isMine'] == true,
      );

  factory ChatMessage.fromFirebase(
    String id,
    Map<String, dynamic> data,
    String currentUserId,
  ) {
    final timestamp = data['timestamp'];
    DateTime createdAt;
    
    if (timestamp is int) {
      createdAt = DateTime.fromMillisecondsSinceEpoch(timestamp);
    } else if (timestamp is String) {
      createdAt = DateTime.tryParse(timestamp) ?? DateTime.now();
    } else {
      createdAt = DateTime.now();
    }

    return ChatMessage(
      id: id,
      senderId: data['senderId']?.toString() ?? '',
      text: data['text']?.toString() ?? '',
      createdAt: createdAt,
      isMine: data['senderId']?.toString() == currentUserId,
    );
  }

  final String id;
  final String senderId;
  final String text;
  final DateTime createdAt;
  final bool isMine;

  String get formattedTime {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final messageDate = DateTime(createdAt.year, createdAt.month, createdAt.day);
    
    if (messageDate == today) {
      return DateFormat('HH:mm').format(createdAt.toLocal());
    } else if (messageDate == today.subtract(const Duration(days: 1))) {
      return 'Hôm qua ${DateFormat('HH:mm').format(createdAt.toLocal())}';
    } else {
      return DateFormat('dd/MM/yyyy HH:mm').format(createdAt.toLocal());
    }
  }
}

