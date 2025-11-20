import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'config/app_config.dart';
import 'network/api_client.dart';
import 'storage/token_storage.dart';

final tokenStorageProvider = Provider<TokenStorage>((_) => TokenStorage());

final dioProvider = Provider<Dio>(
  (_) => Dio(
    BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
    ),
  ),
);

final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(
    ref.watch(tokenStorageProvider),
    dio: ref.watch(dioProvider),
  ),
);

