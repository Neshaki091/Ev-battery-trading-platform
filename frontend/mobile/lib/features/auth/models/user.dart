import 'package:equatable/equatable.dart';

class User extends Equatable {
  const User({
    required this.id,
    required this.email,
    required this.username,
    required this.role,
    required this.isActive,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        username: json['username']?.toString() ?? json['name']?.toString() ?? 'Người dùng',
        role: json['role']?.toString() ?? 'user',
        isActive: json['isActive'] == null ? true : json['isActive'] as bool,
      );

  Map<String, dynamic> toJson() => {
        '_id': id,
        'email': email,
        'username': username,
        'role': role,
        'isActive': isActive,
      };

  final String id;
  final String email;
  final String username;
  final String role;
  final bool isActive;

  bool get isAdmin => role.toLowerCase() == 'admin';

  @override
  List<Object?> get props => [id, email, username, role, isActive];
}

