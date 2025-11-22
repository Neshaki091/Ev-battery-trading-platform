import 'chat_message.dart';

class ChatRoom {
  ChatRoom({
    required this.id,
    required this.partnerName,
    required this.partnerId,
    required this.lastMessage,
    this.lastMessageText,
    this.lastMessageTimestamp,
  });

  factory ChatRoom.fromJson(Map<String, dynamic> json) => ChatRoom(
        id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
        partnerName: json['partnerName']?.toString() ??
            json['receiverName']?.toString() ??
            'Đối tác',
        partnerId: json['partnerId']?.toString() ?? '',
        lastMessage: json['lastMessage'] == null
            ? null
            : ChatMessage.fromJson(
                Map<String, dynamic>.from(json['lastMessage']),
              ),
        lastMessageText: json['lastMessageText']?.toString(),
        lastMessageTimestamp: json['lastMessageTimestamp'],
      );

  factory ChatRoom.fromFirebase(
    String id,
    Map<String, dynamic> data,
    String currentUserId,
  ) {
    final participants = data['participants'];
    String partnerId = '';
    
    if (participants is Map) {
      final participantIds = participants.keys.toList();
      partnerId = participantIds.firstWhere(
        (id) => id != currentUserId,
        orElse: () => '',
      );
    }

    ChatMessage? lastMessage;
    final lastMessageText = data['lastMessageText']?.toString();
    final lastMessageTimestamp = data['lastMessageTimestamp'];
    
    if (lastMessageText != null && lastMessageTimestamp != null) {
      DateTime createdAt;
      if (lastMessageTimestamp is int) {
        createdAt = DateTime.fromMillisecondsSinceEpoch(lastMessageTimestamp);
      } else if (lastMessageTimestamp is String) {
        createdAt = DateTime.tryParse(lastMessageTimestamp) ?? DateTime.now();
      } else {
        createdAt = DateTime.now();
      }

      lastMessage = ChatMessage(
        id: '',
        senderId: data['lastMessageSenderId']?.toString() ?? '',
        text: lastMessageText,
        createdAt: createdAt,
        isMine: data['lastMessageSenderId']?.toString() == currentUserId,
      );
    }

    return ChatRoom(
      id: id,
      partnerName: 'Đối tác', // Will be loaded separately
      partnerId: partnerId,
      lastMessage: lastMessage,
      lastMessageText: lastMessageText,
      lastMessageTimestamp: lastMessageTimestamp,
    );
  }

  final String id;
  final String partnerName;
  final String partnerId;
  final ChatMessage? lastMessage;
  final String? lastMessageText;
  final dynamic lastMessageTimestamp;
}

