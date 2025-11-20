import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../controllers/listing_providers.dart';

class CreateListingScreen extends ConsumerStatefulWidget {
  const CreateListingScreen({super.key});

  @override
  ConsumerState<CreateListingScreen> createState() =>
      _CreateListingScreenState();
}

class _CreateListingScreenState extends ConsumerState<CreateListingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _locationController = TextEditingController();

  // Vehicle fields
  final _vehicleBrandController = TextEditingController();
  final _vehicleModelController = TextEditingController();
  final _vehicleYearController = TextEditingController();
  final _vehicleMileageController = TextEditingController();

  // Battery fields
  final _batteryCapacityController = TextEditingController();
  final _batteryConditionController = TextEditingController();

  String _category = 'Other';
  String _condition = 'Used';
  bool _submitting = false;

  List<File> _selectedImages = [];
  bool _suggestingPrice = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _locationController.dispose();
    _vehicleBrandController.dispose();
    _vehicleModelController.dispose();
    _vehicleYearController.dispose();
    _vehicleMileageController.dispose();
    _batteryCapacityController.dispose();
    _batteryConditionController.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    final picker = ImagePicker();
    final pickedFiles = await picker.pickMultiImage(
      imageQuality: 75,
      maxHeight: 1000,
      maxWidth: 1000,
    );

    if (pickedFiles.isNotEmpty) {
      setState(() {
        final newImages = pickedFiles.map((xfile) => File(xfile.path)).toList();
        _selectedImages = [..._selectedImages, ...newImages].take(10).toList();
      });
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  Future<void> _suggestPrice() async {
    if (_suggestingPrice) return;

    if (_titleController.text.isEmpty || _descriptionController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content:
                Text('Vui lòng nhập Tiêu đề và Mô tả trước khi gợi ý giá.')),
      );
      return;
    }

    setState(() => _suggestingPrice = true);

    final suggestionPayload = {
      'title': _titleController.text.trim(),
      'description': _descriptionController.text.trim(),
      'location': _locationController.text.trim(),
      'condition': _condition,
      'category': _category,
    };

    if (_category == 'Vehicle') {
      suggestionPayload['vehicle_brand'] = _vehicleBrandController.text.trim();
      suggestionPayload['vehicle_model'] = _vehicleModelController.text.trim();

      final year = int.tryParse(_vehicleYearController.text);
      if (year != null) {
        suggestionPayload['vehicle_manufacturing_year'] = year.toString();
      }

      final mileage = int.tryParse(_vehicleMileageController.text);
      if (mileage != null) {
        suggestionPayload['vehicle_mileage_km'] = mileage.toString();
      }
    } else if (_category == 'Battery') {
      final capacity = double.tryParse(_batteryCapacityController.text);
      if (capacity != null) {
        suggestionPayload['battery_capacity_kwh'] = capacity.toString();
      }

      final condition = int.tryParse(_batteryConditionController.text);
      if (condition != null) {
        suggestionPayload['battery_condition_percentage'] =
            condition.toString();
      }
    }

    try {
      final suggestedPrice = await ref
          .read(listingRepositoryProvider)
          .suggestPrice(suggestionPayload);

      if (suggestedPrice != null && suggestedPrice > 0) {
        final roundedPrice = (suggestedPrice / 1000).round() * 1000;
        _priceController.text = roundedPrice.toString();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Giá gợi ý: ${roundedPrice.toString()} VND')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content:
                  Text('AI không thể đưa ra gợi ý. Vui lòng tự nhập giá.')),
        );
      }
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi gợi ý giá: ${error.toString()}')),
      );
    } finally {
      if (mounted) {
        setState(() => _suggestingPrice = false);
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedImages.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Vui lòng chọn ít nhất một ảnh sản phẩm.')),
      );
      return;
    }

    setState(() => _submitting = true);

    try {
      final imageUrls = await ref
          .read(listingRepositoryProvider)
          .uploadImages(_selectedImages);

      final payload = <String, dynamic>{
        'title': _titleController.text.trim(),
        'description': _descriptionController.text.trim(),
        'price': double.tryParse(_priceController.text) ?? 0,
        'location': _locationController.text.trim(),
        'category': _category,
        'condition': _condition,
        'images': imageUrls,
      };

      if (_category == 'Vehicle') {
        if (_vehicleBrandController.text.trim().isNotEmpty) {
          payload['vehicle_brand'] = _vehicleBrandController.text.trim();
        }
        if (_vehicleModelController.text.trim().isNotEmpty) {
          payload['vehicle_model'] = _vehicleModelController.text.trim();
        }
        final year = int.tryParse(_vehicleYearController.text);
        if (year != null) {
          payload['vehicle_manufacturing_year'] = year;
        }
        final mileage = int.tryParse(_vehicleMileageController.text);
        if (mileage != null) {
          payload['vehicle_mileage_km'] = mileage;
        }
      }

      if (_category == 'Battery') {
        final capacity = double.tryParse(_batteryCapacityController.text);
        if (capacity != null) {
          payload['battery_capacity_kwh'] = capacity;
        }
        final condition = int.tryParse(_batteryConditionController.text);
        if (condition != null) {
          payload['battery_condition_percentage'] = condition;
        }
      }

      await ref.read(listingRepositoryProvider).createListing(payload);
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đăng tin thành công. Đợi admin duyệt.')),
      );

      context.go('/my-listings');
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi đăng tin: ${error.toString()}')),
      );
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Đăng tin mới'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Tiêu đề tin đăng *',
                ),
                validator: (value) =>
                    value == null || value.isEmpty ? 'Nhập tiêu đề' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _category,
                decoration: const InputDecoration(labelText: 'Danh mục *'),
                items: const [
                  DropdownMenuItem(value: 'Vehicle', child: Text('Xe điện')),
                  DropdownMenuItem(
                      value: 'Battery', child: Text('Pin & Module')),
                  DropdownMenuItem(value: 'Other', child: Text('Khác')),
                ],
                onChanged: (value) {
                  if (value != null) setState(() => _category = value);
                },
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _condition,
                decoration: const InputDecoration(labelText: 'Tình trạng *'),
                items: const [
                  DropdownMenuItem(value: 'New', child: Text('Mới')),
                  DropdownMenuItem(value: 'Used', child: Text('Đã sử dụng')),
                  DropdownMenuItem(
                      value: 'Refurbished', child: Text('Đã tân trang')),
                ],
                onChanged: (value) {
                  if (value != null) setState(() => _condition = value);
                },
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _priceController,
                      decoration: const InputDecoration(
                        labelText: 'Giá bán (VND) *',
                        hintText: '1000000',
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Nhập giá bán';
                        }
                        final price = double.tryParse(value);
                        if (price == null || price <= 0) {
                          return 'Giá phải là số dương';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: _suggestingPrice ? null : _suggestPrice,
                    icon: _suggestingPrice
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.auto_awesome, size: 18),
                    label:
                        Text(_suggestingPrice ? 'Đang gợi ý...' : 'Gợi ý giá'),
                  ),
                ],
              ),
              const Padding(
                padding: EdgeInsets.only(top: 4),
                child: Text(
                  'Sử dụng Gợi ý giá AI nếu bạn không chắc mức giá.',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _locationController,
                decoration: const InputDecoration(
                  labelText: 'Khu vực *',
                  hintText: 'Hà Nội, TP.HCM, ...',
                ),
                validator: (value) =>
                    value == null || value.isEmpty ? 'Nhập khu vực' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descriptionController,
                decoration:
                    const InputDecoration(labelText: 'Mô tả chi tiết *'),
                maxLines: 6,
                validator: (value) =>
                    value == null || value.isEmpty ? 'Nhập mô tả' : null,
              ),
              const SizedBox(height: 16),
              const Text('Ảnh sản phẩm (Tối đa 10 ảnh) *',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  if (_selectedImages.length < 10)
                    GestureDetector(
                      onTap: _pickImages,
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.blue),
                        ),
                        child: const Icon(Icons.add_a_photo,
                            size: 30, color: Colors.grey),
                      ),
                    ),
                  ..._selectedImages.asMap().entries.map(
                        (e) => Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Image.file(
                              e.value,
                              width: 80,
                              height: 80,
                              fit: BoxFit.cover,
                            ),
                            Positioned(
                              top: -10,
                              right: -10,
                              child: GestureDetector(
                                onTap: () => _removeImage(e.key),
                                child: const CircleAvatar(
                                  radius: 12,
                                  backgroundColor: Colors.red,
                                  child: Icon(Icons.close,
                                      size: 16, color: Colors.white),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                ],
              ),
              if (_category == 'Vehicle') ...[
                const SizedBox(height: 16),
                const Divider(),
                Text("Thông tin xe",
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium!
                        .copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _vehicleBrandController,
                  decoration: const InputDecoration(
                      labelText: 'Hãng xe', hintText: 'Tesla, VinFast...'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _vehicleModelController,
                  decoration: const InputDecoration(
                      labelText: 'Model', hintText: 'Model 3, VF8...'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _vehicleYearController,
                  decoration: const InputDecoration(
                    labelText: 'Năm sản xuất',
                    hintText: '2023',
                  ),
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value != null && value.isNotEmpty) {
                      final year = int.tryParse(value);
                      if (year == null ||
                          year < 1900 ||
                          year > DateTime.now().year + 1) {
                        return 'Năm không hợp lệ';
                      }
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _vehicleMileageController,
                  decoration: const InputDecoration(
                    labelText: 'Số km đã đi',
                    hintText: '10000',
                    suffixText: 'km',
                  ),
                  keyboardType: TextInputType.number,
                ),
              ],
              if (_category == 'Battery') ...[
                const SizedBox(height: 16),
                const Divider(),
                Text("Thông tin pin",
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium!
                        .copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _batteryCapacityController,
                  decoration: const InputDecoration(
                    labelText: 'Dung lượng (kWh)',
                    hintText: '50',
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _batteryConditionController,
                  decoration: const InputDecoration(
                    labelText: 'Tình trạng (%)',
                    hintText: '90',
                  ),
                  keyboardType: TextInputType.number,
                ),
              ],
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _submitting ? null : _submit,
                child: _submitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Đăng tin'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
