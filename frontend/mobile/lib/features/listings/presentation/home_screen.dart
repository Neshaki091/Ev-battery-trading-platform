import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../core/widgets/app_loading_indicator.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_view.dart';
import '../controllers/listing_providers.dart';
import '../models/listing.dart';
import 'widgets/listing_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  static const _heroStats = [
    ('1.200+', 'Tin đăng đang hoạt động'),
    ('98%', 'Người dùng hài lòng'),
    ('24/7', 'Hỗ trợ chuyên sâu'),
  ];

  static const _categories = [
    (
      '🚗',
      'Xe điện hoàn chỉnh',
      'Ô tô, xe máy và xe đạp điện được kiểm duyệt kỹ lưỡng.',
      'Vehicle',
    ),
    (
      '🔋',
      'Pin & module',
      'Pin LFP, module đổi pin và pack lắp ráp riêng.',
      'Battery',
    ),
    (
      '⚙️',
      'Phụ tùng & trạm sạc',
      'Trạm sạc AC/DC, bộ chuyển đổi và phụ tùng chính hãng.',
      'Accessory',
    ),
    (
      '🌱',
      'Giải pháp năng lượng',
      'Microgrid, lưu trữ và dịch vụ hậu mãi.',
      'Solution',
    ),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featured = ref.watch(featuredListingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('EVB Market'),
        actions: [
          IconButton(
            onPressed: () => context.go('/chat'),
            icon: const Icon(Icons.chat_bubble_outline),
          ),
          IconButton(
            onPressed: () => context.go('/profile'),
            icon: const Icon(Icons.person_outline),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.refresh(featuredListingsProvider);
          await featured.whenOrNull(data: (_) async {});
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHero(context),
              const SizedBox(height: 24),
              _buildStats(context),
              const SizedBox(height: 24),
              _buildCategories(context),
              const SizedBox(height: 24),
              featured.when(
                data: (data) => _buildFeatured(context, data),
                error:
                    (error, _) => ErrorView(
                      message: error.toString(),
                      onRetry: () {
                        ref.invalidate(featuredListingsProvider);
                      },
                    ),
                loading:
                    () => const Padding(
                      padding: EdgeInsets.all(32),
                      child: AppLoadingIndicator(),
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHero(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              theme.colorScheme.primaryContainer.withOpacity(0.3),
              theme.colorScheme.surface,
            ],
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Chip(
                avatar: Icon(
                  Icons.electric_bolt,
                  size: 16,
                  color: theme.colorScheme.primary,
                ),
                label: Text(
                  'EV Battery Marketplace',
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Khởi động giao dịch năng lượng xanh của bạn',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Kết nối người mua - người bán xe điện, pin và phụ tùng với dữ liệu minh bạch, đầy đủ.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant.withOpacity(0.8),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () => GoRouter.of(context).go('/create'),
                      icon: const Icon(Icons.add),
                      label: const Text('Đăng tin ngay'),
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed:
                          () =>
                              GoRouter.of(context).go('/products?q=&hero=true'),
                      icon: const Icon(Icons.explore),
                      label: const Text('Khám phá'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.1, duration: 400.ms);
  }

  Widget _buildStats(BuildContext context) {
    return Row(
      children:
          _heroStats
              .map(
                (item) => Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Text(
                            item.$1,
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                          const SizedBox(height: 8),
                          Text(item.$2, textAlign: TextAlign.center),
                        ],
                      ),
                    ),
                  ),
                ),
              )
              .toList(),
    );
  }

  Widget _buildCategories(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Khám phá theo nhu cầu',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            TextButton(
              onPressed: () => GoRouter.of(context).go('/products'),
              child: const Text('Xem tất cả'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 160,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final item = _categories[index];
              return SizedBox(
                width: 220,
                child: Card(
                  child: InkWell(
                    borderRadius: BorderRadius.circular(20),
                    onTap:
                        () => GoRouter.of(
                          context,
                        ).go('/products?category=${item.$4}'),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.$1, style: const TextStyle(fontSize: 28)),
                          const SizedBox(height: 12),
                          Text(
                            item.$2,
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            item.$3,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          const Spacer(),
                          const Text(
                            'Khám phá →',
                            style: TextStyle(fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFeatured(BuildContext context, List<Listing> listings) {
    if (listings.isEmpty) {
      return const EmptyState(
        title: 'Chưa có tin đăng',
        message: 'Hãy quay lại sau, chúng tôi đang cập nhật dữ liệu.',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Tin đăng nổi bật',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            Text(
              '${listings.length} tin phù hợp',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            mainAxisExtent: 320,
          ),
          itemCount: listings.length,
          itemBuilder: (context, index) {
            final listing = listings[index];
            return ListingCard(
              listing: listing,
              index: index,
              onTap: () => GoRouter.of(context).go('/products/${listing.id}'),
            );
          },
        ),
      ],
    );
  }
}
