import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/controllers/auth_controller.dart';
import '../../listings/presentation/home_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(authControllerProvider);
    final user = state.user;

    if (user == null) {
      return Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const HomeScreen()),
            ),
          ),
          title: const Text('Thông tin cá nhân'),
        ),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Bạn cần đăng nhập để xem thông tin hồ sơ.'),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () => context.go('/login'),
                child: const Text('Đăng nhập'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const HomeScreen()),
          ),
        ),
        title: const Text('Thông tin cá nhân'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: CircleAvatar(
              radius: 30,
              child: Text(user.username.characters.first.toUpperCase()),
            ),
            title: Text(user.username),
            subtitle: Text(user.email),
            trailing: Chip(
              label: Text(user.role),
            ),
          ),
          const SizedBox(height: 24),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.favorite_outline),
                  title: const Text('Tin đã yêu thích'),
                  onTap: () => context.go('/wishlist'),
                ),
                const Divider(height: 0),
                ListTile(
                  leading: const Icon(Icons.sell_outlined),
                  title: const Text('Tin đăng của tôi'),
                  onTap: () => context.go('/my-listings'),
                ),
                const Divider(height: 0),
                ListTile(
                  leading: const Icon(Icons.chat_bubble_outline),
                  title: const Text('Hộp thư'),
                  onTap: () => context.go('/chat'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: () async {
              await ref.read(authControllerProvider.notifier).logout();
              if (context.mounted) {
                context.go('/');
              }
            },
            icon: const Icon(Icons.logout),
            label: const Text('Đăng xuất'),
          ),
        ],
      ),
    );
  }
}

