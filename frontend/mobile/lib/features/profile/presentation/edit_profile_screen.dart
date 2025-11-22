import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/controllers/auth_controller.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _bankNameController;
  late TextEditingController _bankCodeController;
  late TextEditingController _accountNumberController;
  late TextEditingController _accountNameController;
  late TextEditingController _branchController;

  int _currentTab = 0; // 0: Profile, 1: Wallet

  @override
  void initState() {
    super.initState();
    final user = ref.read(authControllerProvider).user;
    
    _firstNameController = TextEditingController(text: user?.firstName ?? '');
    _lastNameController = TextEditingController(text: user?.lastName ?? '');
    _bankNameController = TextEditingController(text: user?.wallet.bankName ?? '');
    _bankCodeController = TextEditingController(text: user?.wallet.bankCode ?? '');
    _accountNumberController = TextEditingController(text: user?.wallet.accountNumber ?? '');
    _accountNameController = TextEditingController(text: user?.wallet.accountName ?? '');
    _branchController = TextEditingController(text: user?.wallet.branch ?? '');
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _bankNameController.dispose();
    _bankCodeController.dispose();
    _accountNumberController.dispose();
    _accountNameController.dispose();
    _branchController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      await ref.read(authControllerProvider.notifier).updateProfile(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cập nhật thông tin thành công')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _saveWallet() async {
    if (!_formKey.currentState!.validate()) return;

    // Confirmation dialog
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận thông tin ví'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Vui lòng kiểm tra kỹ thông tin:'),
              const SizedBox(height: 12),
              Text('Ngân hàng: ${_bankNameController.text.trim()}'),
              Text('Mã NH: ${_bankCodeController.text.trim().toUpperCase()}'),
              Text('Số TK: ${_accountNumberController.text.trim()}'),
              Text('Tên TK: ${_accountNameController.text.trim().toUpperCase()}'),
              if (_branchController.text.trim().isNotEmpty)
                Text('Chi nhánh: ${_branchController.text.trim()}'),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning, color: Colors.red.shade700, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'KIỂM TRA KỸ SỐ TÀI KHOẢN!',
                        style: TextStyle(
                          color: Colors.red.shade700,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Kiểm tra lại'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await ref.read(authControllerProvider.notifier).updateProfile(
        wallet: {
          'bankName': _bankNameController.text.trim(),
          'bankCode': _bankCodeController.text.trim().toUpperCase(),
          'accountNumber': _accountNumberController.text.trim(),
          'accountName': _accountNameController.text.trim().toUpperCase(),
          'branch': _branchController.text.trim(),
        },
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Cập nhật thông tin ví thành công!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authControllerProvider);
    final isLoading = state.isLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chỉnh sửa thông tin'),
        actions: [
          TextButton(
            onPressed: isLoading ? null : (_currentTab == 0 ? _saveProfile : _saveWallet),
            child: isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Lưu'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Tabs
          Container(
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Colors.grey.shade300),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _currentTab = 0),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: _currentTab == 0 ? Theme.of(context).primaryColor : Colors.transparent,
                            width: 2,
                          ),
                        ),
                      ),
                      child: Text(
                        'Thông tin cá nhân',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontWeight: _currentTab == 0 ? FontWeight.bold : FontWeight.normal,
                          color: _currentTab == 0 ? Theme.of(context).primaryColor : null,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _currentTab = 1),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: _currentTab == 1 ? Theme.of(context).primaryColor : Colors.transparent,
                            width: 2,
                          ),
                        ),
                      ),
                      child: Text(
                        '💳 Thông tin ví',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontWeight: _currentTab == 1 ? FontWeight.bold : FontWeight.normal,
                          color: _currentTab == 1 ? Theme.of(context).primaryColor : null,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Content
          Expanded(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: _currentTab == 0 ? _buildProfileForm() : _buildWalletForm(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildProfileForm() {
    return [
      TextFormField(
        controller: _firstNameController,
        decoration: const InputDecoration(
          labelText: 'Họ',
          border: OutlineInputBorder(),
        ),
      ),
      const SizedBox(height: 16),
      TextFormField(
        controller: _lastNameController,
        decoration: const InputDecoration(
          labelText: 'Tên',
          border: OutlineInputBorder(),
        ),
      ),
    ];
  }

  List<Widget> _buildWalletForm() {
    return [
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.blue.shade50,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.info_outline, size: 20, color: Colors.blue.shade700),
                const SizedBox(width: 8),
                Text(
                  'Lưu ý quan trọng:',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.blue.shade700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '• Tên chủ TK phải viết HOA, KHÔNG DẤU\n'
              '• Kiểm tra kỹ số tài khoản\n'
              '• Thông tin này dùng để nhận tiền từ giao dịch',
              style: TextStyle(fontSize: 13, color: Colors.blue.shade900),
            ),
          ],
        ),
      ),
      const SizedBox(height: 20),
      TextFormField(
        controller: _bankNameController,
        decoration: const InputDecoration(
          labelText: 'Tên ngân hàng *',
          hintText: 'Ví dụ: Vietcombank',
          border: OutlineInputBorder(),
        ),
        validator: (value) {
          if (value == null || value.trim().isEmpty) {
            return 'Vui lòng nhập tên ngân hàng';
          }
          return null;
        },
      ),
      const SizedBox(height: 16),
      TextFormField(
        controller: _bankCodeController,
        decoration: const InputDecoration(
          labelText: 'Mã ngân hàng *',
          hintText: 'VCB, TCB, ACB...',
          border: OutlineInputBorder(),
          helperText: 'VCB: Vietcombank, TCB: Techcombank, ACB: ACB',
        ),
        textCapitalization: TextCapitalization.characters,
        validator: (value) {
          if (value == null || value.trim().isEmpty) {
            return 'Vui lòng nhập mã ngân hàng';
          }
          return null;
        },
      ),
      const SizedBox(height: 16),
      TextFormField(
        controller: _accountNumberController,
        decoration: InputDecoration(
          labelText: 'Số tài khoản *',
          hintText: '1234567890',
          border: const OutlineInputBorder(),
          helperText: '⚠️ KIỂM TRA KỸ! Nhập sai sẽ không nhận được tiền',
          helperStyle: TextStyle(
            color: Colors.red.shade700,
            fontWeight: FontWeight.w600,
          ),
        ),
        keyboardType: TextInputType.number,
        validator: (value) {
          if (value == null || value.trim().isEmpty) {
            return 'Vui lòng nhập số tài khoản';
          }
          return null;
        },
      ),
      const SizedBox(height: 16),
      TextFormField(
        controller: _accountNameController,
        decoration: const InputDecoration(
          labelText: 'Tên chủ tài khoản *',
          hintText: 'NGUYEN VAN A (VIẾT HOA, KHÔNG DẤU)',
          border: OutlineInputBorder(),
          helperText: 'Phải khớp với tên trên thẻ ngân hàng',
        ),
        textCapitalization: TextCapitalization.characters,
        validator: (value) {
          if (value == null || value.trim().isEmpty) {
            return 'Vui lòng nhập tên chủ tài khoản';
          }
          return null;
        },
      ),
      const SizedBox(height: 16),
      TextFormField(
        controller: _branchController,
        decoration: const InputDecoration(
          labelText: 'Chi nhánh (tùy chọn)',
          hintText: 'Chi nhánh Hà Nội',
          border: OutlineInputBorder(),
        ),
      ),
    ];
  }
}
