import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/widgets/app_loading_indicator.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_view.dart';
import '../controllers/listing_providers.dart';
<<<<<<< HEAD
import 'home_screen.dart';
=======
>>>>>>> temp
import 'widgets/listing_card.dart';

class MyListingsScreen extends ConsumerWidget {
  const MyListingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listings = ref.watch(myListingsProvider);
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
<<<<<<< HEAD
          onPressed: () => Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const HomeScreen()),
          ),
=======
          onPressed: () => context.pop(),
>>>>>>> temp
        ),
        title: const Text('Tin đăng của tôi'),
      ),
      body: listings.when(
        data: (data) {
          if (data.isEmpty) {
            return const EmptyState(
              title: 'Chưa có tin nào',
              message: 'Hãy đăng sản phẩm đầu tiên của bạn ngay bây giờ.',
              icon: Icons.inventory_outlined,
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(20),
            itemCount: data.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final listing = data[index];
              return ListingCard(
                listing: listing,
                onTap: () => GoRouter.of(context).go('/products/${listing.id}'),
              );
            },
          );
        },
        error: (error, _) => ErrorView(
          message: error.toString(),
          onRetry: () => ref.invalidate(myListingsProvider),
        ),
        loading: () => const AppLoadingIndicator(),
      ),
    );
  }
}

