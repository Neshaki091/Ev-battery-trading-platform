import 'package:flutter/material.dart';

import '../../listings/presentation/home_screen.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const HomeScreen()),
          ),
        ),
        title: const Text('Admin Dashboard'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Bảng điều khiển quản trị',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Text(
              'Theo dõi báo cáo nhanh về số lượng tin đăng, giao dịch, phản hồi người dùng và các dịch vụ vi mô.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                children: const [
                  _AdminStatCard(
                    title: 'Tin chờ duyệt',
                    value: '12',
                    icon: Icons.verified_outlined,
                  ),
                  _AdminStatCard(
                    title: 'Báo cáo người dùng',
                    value: '3',
                    icon: Icons.report_gmailerrorred_outlined,
                  ),
                  _AdminStatCard(
                    title: 'Doanh thu tuần',
                    value: '230tr',
                    icon: Icons.stacked_bar_chart,
                  ),
                  _AdminStatCard(
                    title: 'Tỉ lệ xử lý SLA',
                    value: '96%',
                    icon: Icons.speed_outlined,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AdminStatCard extends StatelessWidget {
  const _AdminStatCard({
    required this.title,
    required this.value,
    required this.icon,
  });

  final String title;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary),
            const Spacer(),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(title),
          ],
        ),
      ),
    );
  }
}

