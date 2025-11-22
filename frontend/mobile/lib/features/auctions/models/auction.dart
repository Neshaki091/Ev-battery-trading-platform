import 'package:equatable/equatable.dart';
import 'package:intl/intl.dart';

class Auction extends Equatable {
  const Auction({
    required this.id,
    required this.title,
    required this.status,
    required this.currentBid,
    required this.buyNowPrice,
    required this.endTime,
    required this.image,
    required this.description,
  });

  factory Auction.fromJson(Map<String, dynamic> json) => Auction(
        id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? 'Phiên đấu giá',
        status: json['status']?.toString() ?? 'active',
        currentBid: (json['currentBid'] ?? json['current_price'])?.toDouble() ??
            double.tryParse(json['currentBid']?.toString() ?? ''),
        buyNowPrice: (json['buyNowPrice'] ?? json['buy_now'])?.toDouble() ??
            double.tryParse(json['buyNowPrice']?.toString() ?? ''),
        endTime: DateTime.tryParse(json['endTime']?.toString() ?? '') ??
            DateTime.now().add(const Duration(hours: 2)),
        image: (json['images'] is List && json['images'].isNotEmpty)
            ? json['images'].first.toString()
            : json['image']?.toString(),
        description: json['description']?.toString() ?? '',
      );

  final String id;
  final String title;
  final String status;
  final double? currentBid;
  final double? buyNowPrice;
  final DateTime endTime;
  final String? image;
  final String description;

  bool get isClosed => status.toLowerCase() == 'closed';

  String get countdown {
    final diff = endTime.difference(DateTime.now());
    if (diff.isNegative) return 'Đã kết thúc';
    final hours = diff.inHours;
    final minutes = diff.inMinutes % 60;
    return '${hours}h ${minutes}m';
  }

  String formatCurrency(double? value) {
    if (value == null) return '—';
    return NumberFormat.currency(locale: 'vi_VN', symbol: '₫').format(value);
  }

  @override
  List<Object?> get props => [
        id,
        title,
        status,
        currentBid,
        buyNowPrice,
        endTime,
        image,
        description,
      ];
}

