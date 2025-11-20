import 'dart:io';

import 'package:dio/dio.dart';

import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../models/listing.dart';

// Hằng số Cloudinary
const String CLOUDINARY_CLOUD_NAME = 'dgoze8lyy';
const String CLOUDINARY_UPLOAD_PRESET = 'EVB_listing';
const String CLOUDINARY_UPLOAD_URL =
    'https://api.cloudinary.com/v1_1/$CLOUDINARY_CLOUD_NAME/image/upload';

class ListingRepository {
  ListingRepository(this._apiClient);

  final ApiClient _apiClient;

  // Dio instance riêng để gọi Cloudinary (không cần base URL và auth)
  final Dio _cloudinaryDio = Dio();

  /// Upload danh sách ảnh trực tiếp lên Cloudinary và trả về danh sách URLs
  ///
  /// [files] - Danh sách các File cần upload
  ///
  /// Trả về [List<String>] chứa các secure_url của ảnh đã upload thành công
  Future<List<String>> uploadImages(List<File> files) async {
    if (files.isEmpty) return [];

    final List<String> uploadedUrls = [];

    try {
      // Duyệt qua từng file và upload riêng lẻ
      for (final file in files) {
        // Tạo FormData mới cho mỗi file
        final formData = FormData.fromMap({
          'file': await MultipartFile.fromFile(
            file.path,
            filename: file.path.split('/').last,
          ),
          'upload_preset': CLOUDINARY_UPLOAD_PRESET,
          'cloud_name': CLOUDINARY_CLOUD_NAME,
        });

        // Gửi POST request trực tiếp đến Cloudinary API
        final response = await _cloudinaryDio.post<Map<String, dynamic>>(
          CLOUDINARY_UPLOAD_URL,
          data: formData,
        );

        final result = response.data;
        if (result == null) {
          throw Exception('Phản hồi từ Cloudinary rỗng.');
        }

        // Kiểm tra lỗi từ Cloudinary
        if (result['error'] != null) {
          final errorMessage = result['error']['message']?.toString() ??
              'Lỗi upload ảnh không xác định';
          throw Exception('Cloudinary error: $errorMessage');
        }

        // Lấy secure_url từ phản hồi
        final secureUrl = result['secure_url']?.toString();
        if (secureUrl == null || secureUrl.isEmpty) {
          throw Exception('Không nhận được secure_url từ Cloudinary.');
        }

        uploadedUrls.add(secureUrl);
      }

      return uploadedUrls;
    } on DioException catch (e) {
      throw Exception(
          'Lỗi kết nối đến Cloudinary: ${e.message ?? 'Không xác định'}');
    } catch (e) {
      throw Exception('Lỗi khi tải lên ảnh: ${e.toString()}');
    }
  }

  /// Gợi ý giá sản phẩm dựa trên thông tin đầu vào
  ///
  /// [payload] - Map chứa thông tin sản phẩm (title, description, category,
  ///              condition, location, và các field chi tiết Vehicle/Battery)
  ///
  /// Trả về [double?] - Giá được gợi ý, hoặc null nếu không có giá trị
  Future<double?> suggestPrice(Map<String, dynamic> payload) async {
    try {
      // Gửi POST request đến endpoint gợi ý giá
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/listings/suggest-price',
        data: payload,
        requiresAuth: true, // Yêu cầu authentication
      );

      final data = response.data;
      if (data == null) {
        return null;
      }

      // Hỗ trợ nhiều format response khác nhau
      dynamic price;
      if (data['data'] is Map && data['data']['suggestedPrice'] != null) {
        price = data['data']['suggestedPrice'];
      } else if (data['suggestedPrice'] != null) {
        price = data['suggestedPrice'];
      } else if (data['data'] is num) {
        price = data['data'];
      }

      // Chuyển đổi sang double nếu là số
      if (price is num) {
        return price.toDouble();
      }

      return null;
    } catch (e) {
      // Log lỗi và throw exception với thông báo rõ ràng
      throw Exception(
          'Không thể kết nối đến dịch vụ gợi ý giá: ${e.toString()}');
    }
  }
  // ===================================

  Future<List<Listing>> fetchFeaturedListings({String? category}) async {
    return _loadListings(
      primaryPath: '/search/listings/',
      fallbackPath: '/listings/public',
      params: {
        'limit': 8,
        'category': category ?? '',
        'q': '',
        'sort_by': 'newest',
      },
    );
  }

  Future<List<Listing>> searchListings({
    String? query,
    String? category,
    String? location,
    String? model,
    double? minPrice,
    double? maxPrice,
    int? pageSize,
  }) async {
    final params = {
      'q': query ?? '',
      'category': category ?? '',
      'location': location ?? '',
      'model': model ?? '',
      'min_price': minPrice?.toString(),
      'max_price': maxPrice?.toString(),
      'limit': pageSize ?? AppConfig.defaultPageSize,
      'sort_by': 'newest',
    };

    return _loadListings(
      primaryPath: '/search/listings/',
      fallbackPath: '/listings/public',
      params: params,
    );
  }

  Future<Listing> fetchListingById(String id) async {
    try {
      final response = await _apiClient.get<Map<String, dynamic>>(
        '/listings/$id',
      );
      final data = response.data;
      if (data == null || data.isEmpty) {
        throw Exception('Không tìm thấy tin đăng');
      }
      if (data['listing'] is Map<String, dynamic>) {
        return Listing.fromJson(Map<String, dynamic>.from(data['listing']));
      }
      return Listing.fromJson(data);
    } catch (_) {
      final fallback = await _apiClient.get<List<dynamic>>('/listings/public');
      final list = fallback.data ?? [];
      final match = list.firstWhere(
        (item) => (item['_id']?.toString() ?? item['id']) == id,
        orElse: () => null,
      );
      if (match is Map<String, dynamic>) {
        return Listing.fromJson(match);
      }
      rethrow;
    }
  }

  Future<void> createListing(Map<String, dynamic> payload) async {
    await _apiClient.post<Map<String, dynamic>>(
      '/listings/',
      data: payload,
      requiresAuth: true,
    );
  }

  Future<List<Listing>> fetchMyListings() async {
    final response = await _apiClient.get<dynamic>(
      '/listings/me',
      requiresAuth: true,
    );
    return _parseListingResponse(response.data);
  }

  Future<List<Listing>> _loadListings({
    required String primaryPath,
    required String fallbackPath,
    Map<String, dynamic>? params,
  }) async {
    try {
      final response = await _apiClient.get<dynamic>(
        primaryPath,
        queryParameters: params,
      );
      return _parseListingResponse(response.data);
    } catch (_) {
      final fallback = await _apiClient.get<dynamic>(fallbackPath);
      return _parseListingResponse(fallback.data);
    }
  }

  List<Listing> _parseListingResponse(dynamic data) {
    Iterable<dynamic> rawList = const [];
    if (data is Map<String, dynamic>) {
      if (data['data'] is Map<String, dynamic>) {
        final nested = data['data'] as Map<String, dynamic>;
        if (nested['listings'] is List) {
          rawList = nested['listings'] as List<dynamic>;
        } else if (nested['data'] is List) {
          rawList = nested['data'] as List<dynamic>;
        }
      } else if (data['listings'] is List) {
        rawList = data['listings'] as List<dynamic>;
      } else if (data['data'] is List) {
        rawList = data['data'] as List<dynamic>;
      }
    } else if (data is List) {
      rawList = data;
    }

    return rawList
        .whereType<Map<String, dynamic>>()
        .map(Listing.fromJson)
        .toList();
  }
}
