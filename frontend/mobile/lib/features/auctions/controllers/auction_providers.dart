import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../data/auction_repository.dart';
import '../models/auction.dart';

final auctionRepositoryProvider = Provider<AuctionRepository>(
  (ref) => AuctionRepository(ref.watch(apiClientProvider)),
);

final auctionsProvider = FutureProvider<List<Auction>>(
  (ref) => ref.watch(auctionRepositoryProvider).fetchAuctions(),
);

final auctionDetailProvider =
    FutureProvider.family<Auction, String>((ref, id) {
  return ref.watch(auctionRepositoryProvider).fetchAuctionById(id);
});

