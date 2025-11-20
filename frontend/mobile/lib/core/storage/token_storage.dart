import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class TokenStorage {
  static const _tokenKey = 'evb_token';
  static const _userKey = 'evb_user';

  Future<SharedPreferences> _prefs() => SharedPreferences.getInstance();

  Future<void> saveToken(String token) async {
    final prefs = await _prefs();
    await prefs.setString(_tokenKey, token);
  }

  Future<String?> readToken() async {
    final prefs = await _prefs();
    return prefs.getString(_tokenKey);
  }

  Future<void> clearToken() async {
    final prefs = await _prefs();
    await prefs.remove(_tokenKey);
  }

  Future<void> saveUserJson(Map<String, dynamic> data) async {
    final prefs = await _prefs();
    await prefs.setString(_userKey, jsonEncode(data));
  }

  Future<Map<String, dynamic>?> readUserJson() async {
    final prefs = await _prefs();
    final raw = prefs.getString(_userKey);
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  Future<void> clearUser() async {
    final prefs = await _prefs();
    await prefs.remove(_userKey);
  }

  Future<void> clearAll() async {
    final prefs = await _prefs();
    await prefs
      ..remove(_tokenKey)
      ..remove(_userKey);
  }
}

