import '../../../core/network/api_client.dart';
import '../models/auction.dart';

class AuctionRepository {
  AuctionRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<Auction>> fetchAuctions() async {
    final response = await _apiClient.get<dynamic>('/auctions');
    final data = response.data;
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(Auction.fromJson)
          .toList();
    }
    if (data is Map<String, dynamic> && data['data'] is List) {
      return (data['data'] as List)
          .whereType<Map<String, dynamic>>()
          .map(Auction.fromJson)
          .toList();
    }
    return const [];
  }

  Future<Auction> fetchAuctionById(String id) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/auctions/$id',
    );
    final data = response.data ?? {};
    if (data['auction'] is Map<String, dynamic>) {
      return Auction.fromJson(Map<String, dynamic>.from(data['auction']));
    }
    return Auction.fromJson(data);
  }

  Future<void> placeBid(String auctionId, double amount) async {
    await _apiClient.post<Map<String, dynamic>>(
      '/auctions/$auctionId/bids',
      data: {'amount': amount},
      requiresAuth: true,
    );
  }

  Future<void> buyNow(String auctionId) async {
    await _apiClient.post<Map<String, dynamic>>(
      '/auctions/$auctionId/buy-now',
      requiresAuth: true,
    );
  }
}

