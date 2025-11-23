import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
<<<<<<< HEAD
=======
import 'package:go_router/go_router.dart';
>>>>>>> temp

import '../../../core/widgets/app_loading_indicator.dart';
import '../../../core/widgets/error_view.dart';
import '../controllers/auction_providers.dart';
<<<<<<< HEAD
import 'auctions_screen.dart';
=======
>>>>>>> temp

class AuctionDetailScreen extends ConsumerStatefulWidget {
  const AuctionDetailScreen({
    super.key,
    required this.auctionId,
  });

  final String auctionId;

  @override
  ConsumerState<AuctionDetailScreen> createState() =>
      _AuctionDetailScreenState();
}

class _AuctionDetailScreenState
    extends ConsumerState<AuctionDetailScreen> {
  final _bidController = TextEditingController();
  bool _placingBid = false;

  @override
  void dispose() {
    _bidController.dispose();
    super.dispose();
  }

  Future<void> _placeBid() async {
    final amount = double.tryParse(_bidController.text);
    if (amount == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập số tiền hợp lệ')),
      );
      return;
    }
    setState(() => _placingBid = true);
    try {
      await ref.read(auctionRepositoryProvider).placeBid(
            widget.auctionId,
            amount,
          );
      ref.invalidate(auctionDetailProvider(widget.auctionId));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đặt giá thành công')),
      );
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) setState(() => _placingBid = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auctionAsync = ref.watch(auctionDetailProvider(widget.auctionId));
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
<<<<<<< HEAD
          onPressed: () => Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const AuctionsScreen()),
          ),
=======
          onPressed: () => context.pop(),
>>>>>>> temp
        ),
        title: const Text('Chi tiết đấu giá'),
      ),
      body: auctionAsync.when(
        data: (auction) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              auction.title,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Chip(
                  avatar: const Icon(Icons.timer_outlined, size: 16),
                  label: Text('Còn ${auction.countdown}'),
                ),
                const SizedBox(width: 12),
                Chip(
                  avatar: const Icon(Icons.analytics_outlined, size: 16),
                  label: Text(auction.status),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Card(
              child: ListTile(
                title: const Text('Giá hiện tại'),
                subtitle: Text(
                  auction.formatCurrency(auction.currentBid),
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                trailing: FilledButton(
                  onPressed:
                      auction.isClosed || _placingBid ? null : _placeBid,
                  child: _placingBid
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Đặt giá'),
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _bidController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Số tiền muốn đặt',
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: auction.buyNowPrice == null
                  ? null
                  : () async {
                      await ref
                          .read(auctionRepositoryProvider)
                          .buyNow(widget.auctionId);
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Đã mua ngay')),
                      );
                    },
              icon: const Icon(Icons.flash_on),
              label: Text(
                auction.buyNowPrice == null
                    ? 'Không hỗ trợ mua ngay'
                    : 'Mua ngay ${auction.formatCurrency(auction.buyNowPrice)}',
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Mô tả chi tiết',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              auction.description.isEmpty
                  ? 'Người bán chưa cập nhật mô tả chi tiết.'
                  : auction.description,
            ),
          ],
        ),
        error: (error, _) => ErrorView(
          message: error.toString(),
          onRetry: () => ref.invalidate(
            auctionDetailProvider(widget.auctionId),
          ),
        ),
        loading: () => const AppLoadingIndicator(),
      ),
    );
  }
}

