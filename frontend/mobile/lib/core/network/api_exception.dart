class ApiException implements Exception {
  ApiException({
    required this.message,
    this.statusCode,
    this.details,
  });

  final String message;
  final int? statusCode;
  final Map<String, dynamic>? details;

  @override
  String toString() => 'ApiException($statusCode): $message';
}

