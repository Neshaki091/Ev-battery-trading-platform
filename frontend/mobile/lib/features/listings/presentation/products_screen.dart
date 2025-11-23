import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/widgets/app_loading_indicator.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_view.dart';
import '../controllers/listing_providers.dart';
import '../controllers/listing_search_controller.dart';
<<<<<<< HEAD
import 'home_screen.dart';
=======
>>>>>>> temp
import 'widgets/listing_card.dart';
import 'widgets/listing_filters_sheet.dart';

class ProductsScreen extends ConsumerStatefulWidget {
  const ProductsScreen({super.key});

  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  final _queryController = TextEditingController();

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(listingSearchControllerProvider);
    final notifier = ref.read(listingSearchControllerProvider.notifier);

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
        title: const Text('Kho sản phẩm'),
        actions: [
          IconButton(
            onPressed: () => _openFilters(state, notifier),
            icon: const Icon(Icons.filter_alt_outlined),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/create'),
        icon: const Icon(Icons.add),
        label: const Text('Đăng tin'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _queryController,
                      decoration: InputDecoration(
                        hintText: 'Tìm kiếm pin, xe điện, module...',
                        prefixIcon: const Icon(Icons.search),
                        suffixIcon: state.query.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear),
                                onPressed: () {
                                  _queryController.clear();
                                  notifier.search(query: '');
                                },
                              )
                            : null,
                      ),
                      onSubmitted: (value) =>
                          notifier.search(query: value.trim()),
                    ),
                  ),
                  const SizedBox(width: 12),
                  FilledButton.icon(
                    onPressed: () =>
                        notifier.search(query: _queryController.text.trim()),
                    icon: const Icon(Icons.arrow_forward),
                    label: const Text('Lọc'),
                  ),
                ],
              ),
            ),
            _buildActiveFilters(state, notifier),
            Expanded(
              child: state.isLoading
                  ? const AppLoadingIndicator()
                  : state.errorMessage != null
                      ? ErrorView(
                          message: state.errorMessage!,
                          onRetry: () =>
                              notifier.search(query: state.query),
                        )
                      : state.listings.isEmpty
                          ? const EmptyState(
                              title: 'Không tìm thấy sản phẩm',
                              message:
                                  'Điều chỉnh bộ lọc hoặc thử lại sau nhé.',
                              icon: Icons.inventory_2_outlined,
                            )
                          : RefreshIndicator(
                              onRefresh: () => notifier.search(),
                              child: ListView.separated(
                                padding: const EdgeInsets.fromLTRB(
                                    20, 12, 20, 100),
                                itemCount: state.listings.length,
                                separatorBuilder: (_, __) =>
                                    const SizedBox(height: 12),
                                itemBuilder: (context, index) {
                                  final listing = state.listings[index];
                                  return ListingCard(
                                    listing: listing,
                                    onTap: () => context.go(
                                      '/products/${listing.id}',
                                    ),
                                  );
                                },
                              ),
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActiveFilters(
    ListingSearchState state,
    ListingSearchController notifier,
  ) {
    final filters = <Widget>[];

    void addChip(String label, VoidCallback onDeleted) {
      filters.add(
        Chip(
          label: Text(label),
          onDeleted: onDeleted,
        ),
      );
    }

    if (state.location.isNotEmpty) {
      addChip('Khu vực: ${state.location}', () {
        notifier.search(location: '');
      });
    }

    if (state.model.isNotEmpty) {
      addChip('Model: ${state.model}', () {
        notifier.search(model: '');
      });
    }

    if (state.minPrice != null) {
      addChip('Giá từ ${state.minPrice!.toStringAsFixed(0)}', () {
        notifier.search(minPrice: null);
      });
    }

    if (state.maxPrice != null) {
      addChip('Giá đến ${state.maxPrice!.toStringAsFixed(0)}', () {
        notifier.search(maxPrice: null);
      });
    }

    if (filters.isEmpty) {
      return const SizedBox.shrink();
    }

    return SizedBox(
      height: 40,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        scrollDirection: Axis.horizontal,
        itemBuilder: (context, index) => filters[index],
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemCount: filters.length,
      ),
    );
  }

  Future<void> _openFilters(
    ListingSearchState state,
    ListingSearchController notifier,
  ) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => ListingFiltersSheet(
        initialState: state,
        onApply: ({
          String? location,
          String? model,
          double? minPrice,
          double? maxPrice,
        }) {
          notifier.search(
            location: location,
            model: model,
            minPrice: minPrice,
            maxPrice: maxPrice,
          );
        },
      ),
    );
  }
}

