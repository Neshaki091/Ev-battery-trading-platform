import 'package:flutter/material.dart';

class ErrorView extends StatelessWidget {
  const ErrorView({
    super.key,
    required this.message,
    this.onRetry,
  });

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.warning_rounded,
            size: 56,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 12),
          Text(
            'Đã có lỗi xảy ra',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
          if (onRetry != null) ...[
            const SizedBox(height: 16),
            FilledButton(
              onPressed: onRetry,
              child: const Text('Thử lại'),
            ),
          ],
        ],
      ),
    );
  }
}

