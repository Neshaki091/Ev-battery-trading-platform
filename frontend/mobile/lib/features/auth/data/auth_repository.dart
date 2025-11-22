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
    final refreshToken = payload['refreshToken']?.toString();
    final userMap = _extractUser(payload);

    if (token != null) {
      await _storage.saveToken(token);
    }
    if (refreshToken != null) {
      await _storage.saveRefreshToken(refreshToken);
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
    final refreshToken = payload['refreshToken']?.toString();
    final userMap = _extractUser(payload);

    if (token != null) {
      await _storage.saveToken(token);
    }
    if (refreshToken != null) {
      await _storage.saveRefreshToken(refreshToken);
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

  Future<User> getProfile() async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/auth/me',
      requiresAuth: true,
    );

    final payload = response.data ?? {};
    final userMap = _extractUser(payload);
    await _storage.saveUserJson(userMap);
    return User.fromJson(userMap);
  }

  Future<User> updateProfile({
    String? firstName,
    String? lastName,
    Map<String, dynamic>? wallet,
  }) async {
    final currentUser = await restoreSession();
    if (currentUser == null) {
      throw Exception('User not logged in');
    }

    final data = <String, dynamic>{};
    if (firstName != null) data['firstName'] = firstName;
    if (lastName != null) data['lastName'] = lastName;
    if (wallet != null) data['wallet'] = wallet;

    final response = await _apiClient.put<Map<String, dynamic>>(
      '/auth/users/${currentUser.id}',
      data: data,
      requiresAuth: true,
    );

    final payload = response.data ?? {};
    final userMap = payload['user'] as Map<String, dynamic>? ?? payload;
    await _storage.saveUserJson(userMap);
    return User.fromJson(userMap);
  }

  Map<String, dynamic> _extractUser(Map<String, dynamic> payload) {
    final userRaw = payload['user'];
    final role = payload['role'] ?? payload['user']?['role'];
    final isActive = payload['isActive'] ?? payload['user']?['isActive'];
    final wallet = payload['wallet'] ?? payload['user']?['wallet'];

    final map = <String, dynamic>{};
    if (userRaw is Map<String, dynamic>) {
      map.addAll(userRaw);
    } else {
      map.addAll(payload);
    }
    if (role != null) map['role'] = role;
    if (isActive != null) map['isActive'] = isActive;
    if (wallet != null) map['wallet'] = wallet;

    // Extract profile fields if they exist
    final profile = payload['profile'] ?? payload['user']?['profile'];
    if (profile is Map<String, dynamic>) {
      if (profile['email'] != null) map['email'] = profile['email'];
      if (profile['username'] != null) map['username'] = profile['username'];
      if (profile['firstName'] != null) map['firstName'] = profile['firstName'];
      if (profile['lastName'] != null) map['lastName'] = profile['lastName'];
      if (profile['phonenumber'] != null) map['phonenumber'] = profile['phonenumber'];
    }

    return map;
  }

  Future<void> put<T>(String path, {Object? data, bool requiresAuth = false}) async {
    await _apiClient.put<T>(path, data: data, requiresAuth: requiresAuth);
  }
}

