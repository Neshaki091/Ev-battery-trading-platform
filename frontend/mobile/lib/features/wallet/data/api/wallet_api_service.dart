import 'package:dio/dio.dart';
import '../models/wallet_models.dart';

class WalletApiService {
  final Dio _dio;

  WalletApiService(this._dio);

  /// Get wallet balance
  Future<WalletBalance> getWalletBalance() async {
    try {
      final response = await _dio.get('/wallet/balance');
      return WalletBalance.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to get wallet balance: $e');
    }
  }

  /// Get my withdrawal requests
  Future<List<WithdrawalRequest>> getMyWithdrawalRequests() async {
    try {
      final response = await _dio.get('/withdrawals/my-requests');
      final data = response.data['data'] as List;
      return data.map((json) => WithdrawalRequest.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get withdrawal requests: $e');
    }
  }

  /// Create withdrawal request
  Future<WithdrawalRequest> createWithdrawalRequest({
    required double amount,
    String? note,
  }) async {
    try {
      final response = await _dio.post(
        '/withdrawals/request',
        data: {
          'amount': amount,
          'note': note,
        },
      );
      return WithdrawalRequest.fromJson(response.data['data']);
    } catch (e) {
      if (e is DioException && e.response != null) {
        throw Exception(e.response!.data['error'] ?? 'Failed to create withdrawal request');
      }
      throw Exception('Failed to create withdrawal request: $e');
    }
  }

  /// Get pending withdrawals (Admin only)
  Future<List<WithdrawalRequest>> getPendingWithdrawals() async {
    try {
      final response = await _dio.get('/admin/withdrawals/pending');
      final data = response.data['data'] as List;
      return data.map((json) => WithdrawalRequest.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get pending withdrawals: $e');
    }
  }

  /// Get withdrawal history (Admin only)
  Future<List<WithdrawalRequest>> getWithdrawalHistory() async {
    try {
      final response = await _dio.get('/admin/withdrawals/history');
      final data = response.data['data'] as List;
      return data.map((json) => WithdrawalRequest.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get withdrawal history: $e');
    }
  }

  /// Approve withdrawal request (Admin only)
  Future<void> approveWithdrawal({
    required String withdrawalId,
    String? transactionRef,
    String? adminNote,
  }) async {
    try {
      await _dio.post(
        '/admin/withdrawals/$withdrawalId/approve',
        data: {
          'transactionRef': transactionRef,
          'adminNote': adminNote,
        },
      );
    } catch (e) {
      if (e is DioException && e.response != null) {
        throw Exception(e.response!.data['error'] ?? 'Failed to approve withdrawal');
      }
      throw Exception('Failed to approve withdrawal: $e');
    }
  }

  /// Reject withdrawal request (Admin only)
  Future<void> rejectWithdrawal({
    required String withdrawalId,
    required String adminNote,
  }) async {
    try {
      await _dio.post(
        '/admin/withdrawals/$withdrawalId/reject',
        data: {
          'adminNote': adminNote,
        },
      );
    } catch (e) {
      if (e is DioException && e.response != null) {
        throw Exception(e.response!.data['error'] ?? 'Failed to reject withdrawal');
      }
      throw Exception('Failed to reject withdrawal: $e');
    }
  }
}
