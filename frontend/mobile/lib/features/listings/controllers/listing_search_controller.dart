import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/listing_repository.dart';
import '../models/listing.dart';

class ListingSearchState {
  const ListingSearchState({
    this.listings = const [],
    this.query = '',
    this.location = '',
    this.model = '',
    this.category,
    this.minPrice,
    this.maxPrice,
    this.isLoading = false,
    this.errorMessage,
  });

  final List<Listing> listings;
  final String query;
  final String location;
  final String model;
  final String? category;
  final double? minPrice;
  final double? maxPrice;
  final bool isLoading;
  final String? errorMessage;

  ListingSearchState copyWith({
    List<Listing>? listings,
    String? query,
    String? location,
    String? model,
    String? category,
    double? minPrice,
    double? maxPrice,
    bool? isLoading,
    String? errorMessage,
  }) {
    return ListingSearchState(
      listings: listings ?? this.listings,
      query: query ?? this.query,
      location: location ?? this.location,
      model: model ?? this.model,
      category: category ?? this.category,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

class ListingSearchController extends StateNotifier<ListingSearchState> {
  ListingSearchController(this._repository) : super(const ListingSearchState());

  final ListingRepository _repository;

  Future<void> loadInitial() async {
    await search();
  }

  Future<void> search({
    String? query,
    String? location,
    String? model,
    String? category,
    double? minPrice,
    double? maxPrice,
  }) async {
    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      query: query ?? state.query,
      location: location ?? state.location,
      model: model ?? state.model,
      category: category ?? state.category,
      minPrice: minPrice ?? state.minPrice,
      maxPrice: maxPrice ?? state.maxPrice,
    );

    try {
      final listings = await _repository.searchListings(
        query: state.query,
        location: state.location,
        model: state.model,
        category: state.category,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
      );
      state = state.copyWith(listings: listings, isLoading: false);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: error.toString(),
      );
    }
  }

  void clearFilters() {
    state = state.copyWith(
      query: '',
      location: '',
      model: '',
      minPrice: null,
      maxPrice: null,
      category: null,
    );
    search();
  }
}

