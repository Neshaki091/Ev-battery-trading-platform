import 'package:equatable/equatable.dart';
import 'package:intl/intl.dart';

class Listing extends Equatable {
  const Listing({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.location,
    required this.category,
    required this.status,
    required this.images,
    required this.vehicleModel,
    required this.createdAt,
    required this.sellerName,
  });

  factory Listing.fromJson(Map<String, dynamic> json) {
    final price = _parsePrice(json['price']);
    return Listing(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Tin đăng',
      description: json['description']?.toString() ?? '',
      price: price,
      location: json['location']?.toString() ??
          json['city']?.toString() ??
          'Vietnam',
      category: json['category']?.toString() ??
          json['type']?.toString() ??
          'General',
      status: json['status']?.toString() ?? 'Active',
      images: (json['images'] as List?)
              ?.map((item) => item.toString())
              .where((url) => url.isNotEmpty)
              .toList() ??
          const [],
      vehicleModel: json['vehicle_model']?.toString() ??
          json['model']?.toString() ??
          '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      sellerName: json['sellerName']?.toString() ??
          json['owner']?.toString() ??
          'Ẩn danh',
    );
  }

  final String id;
  final String title;
  final String description;
  final double? price;
  final String location;
  final String category;
  final String status;
  final List<String> images;
  final String vehicleModel;
  final DateTime createdAt;
  final String sellerName;

  String get displayPrice =>
      price == null ? 'Liên hệ' : NumberFormat.currency(locale: 'vi_VN', symbol: '₫').format(price);

  bool get isSold => status.toLowerCase() == 'sold';

  Listing copyWith({
    String? status,
  }) {
    return Listing(
      id: id,
      title: title,
      description: description,
      price: price,
      location: location,
      category: category,
      status: status ?? this.status,
      images: images,
      vehicleModel: vehicleModel,
      createdAt: createdAt,
      sellerName: sellerName,
    );
  }

  static double? _parsePrice(dynamic input) {
    if (input == null) return null;
    if (input is num) return input.toDouble();
    if (input is String) {
      final numeric = double.tryParse(
        input.replaceAll(RegExp(r'[^0-9.]'), ''),
      );
      return numeric;
    }
    return null;
  }

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        price,
        location,
        category,
        status,
        images,
        vehicleModel,
        createdAt,
        sellerName,
      ];
}

