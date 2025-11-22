// util/firebase.js
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

let db = null;

try {
    // Lấy đường dẫn đến file service account
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    // SỬA ĐỔI: Lấy DATABASE_URL từ .env
    const databaseURL = process.env.FIREBASE_DATABASE_URL;

    if (!serviceAccountPath) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not set in .env');
    }
    
    // SỬA ĐỔI: Thêm kiểm tra cho DATABASE_URL
    if (!databaseURL) {
        throw new Error('FIREBASE_DATABASE_URL is not set in .env');
    }

    // Resolve đường dẫn (hỗ trợ cả relative và absolute path)
    const resolvedPath = path.isAbsolute(serviceAccountPath) 
        ? serviceAccountPath 
        : path.resolve(__dirname, '..', serviceAccountPath);

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Firebase service account file not found at: ${resolvedPath}`);
    }

    // Đọc file service account
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));

    // Khởi tạo Firebase Admin SDK
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: databaseURL // SỬA ĐỔI: Thêm databaseURL
        });
    }

    // SỬA ĐỔI: Lấy Realtime Database instance
    db = admin.database();
    
    console.log('✅ Firebase Admin (Realtime Database) initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.error('Please ensure FIREBASE_SERVICE_ACCOUNT_PATH and FIREBASE_DATABASE_URL are correctly set in .env');
}

module.exports = { db, admin };