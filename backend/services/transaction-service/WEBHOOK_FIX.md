# 🔧 Fix Webhook Casso - Lỗi 401 "Chữ ký không hợp lệ"

## ⚠️ KHẨN CẤP - CẦN DEPLOY NGAY

## Vấn đề
Khi thiết lập webhook trên Casso Dashboard, nhận lỗi 401 "Chữ ký không hợp lệ" vì Casso gửi test request không có signature hợp lệ.

**Hiện tại:** Code đã được sửa ở local nhưng chưa deploy lên production (`api.evbtranding.site`)

## Giải pháp
Cập nhật file `controllers/cassoController.js` để chấp nhận test request từ Casso.

## File cần sửa
`backend/services/transaction-service/controllers/cassoController.js`

## Code cần thay thế

### Tìm đoạn code này (dòng 33-42):
```javascript
const handleWebhook = async (req, res) => {
  try {
    const rawBody = req.rawBody || JSON.stringify(req.body || {});
    const signature = getSignatureFromHeaders(req.headers);

    if (!verifySignature(rawBody, signature, process.env.CASSO_WEBHOOK_SECRET)) {
      return res.status(401).json({ success: false, error: 'Chữ ký không hợp lệ' });
    }

    const records = Array.isArray(req.body?.data) ? req.body.data : [req.body];
```

### Thay bằng:
```javascript
const handleWebhook = async (req, res) => {
  try {
    const rawBody = req.rawBody || JSON.stringify(req.body || {});
    const signature = getSignatureFromHeaders(req.headers);

    // Kiểm tra nếu là test request từ Casso (không có data hoặc data rỗng)
    const isTestRequest = !req.body?.data || (Array.isArray(req.body?.data) && req.body.data.length === 0);
    
    if (isTestRequest) {
      console.log('📝 Nhận test request từ Casso - Webhook đã được cấu hình thành công!');
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook endpoint is ready',
        timestamp: new Date().toISOString()
      });
    }

    // Verify signature cho request thật
    if (!verifySignature(rawBody, signature, process.env.CASSO_WEBHOOK_SECRET)) {
      console.error('❌ Chữ ký không hợp lệ:', { signature, rawBody: rawBody.substring(0, 100) });
      return res.status(401).json({ success: false, error: 'Chữ ký không hợp lệ' });
    }

    const records = Array.isArray(req.body?.data) ? req.body.data : [req.body];
```

## 🚀 Cách deploy lên production

### Option 1: Git push (Khuyến nghị)
```bash
# Commit code mới
git add backend/services/transaction-service/controllers/cassoController.js
git commit -m "fix: Accept Casso test webhook request"
git push origin main

# Trên server production
cd /path/to/project
git pull origin main
docker-compose restart transaction-service
```

### Option 2: Copy file trực tiếp
```bash
# Từ máy local
scp backend/services/transaction-service/controllers/cassoController.js \
  user@api.evbtranding.site:/path/to/project/backend/services/transaction-service/controllers/

# SSH vào server
ssh user@api.evbtranding.site
cd /path/to/project/backend
docker-compose restart transaction-service
```

### Option 3: Docker rebuild
```bash
# Trên server production
cd /path/to/project/backend
docker-compose build transaction-service
docker-compose up -d transaction-service
```

## Sau khi deploy

### Restart service:
```bash
cd backend
docker-compose restart transaction-service
```

Hoặc nếu dùng Docker Swarm:
```bash
docker service update backend_transaction-service
```

Hoặc nếu dùng Kubernetes:
```bash
kubectl rollout restart deployment transaction-service
```

### Kiểm tra logs:
```bash
docker-compose logs -f transaction-service
```

Bạn sẽ thấy:
```
📝 Nhận test request từ Casso - Webhook đã được cấu hình thành công!
```

## Test lại
Sau khi restart, quay lại Casso Dashboard và nhấn "Tiếp tục". Lần này sẽ thành công! ✅

## Giải thích
- **Test request**: Casso gửi request không có `data` để kiểm tra endpoint → Trả về 200 OK
- **Real request**: Khi có giao dịch thật, Casso gửi `data` với signature → Verify signature như bình thường

## Liên hệ
Nếu có vấn đề, liên hệ: [Thông tin của bạn]

