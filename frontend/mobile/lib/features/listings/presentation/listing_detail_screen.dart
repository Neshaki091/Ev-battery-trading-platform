import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/widgets/app_loading_indicator.dart';
import '../../../core/widgets/error_view.dart';
import '../controllers/listing_providers.dart';
import 'products_screen.dart';

class ListingDetailScreen extends ConsumerWidget {
  const ListingDetailScreen({
    super.key,
    required this.listingId,
  });

  final String listingId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listingAsync = ref.watch(listingDetailProvider(listingId));

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const ProductsScreen()),
          ),
        ),
        title: const Text('Chi tiết tin đăng'),
      ),
      body: listingAsync.when(
        data: (listing) => SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (listing.images.isNotEmpty)
                AspectRatio(
                  aspectRatio: 4 / 3,
                  child: PageView.builder(
                    itemCount: listing.images.length,
                    itemBuilder: (context, index) => CachedNetworkImage(
                      imageUrl: listing.images[index],
                      fit: BoxFit.cover,
                      placeholder: (context, _) => Container(
                        color: Colors.blueGrey.shade50,
                        child: const Center(
                          child: CircularProgressIndicator(),
                        ),
                      ),
                      errorWidget: (_, __, ___) => const Icon(Icons.error),
                    ),
                  ),
                )
              else
                Container(
                  height: 220,
                  color: Colors.blueGrey.shade50,
                  child: const Center(
                    child: Icon(
                      Icons.image_not_supported_outlined,
                      size: 64,
                    ),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Chip(
                          avatar: const Icon(Icons.category_outlined, size: 16),
                          label: Text(listing.category),
                        ),
                        const SizedBox(width: 12),
                        Chip(
                          avatar: const Icon(Icons.calendar_today, size: 16),
                          label: Text(
                            '${listing.createdAt.day}/${listing.createdAt.month}/${listing.createdAt.year}',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      listing.title,
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      listing.displayPrice,
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined),
                        const SizedBox(width: 8),
                        Text(listing.location),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Mô tả chi tiết',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      listing.description.isEmpty
                          ? 'Người bán chưa cập nhật mô tả chi tiết.'
                          : listing.description,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Thông tin người bán',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Card(
                      child: ListTile(
                        leading: const CircleAvatar(
                          child: Icon(Icons.person_outline),
                        ),
                        title: Text(listing.sellerName),
                        subtitle: Text(listing.status),
                        trailing: FilledButton(
                          onPressed: () {},
                          child: const Text('Nhắn tin'),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        error: (error, _) => ErrorView(
          message: error.toString(),
          onRetry: () => ref.invalidate(listingDetailProvider(listingId)),
        ),
        loading: () => const AppLoadingIndicator(),
      ),
      bottomNavigationBar: listingAsync.maybeWhen(
        data: (listing) => Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 12,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.favorite_border),
                  label: const Text('Yêu thích'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton.icon(
                  onPressed: listing.isSold ? null : () {},
                  icon: const Icon(Icons.shopping_cart_checkout),
                  label: const Text('Liên hệ'),
                ),
              ),
            ],
          ),
        ),
        orElse: () => const SizedBox.shrink(),
      ),
    );
  }
}

