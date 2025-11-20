import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../data/auth_repository.dart';
import '../models/user.dart';

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(
    ref.watch(apiClientProvider),
    ref.watch(tokenStorageProvider),
  ),
);

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>(
  (ref) => AuthController(ref.watch(authRepositoryProvider))..restoreSession(),
);

class AuthState {
  const AuthState({
    this.user,
    this.isLoading = false,
    this.errorMessage,
  });

  final User? user;
  final bool isLoading;
  final String? errorMessage;

  AuthState copyWith({
    User? user,
    bool? isLoading,
    String? errorMessage,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._repository) : super(const AuthState());

  final AuthRepository _repository;

  Future<void> restoreSession() async {
    final user = await _repository.restoreSession();
    if (user != null) {
      state = state.copyWith(user: user);
    }
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final user = await _repository.login(email: email, password: password);
      state = state.copyWith(user: user, isLoading: false);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String phonenumber,
    String? firstName,
    String? lastName,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final user = await _repository.register(
        email: email,
        password: password,
        phonenumber: phonenumber,
        firstName: firstName,
        lastName: lastName,
      );
      state = state.copyWith(user: user, isLoading: false);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AuthState();
  }
}

