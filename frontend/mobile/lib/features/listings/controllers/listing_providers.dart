import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../data/listing_repository.dart';
import '../models/listing.dart';
import 'listing_search_controller.dart';

final listingRepositoryProvider = Provider<ListingRepository>(
  (ref) => ListingRepository(ref.watch(apiClientProvider)),
);

final featuredListingsProvider = FutureProvider<List<Listing>>(
  (ref) => ref.watch(listingRepositoryProvider).fetchFeaturedListings(),
);

final listingDetailProvider =
    FutureProvider.family<Listing, String>((ref, id) {
  return ref.watch(listingRepositoryProvider).fetchListingById(id);
});

final myListingsProvider = FutureProvider<List<Listing>>((ref) {
  return ref.watch(listingRepositoryProvider).fetchMyListings();
});

final listingSearchControllerProvider = StateNotifierProvider.autoDispose<
    ListingSearchController, ListingSearchState>(
  (ref) => ListingSearchController(ref.watch(listingRepositoryProvider))
    ..loadInitial(),
);

