import '../../../core/network/api_client.dart';
import '../../../core/storage/token_storage.dart';
import '../models/user.dart';

class AuthRepository {
  AuthRepository(this._apiClient, this._storage);

  final ApiClient _apiClient;
  final TokenStorage _storage;

  Future<User> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/auth/users/login',
      data: {
        'email': email,
        'password': password,
      },
    );

    final payload = response.data ?? {};
    final token = payload['accessToken']?.toString();
    final userMap = _extractUser(payload);

    if (token != null) {
      await _storage.saveToken(token);
    }
    await _storage.saveUserJson(userMap);
    return User.fromJson(userMap);
  }

  Future<User> register({
    required String email,
    required String password,
    required String phonenumber,
    String? firstName,
    String? lastName,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/auth/users/',
      data: {
        'email': email,
        'password': password,
        'phonenumber': phonenumber,
        if (firstName != null && firstName.isNotEmpty) 'firstName': firstName,
        if (lastName != null && lastName.isNotEmpty) 'lastName': lastName,
      },
    );

    final payload = response.data ?? {};
    final token = payload['accessToken']?.toString();
    final userMap = _extractUser(payload);

    if (token != null) {
      await _storage.saveToken(token);
    }
    await _storage.saveUserJson(userMap);
    return User.fromJson(userMap);
  }

  Future<void> logout() async {
    await _storage.clearAll();
  }

  Future<User?> restoreSession() async {
    final data = await _storage.readUserJson();
    if (data == null) return null;
    return User.fromJson(data);
  }

  Map<String, dynamic> _extractUser(Map<String, dynamic> payload) {
    final userRaw = payload['user'];
    final role = payload['role'] ?? payload['user']?['role'];
    final isActive = payload['isActive'] ?? payload['user']?['isActive'];

    final map = <String, dynamic>{};
    if (userRaw is Map<String, dynamic>) {
      map.addAll(userRaw);
    } else {
      map.addAll(payload);
    }
    if (role != null) map['role'] = role;
    if (isActive != null) map['isActive'] = isActive;
    return map;
  }
}

