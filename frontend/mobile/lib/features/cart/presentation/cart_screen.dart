import 'package:flutter/material.dart';
<<<<<<< HEAD

import '../../listings/presentation/home_screen.dart';
=======
import 'package:go_router/go_router.dart';
>>>>>>> temp

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
<<<<<<< HEAD
          onPressed: () => Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const HomeScreen()),
          ),
=======
          onPressed: () => context.pop(),
>>>>>>> temp
        ),
        title: const Text('Giao dịch của tôi'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.receipt_long_outlined,
                size: 64,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 16),
              Text(
                'Chưa có giao dịch',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Khi bạn đặt mua hoặc trúng đấu giá, thông tin giao dịch sẽ được hiển thị tại đây.',
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

