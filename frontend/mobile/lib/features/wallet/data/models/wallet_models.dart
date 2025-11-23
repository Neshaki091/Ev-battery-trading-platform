class WalletBalance {
  final double balance;

  WalletBalance({required this.balance});

  factory WalletBalance.fromJson(Map<String, dynamic> json) {
    return WalletBalance(
      balance: (json['walletBalance'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'walletBalance': balance,
    };
  }
}

class WithdrawalRequest {
  final String id;
  final String userId;
  final double amount;
  final String status; // pending, completed, rejected
  final BankInfo bankInfo;
  final String? note;
  final String? adminNote;
  final String? transactionRef;
  final DateTime createdAt;
  final DateTime? processedAt;

  WithdrawalRequest({
    required this.id,
    required this.userId,
    required this.amount,
    required this.status,
    required this.bankInfo,
    this.note,
    this.adminNote,
    this.transactionRef,
    required this.createdAt,
    this.processedAt,
  });

  factory WithdrawalRequest.fromJson(Map<String, dynamic> json) {
    return WithdrawalRequest(
      id: json['_id'] ?? '',
      userId: json['userId'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      status: json['status'] ?? 'pending',
      bankInfo: BankInfo.fromJson(json['bankInfo'] ?? {}),
      note: json['note'],
      adminNote: json['adminNote'],
      transactionRef: json['transactionRef'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      processedAt: json['processedAt'] != null ? DateTime.parse(json['processedAt']) : null,
    );
  }

  String get statusLabel {
    switch (status) {
      case 'pending':
        return '⏳ Chờ duyệt';
      case 'completed':
        return '✅ Đã chuyển';
      case 'rejected':
        return '❌ Từ chối';
      default:
        return status;
    }
  }

  Color get statusColor {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'completed':
        return Colors.green;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}

class BankInfo {
  final String bankName;
  final String? bankCode;
  final String accountNumber;
  final String accountName;
  final String? branch;

  BankInfo({
    required this.bankName,
    this.bankCode,
    required this.accountNumber,
    required this.accountName,
    this.branch,
  });

  factory BankInfo.fromJson(Map<String, dynamic> json) {
    return BankInfo(
      bankName: json['bankName'] ?? '',
      bankCode: json['bankCode'],
      accountNumber: json['accountNumber'] ?? '',
      accountName: json['accountName'] ?? '',
      branch: json['branch'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'bankName': bankName,
      'bankCode': bankCode,
      'accountNumber': accountNumber,
      'accountName': accountName,
      'branch': branch,
    };
  }

  bool get isComplete {
    return bankName.isNotEmpty && accountNumber.isNotEmpty && accountName.isNotEmpty;
  }
}
