import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../listings/presentation/home_screen.dart';
import '../controllers/auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final controller = ref.read(authControllerProvider.notifier);
    await controller.login(
      email: _emailController.text.trim(),
      password: _passwordController.text.trim(),
    );

    // Bắt buộc phải đọc lại trạng thái sau khi hàm login (async) hoàn thành.
    // Dùng ref.read là chính xác trong trường hợp này để kiểm tra kết quả ngay lập tức.
    final state = ref.read(authControllerProvider); 

    if (state.errorMessage != null) {
      if (!mounted) return;
      // Dùng ScaffolderMessenger ở đây để hiển thị lỗi từ AuthController.
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(state.errorMessage!)));
      return;
    }

    // Nếu không có lỗi, điều hướng.
    if (!mounted) return;
    context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const HomeScreen()),
          ),
        ),
        title: const Text('Đăng nhập'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _AuthHighlights()
                  .animate()
                  .fadeIn(duration: 400.ms)
                  .slideY(begin: -0.1, duration: 400.ms),
              const SizedBox(height: 32),
              Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                                  'Chào mừng quay lại',
                                  style: theme.textTheme.headlineSmall
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                )
                                .animate()
                                .fadeIn(duration: 300.ms, delay: 100.ms)
                                .slideX(
                                  begin: -0.1,
                                  duration: 300.ms,
                                  delay: 100.ms,
                                ),
                            const SizedBox(height: 8),
                            Text(
                                  'Quản lý tin đăng, theo dõi giao dịch và kết nối đối tác chỉ trong một ứng dụng.',
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: theme.colorScheme.onSurfaceVariant
                                        .withOpacity(0.8),
                                  ),
                                )
                                .animate()
                                .fadeIn(duration: 300.ms, delay: 200.ms)
                                .slideX(
                                  begin: -0.1,
                                  duration: 300.ms,
                                  delay: 200.ms,
                                ),
                            const SizedBox(height: 32),
                            TextFormField(
                                  controller: _emailController,
                                  decoration: const InputDecoration(
                                    labelText: 'Email',
                                    prefixIcon: Icon(Icons.mail_outline),
                                  ),
                                  keyboardType: TextInputType.emailAddress,
                                  textInputAction: TextInputAction.next,
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Vui lòng nhập email';
                                    }
                                    if (!value.contains('@')) {
                                      return 'Email không hợp lệ';
                                    }
                                    return null;
                                  },
                                )
                                .animate()
                                .fadeIn(duration: 300.ms, delay: 300.ms)
                                .slideX(
                                  begin: -0.1,
                                  duration: 300.ms,
                                  delay: 300.ms,
                                ),
                            const SizedBox(height: 20),
                            TextFormField(
                                  controller: _passwordController,
                                  decoration: InputDecoration(
                                    labelText: 'Mật khẩu',
                                    prefixIcon: const Icon(Icons.lock_outline),
                                    suffixIcon: IconButton(
                                      onPressed: () {
                                        setState(() => _obscure = !_obscure);
                                      },
                                      icon: Icon(
                                        _obscure
                                            ? Icons.visibility_outlined
                                            : Icons.visibility_off_outlined,
                                      ),
                                    ),
                                  ),
                                  obscureText: _obscure,
                                  textInputAction: TextInputAction.done,
                                  onFieldSubmitted: (_) => _handleSubmit(),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Vui lòng nhập mật khẩu';
                                    }
                                    if (value.length < 6) {
                                      return 'Mật khẩu phải có ít nhất 6 ký tự';
                                    }
                                    return null;
                                  },
                                )
                                .animate()
                                .fadeIn(duration: 300.ms, delay: 400.ms)
                                .slideX(
                                  begin: -0.1,
                                  duration: 300.ms,
                                  delay: 400.ms,
                                ),
                            const SizedBox(height: 16),
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                onPressed: () {},
                                child: const Text('Quên mật khẩu?'),
                              ),
                            ).animate().fadeIn(duration: 300.ms, delay: 500.ms),
                            const SizedBox(height: 8),
                            FilledButton(
                                  onPressed:
                                      authState.isLoading
                                          ? null
                                          : _handleSubmit,
                                  style: FilledButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 16,
                                    ),
                                  ),
                                  child:
                                      authState.isLoading
                                          ? SizedBox(
                                              width: 20,
                                              height: 20,
                                              child: CircularProgressIndicator(
                                                strokeWidth: 2,
                                                valueColor:
                                                    AlwaysStoppedAnimation<Color>(
                                                      theme.colorScheme.onPrimary,
                                                    ),
                                              ),
                                            )
                                          : const Text(
                                              'Đăng nhập',
                                              style: TextStyle(fontSize: 16),
                                            ),
                                )
                                .animate()
                                .fadeIn(duration: 300.ms, delay: 600.ms)
                                .slideY(
                                  begin: 0.1,
                                  duration: 300.ms,
                                  delay: 600.ms,
                                ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Chưa có tài khoản? ',
                                  style: theme.textTheme.bodyMedium,
                                ),
                                TextButton(
                                  onPressed: () => context.go('/register'),
                                  child: const Text('Đăng ký ngay'),
                                ),
                              ],
                            ).animate().fadeIn(duration: 300.ms, delay: 700.ms),
                          ],
                        ),
                      ),
                    ),
                  )
                  .animate()
                  .fadeIn(duration: 400.ms, delay: 200.ms)
                  .slideY(begin: 0.1, duration: 400.ms, delay: 200.ms),
            ],
          ),
        ),
      ),
    );
  }
}

class _AuthHighlights extends StatelessWidget {
  const _AuthHighlights();

  static const highlights = [
    'Theo dõi toàn bộ giao dịch và trao đổi với đối tác trong một bảng điều khiển duy nhất.',
    'Gợi ý giá bằng AI giúp định giá sản phẩm trong vài giây dựa trên dữ liệu thị trường mới nhất.',
    'Bảo mật đa tầng và lưu trữ hợp đồng điện tử đảm bảo giao dịch minh bạch, an toàn.',
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Chip(
          avatar: const Icon(Icons.flash_on, size: 16),
          label: const Text('EVB Market'),
        ),
        const SizedBox(height: 12),
        Text(
          'Khởi động phiên giao dịch năng lượng xanh của bạn',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 12),
        ...highlights.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.check_circle_rounded,
                  size: 20,
                  color: Colors.green,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    item,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}