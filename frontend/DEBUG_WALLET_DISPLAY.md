# 🐛 Debug: Wallet không hiển thị sau khi update

## 🔍 Vấn đề

1. ✅ Update wallet thành công (có thông báo)
2. ❌ Thông tin wallet không hiển thị
3. ❓ Có khu vực "số dư" xuất hiện (không rõ ở đâu)

---

## ✅ Đã sửa

### 1. Thêm console.log để debug

**File:** `frontend/web/src/pages/ProfilePage.jsx`

```javascript
const fetchProfile = async () => {
  const response = await api.get('/auth/me');
  console.log('📥 Profile response:', response.data);
  
  const wallet = response.data.wallet || {};
  console.log('💳 Wallet data:', wallet);
  
  // ... rest of code
};
```

### 2. Sửa logic hiển thị wallet

**Trước:**
```javascript
{user?.wallet && (user.wallet.bankName || user.wallet.accountNumber) ? (
  // Hiển thị wallet
) : (
  // Chưa có wallet
)}
```

**Sau:**
```javascript
{(() => {
  const wallet = user?.wallet || {};
  const hasWallet = wallet.bankName || wallet.accountNumber || wallet.accountName;
  
  console.log('🔍 Wallet check:', { wallet, hasWallet });
  
  return hasWallet ? (
    // Hiển thị wallet với badge xanh "✅ Đã cập nhật"
  ) : (
    // Cảnh báo vàng "⚠️ Chưa cập nhật"
  );
})()}
```

### 3. Thêm badge trạng thái

**Đã có wallet:**
```html
<div style="background: #d4edda; color: #155724">
  ✅ Đã cập nhật thông tin ví
</div>
```

**Chưa có wallet:**
```html
<div style="background: #fff3cd; color: #856404">
  ⚠️ Bạn chưa cập nhật thông tin ví
</div>
```

---

## 🧪 Cách test

### 1. Mở DevTools Console

```
F12 → Console tab
```

### 2. Refresh trang Profile

```
Ctrl + F5
```

### 3. Kiểm tra logs

**Mong đợi thấy:**
```
📥 Profile response: {
  user_id: "...",
  profile: {...},
  wallet: {
    bankName: "Vietcombank",
    bankCode: "VCB",
    accountNumber: "1234567890",
    accountName: "NGUYEN VAN A",
    branch: "..."
  },
  ...
}

💳 Wallet data: {
  bankName: "Vietcombank",
  bankCode: "VCB",
  accountNumber: "1234567890",
  accountName: "NGUYEN VAN A",
  branch: "..."
}

🔍 Wallet check: {
  wallet: {...},
  hasWallet: true
}
```

### 4. Kiểm tra hiển thị

**Nếu có wallet:**
- ✅ Badge xanh "Đã cập nhật thông tin ví"
- ✅ Hiển thị: Ngân hàng, Mã NH, Số TK, Tên TK, Chi nhánh

**Nếu chưa có wallet:**
- ⚠️ Badge vàng "Bạn chưa cập nhật thông tin ví"

---

## 🔧 Nếu vẫn không hiển thị

### Kiểm tra 1: Backend có trả về wallet không?

```bash
# Test API
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response phải có:**
```json
{
  "user_id": "...",
  "profile": {...},
  "wallet": {           // ⭐ PHẢI CÓ
    "bankName": "...",
    "bankCode": "...",
    "accountNumber": "...",
    "accountName": "...",
    "branch": "..."
  }
}
```

**Nếu KHÔNG có wallet trong response:**
→ Vấn đề ở backend, cần restart auth-service

```bash
docker-compose restart auth-service
```

### Kiểm tra 2: LocalStorage có đúng không?

```javascript
// Trong Console
localStorage.getItem('evb_user')
```

**Nếu có wallet trong localStorage nhưng không hiển thị:**
→ Vấn đề ở frontend, clear cache và refresh

```javascript
// Clear localStorage
localStorage.clear();
// Đăng nhập lại
```

### Kiểm tra 3: State có update không?

```javascript
// Thêm vào fetchProfile
console.log('🔄 User state:', user);
console.log('📝 Wallet form:', walletForm);
```

---

## 🎯 Về "số dư"

**Không tìm thấy "số dư" trong ProfilePage.jsx**

Có thể "số dư" xuất hiện ở:
1. ❓ Component khác (Header, Sidebar, etc.)
2. ❓ Extension trình duyệt
3. ❓ Cache cũ

**Cách kiểm tra:**
1. Tìm trong toàn bộ project:
```bash
grep -r "số dư" frontend/web/src/
grep -r "balance" frontend/web/src/
```

2. Hard refresh:
```
Ctrl + Shift + R
```

3. Clear cache:
```
DevTools → Application → Clear storage → Clear site data
```

---

## 📋 Checklist

- [x] Thêm console.log để debug
- [x] Sửa logic hiển thị wallet
- [x] Thêm badge trạng thái
- [ ] Test với user có wallet
- [ ] Test với user chưa có wallet
- [ ] Kiểm tra backend response
- [ ] Tìm nguồn gốc "số dư"

---

## 🚀 Next Steps

1. **Refresh trang Profile**
2. **Mở Console** (F12)
3. **Kiểm tra logs** (📥 💳 🔍)
4. **Screenshot và gửi logs** nếu vẫn lỗi

---

**Status:** 🔄 DEBUGGING
**Date:** 2024-11-22

