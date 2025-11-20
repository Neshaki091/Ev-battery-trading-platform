import 'package:flutter/material.dart';

import '../../controllers/listing_search_controller.dart';

class ListingFiltersSheet extends StatefulWidget {
  const ListingFiltersSheet({
    super.key,
    required this.initialState,
    required this.onApply,
  });

  final ListingSearchState initialState;
  final void Function({
    String? location,
    String? model,
    double? minPrice,
    double? maxPrice,
  }) onApply;

  @override
  State<ListingFiltersSheet> createState() => _ListingFiltersSheetState();
}

class _ListingFiltersSheetState extends State<ListingFiltersSheet> {
  late final TextEditingController _locationController;
  late final TextEditingController _modelController;
  late final TextEditingController _minPriceController;
  late final TextEditingController _maxPriceController;

  @override
  void initState() {
    super.initState();
    _locationController =
        TextEditingController(text: widget.initialState.location);
    _modelController = TextEditingController(text: widget.initialState.model);
    _minPriceController = TextEditingController(
      text: widget.initialState.minPrice?.toString() ?? '',
    );
    _maxPriceController = TextEditingController(
      text: widget.initialState.maxPrice?.toString() ?? '',
    );
  }

  @override
  void dispose() {
    _locationController.dispose();
    _modelController.dispose();
    _minPriceController.dispose();
    _maxPriceController.dispose();
    super.dispose();
  }

  void _apply() {
    widget.onApply(
      location: _locationController.text.trim(),
      model: _modelController.text.trim(),
      minPrice: double.tryParse(_minPriceController.text),
      maxPrice: double.tryParse(_maxPriceController.text),
    );
    Navigator.of(context).maybePop();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: MediaQuery.of(context).viewInsets,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.blueGrey.shade200,
                borderRadius: BorderRadius.circular(999),
              ),
            ),
            Text(
              'Bộ lọc nâng cao',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: 'Khu vực',
                prefixIcon: Icon(Icons.location_on_outlined),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _modelController,
              decoration: const InputDecoration(
                labelText: 'Mẫu xe / Model',
                prefixIcon: Icon(Icons.directions_car_filled_outlined),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _minPriceController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Giá tối thiểu',
                      prefixIcon: Icon(Icons.price_change_outlined),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _maxPriceController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Giá tối đa',
                      prefixIcon: Icon(Icons.price_change),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _apply,
              child: const Text('Áp dụng'),
            ),
          ],
        ),
      ),
    );
  }
}

