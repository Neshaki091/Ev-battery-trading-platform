import 'package:equatable/equatable.dart';

class Wallet extends Equatable {
  const Wallet({
    this.bankName = '',
    this.bankCode = '',
    this.accountNumber = '',
    this.accountName = '',
    this.branch = '',
  });

  factory Wallet.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const Wallet();
    return Wallet(
      bankName: json['bankName']?.toString() ?? '',
      bankCode: json['bankCode']?.toString() ?? '',
      accountNumber: json['accountNumber']?.toString() ?? '',
      accountName: json['accountName']?.toString() ?? '',
      branch: json['branch']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'bankName': bankName,
        'bankCode': bankCode,
        'accountNumber': accountNumber,
        'accountName': accountName,
        'branch': branch,
      };

  final String bankName;
  final String bankCode;
  final String accountNumber;
  final String accountName;
  final String branch;

  bool get hasWalletInfo =>
      bankName.isNotEmpty && accountNumber.isNotEmpty && accountName.isNotEmpty;

  Wallet copyWith({
    String? bankName,
    String? bankCode,
    String? accountNumber,
    String? accountName,
    String? branch,
  }) {
    return Wallet(
      bankName: bankName ?? this.bankName,
      bankCode: bankCode ?? this.bankCode,
      accountNumber: accountNumber ?? this.accountNumber,
      accountName: accountName ?? this.accountName,
      branch: branch ?? this.branch,
    );
  }

  @override
  List<Object?> get props => [bankName, bankCode, accountNumber, accountName, branch];
}

class User extends Equatable {
  const User({
    required this.id,
    required this.email,
    required this.username,
    required this.role,
    required this.isActive,
    this.firstName,
    this.lastName,
    this.phonenumber,
    this.wallet = const Wallet(),
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['_id']?.toString() ?? json['id']?.toString() ?? json['user_id']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        username: json['username']?.toString() ?? json['name']?.toString() ?? 'Người dùng',
        role: json['role']?.toString() ?? 'user',
        isActive: json['isActive'] == null ? true : json['isActive'] as bool,
        firstName: json['firstName']?.toString(),
        lastName: json['lastName']?.toString(),
        phonenumber: json['phonenumber']?.toString(),
        wallet: Wallet.fromJson(json['wallet'] as Map<String, dynamic>?),
      );

  Map<String, dynamic> toJson() => {
        '_id': id,
        'email': email,
        'username': username,
        'role': role,
        'isActive': isActive,
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (phonenumber != null) 'phonenumber': phonenumber,
        'wallet': wallet.toJson(),
      };

  final String id;
  final String email;
  final String username;
  final String role;
  final bool isActive;
  final String? firstName;
  final String? lastName;
  final String? phonenumber;
  final Wallet wallet;

  bool get isAdmin => role.toLowerCase() == 'admin';

  User copyWith({
    String? id,
    String? email,
    String? username,
    String? role,
    bool? isActive,
    String? firstName,
    String? lastName,
    String? phonenumber,
    Wallet? wallet,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      username: username ?? this.username,
      role: role ?? this.role,
      isActive: isActive ?? this.isActive,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      phonenumber: phonenumber ?? this.phonenumber,
      wallet: wallet ?? this.wallet,
    );
  }

  @override
  List<Object?> get props => [id, email, username, role, isActive, firstName, lastName, phonenumber, wallet];
}

