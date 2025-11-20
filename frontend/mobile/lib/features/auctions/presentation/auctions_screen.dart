import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/widgets/app_loading_indicator.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_view.dart';
import '../../listings/presentation/home_screen.dart';
import '../controllers/auction_providers.dart';
import '../models/auction.dart';

class AuctionsScreen extends ConsumerWidget {
  const AuctionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auctions = ref.watch(auctionsProvider);
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const HomeScreen()),
          ),
        ),
        title: const Text('Đấu giá trực tuyến'),
      ),
      body: auctions.when(
        data: (data) {
          if (data.isEmpty) {
            return const EmptyState(
              title: 'Chưa có phiên đấu giá',
              message: 'Hãy quay lại sau hoặc tạo phiên đấu giá mới.',
              icon: Icons.gavel_outlined,
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(20),
            itemCount: data.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final auction = data[index];
              return _AuctionCard(
                auction: auction,
                onTap: () => context.go('/auctions/${auction.id}'),
              );
            },
          );
        },
        error: (error, _) => ErrorView(
          message: error.toString(),
          onRetry: () => ref.invalidate(auctionsProvider),
        ),
        loading: () => const AppLoadingIndicator(),
      ),
    );
  }
}

class _AuctionCard extends StatelessWidget {
  const _AuctionCard({
    required this.auction,
    this.onTap,
  });

  final Auction auction;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: Colors.blueGrey.shade50,
          child: const Icon(Icons.gavel_outlined),
        ),
        title: Text(auction.title),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text('Giá hiện tại: ${auction.formatCurrency(auction.currentBid)}'),
            Text('Kết thúc trong: ${auction.countdown}'),
          ],
        ),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }
}

