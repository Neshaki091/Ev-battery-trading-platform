import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../storage/token_storage.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient(this._tokenStorage, {Dio? dio})
    : _dio =
          dio ??
          Dio(
            BaseOptions(
              baseUrl: AppConfig.apiBaseUrl,
              connectTimeout: const Duration(seconds: 15),
              receiveTimeout: const Duration(seconds: 15),
              responseType: ResponseType.json,
            ),
          );

  final Dio _dio;
  final TokenStorage _tokenStorage;

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    bool requiresAuth = false,
  }) async {
    final headers = await _headers(requiresAuth);
    return _guard<T>(
      () => _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: Options(headers: headers),
      ),
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    Object? data,
    bool requiresAuth = false,
    bool isMultipart = false,
  }) async {
    final headers = await _headers(requiresAuth, isMultipart: isMultipart);
    return _guard<T>(
      () => _dio.post<T>(path, data: data, options: Options(headers: headers)),
    );
  }

<<<<<<< HEAD
=======
  Future<Response<T>> put<T>(
    String path, {
    Object? data,
    bool requiresAuth = false,
  }) async {
    final headers = await _headers(requiresAuth);
    return _guard<T>(
      () => _dio.put<T>(path, data: data, options: Options(headers: headers)),
    );
  }

>>>>>>> temp
  Future<Response<T>> patch<T>(
    String path, {
    Object? data,
    bool requiresAuth = false,
  }) async {
    final headers = await _headers(requiresAuth);
    return _guard<T>(
      () => _dio.patch<T>(path, data: data, options: Options(headers: headers)),
    );
  }

  Future<Response<T>> delete<T>(
    String path, {
    Object? data,
    bool requiresAuth = false,
  }) async {
    final headers = await _headers(requiresAuth);
    return _guard<T>(
      () =>
          _dio.delete<T>(path, data: data, options: Options(headers: headers)),
    );
  }

  Future<Map<String, String>> _headers(bool requiresAuth, {bool isMultipart = false}) async {
    final headers = <String, String>{
      'Accept': 'application/json',
    };

    // Chỉ set Content-Type nếu không phải multipart (Dio sẽ tự động set cho multipart)
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    if (requiresAuth) {
      final token = await _tokenStorage.readToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  Future<Response<T>> _guard<T>(Future<Response<T>> Function() run) async {
    try {
      final response = await run();
      return response;
    } on DioException catch (error) {
      debugPrint('API error: $error');
      if (error.response?.statusCode == 401) {
        await _tokenStorage.clearAll();
      }

      throw ApiException(
        message: _resolveErrorMessage(error),
        statusCode: error.response?.statusCode,
        details: _ensureMap(error.response?.data),
      );
    } catch (error, stackTrace) {
      debugPrint('Unknown API error: $error');
      Error.throwWithStackTrace(
        ApiException(message: error.toString()),
        stackTrace,
      );
    }
  }

  String _resolveErrorMessage(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return 'Kết nối đến máy chủ quá hạn.';
    }
    if (error.response?.data is Map<String, dynamic>) {
      final data = error.response!.data as Map<String, dynamic>;
      return data['message']?.toString() ?? 'Yêu cầu thất bại.';
    }
    return error.message ?? 'Yêu cầu thất bại.';
  }

  Map<String, dynamic>? _ensureMap(dynamic data) {
    if (data is Map<String, dynamic>) {
      return data;
    }
    return null;
  }
}
