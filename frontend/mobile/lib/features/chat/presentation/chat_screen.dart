import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/widgets/app_loading_indicator.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_view.dart';
import '../controllers/chat_providers.dart';
import '../models/chat_message.dart';
import '../models/chat_room.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  String? _selectedRoomId;
  final _messageController = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final roomId = _selectedRoomId;
    if (roomId == null) return;
    final text = _messageController.text.trim();
    if (text.isEmpty) return;
    setState(() => _sending = true);
    try {
      await ref.read(chatRepositoryProvider).sendMessage(roomId, text);
      _messageController.clear();
      ref.invalidate(chatMessagesProvider(roomId));
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) {
        setState(() => _sending = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final roomsAsync = ref.watch(chatRoomsProvider);
    final roomsView = roomsAsync.when(
      data: (data) => _RoomsColumn(
        rooms: data,
        selectedRoomId: _selectedRoomId,
        onSelect: (room) {
          setState(() => _selectedRoomId = room.id);
          ref.invalidate(chatMessagesProvider(room.id));
        },
      ),
      error: (error, _) => ErrorView(
        message: error.toString(),
        onRetry: () => ref.invalidate(chatRoomsProvider),
      ),
      loading: () => const AppLoadingIndicator(),
    );

    final detailView = _selectedRoomId == null
        ? const EmptyState(
            title: 'Chọn một cuộc trò chuyện',
            message:
                'Danh sách phòng sẽ hiển thị ở cột bên, hãy chọn để bắt đầu.',
            icon: Icons.chat_bubble_outline,
          )
        : Column(
            children: [
              Expanded(
                child: Consumer(
                  builder: (context, ref, _) {
                    final messages =
                        ref.watch(chatMessagesProvider(_selectedRoomId!));
                    return messages.when(
                      data: (data) => _MessagesList(messages: data),
                      error: (error, _) => ErrorView(
                        message: error.toString(),
                        onRetry: () => ref.invalidate(
                          chatMessagesProvider(_selectedRoomId!),
                        ),
                      ),
                      loading: () =>
                          const Center(child: CircularProgressIndicator()),
                    );
                  },
                ),
              ),
              SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _messageController,
                          decoration: const InputDecoration(
                            hintText: 'Nhập tin nhắn...',
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        onPressed: _sending ? null : _sendMessage,
                        icon: _sending
                            ? const CircularProgressIndicator()
                            : const Icon(Icons.send),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nhắn tin'),
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isWide = constraints.maxWidth > 700;
          if (isWide) {
            return Row(
              children: [
                Expanded(flex: 2, child: roomsView),
                Expanded(flex: 3, child: detailView),
              ],
            );
          }
          return Column(
            children: [
              SizedBox(height: 250, child: roomsView),
              const Divider(height: 1),
              Expanded(child: detailView),
            ],
          );
        },
      ),
    );
  }
}

class _RoomsColumn extends StatelessWidget {
  const _RoomsColumn({
    required this.rooms,
    required this.selectedRoomId,
    required this.onSelect,
  });

  final List<ChatRoom> rooms;
  final String? selectedRoomId;
  final ValueChanged<ChatRoom> onSelect;

  @override
  Widget build(BuildContext context) {
    if (rooms.isEmpty) {
      return const EmptyState(
        title: 'Chưa có hội thoại',
        message: 'Tin nhắn với đối tác sẽ hiển thị tại đây.',
        icon: Icons.chat_outlined,
      );
    }
    return ListView.separated(
      itemCount: rooms.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final room = rooms[index];
        final selected = room.id == selectedRoomId;
        return ListTile(
          selected: selected,
          onTap: () => onSelect(room),
          title: Text(room.partnerName),
          subtitle: Text(room.lastMessage?.text ?? 'Bắt đầu cuộc trò chuyện'),
        );
      },
    );
  }
}

class _MessagesList extends StatelessWidget {
  const _MessagesList({required this.messages});

  final List<ChatMessage> messages;

  @override
  Widget build(BuildContext context) {
    if (messages.isEmpty) {
      return const EmptyState(
        title: 'Hãy nhắn điều gì đó',
        message: 'Cuộc trò chuyện mới sẽ hiện ở đây.',
        icon: Icons.chat,
      );
    }
    return ListView.builder(
      reverse: true,
      itemCount: messages.length,
      itemBuilder: (context, index) {
        final message = messages[messages.length - index - 1];
        final alignment =
            message.isMine ? Alignment.centerRight : Alignment.centerLeft;
        final color = message.isMine
            ? Theme.of(context).colorScheme.primaryContainer
            : Theme.of(context).colorScheme.surfaceVariant;
        return Align(
          alignment: alignment,
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(message.text),
                const SizedBox(height: 4),
                Text(
                  message.formattedTime,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.blueGrey,
                      ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

