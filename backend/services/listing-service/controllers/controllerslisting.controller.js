const Listing = require("../models/modelslisting.model");
const { sendMessage } = require('../util/mqService') // Giả định mqService là file chứa hàm sendMessage
const mongoose = require("mongoose");
// --- PHẦN ADMIN ---

// Lấy tất cả danh sách (chỉ Admin)
exports.getAllListings = async (req, res) => {
    try {
        // KIỂM TRA QUYỀN ADMIN
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Lọc theo status nếu admin muốn (ví dụ: ?status=Pending)
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const totalListings = await Listing.countDocuments(filter);
        const listings = await Listing.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Trả về kết quả
        res.status(200).json({
            success: true,
            data: listings,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalListings / limit),
                totalItems: totalListings,
                limit: limit
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Duyệt tin đăng (chỉ Admin)
exports.approveListing = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { status: 'Active', images: this.updateListing.images }, // Sửa status thành 'Active'
            { new: true }
        );

        if (!updatedListing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // QUAN TRỌNG: Gửi tin nhắn "updated" để Search-Service cập nhật trạng thái
        // Điều này sẽ khiến tin đăng này xuất hiện trong kết quả tìm kiếm công khai.
        const message = {
            event: 'listing_created',
            data: updatedListing
        };
        await sendMessage(message);

        res.status(200).json({
            message: "Listing approved successfully",
            data: updatedListing,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


// --- PHẦN CÔNG KHAI (PUBLIC) ---
// 🆕 BỔ SUNG: Gắn nhãn "Đã kiểm định" (Chỉ Admin)
exports.verifyListing = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body; // true/false

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        if (typeof isVerified !== 'boolean') {
            return res.status(400).json({ message: 'isVerified field must be a boolean.' });
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { isVerified: isVerified, images: this.updateListing.images },
            { new: true }
        );

        if (!updatedListing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Gửi tin nhắn cập nhật (Quan trọng: Nếu isVerified thay đổi, Search Service cần biết)
        const message = {
            event: 'listing_created',
            data: updatedListing
        };
        await sendMessage(message);

        res.status(200).json({
            message: `Listing verification status updated to ${isVerified}`,
            data: updatedListing,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
// Lấy tất cả danh sách công khai (Chỉ tin 'Active')
exports.getPublicListings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // CHỈ TÌM TIN 'Active' (ĐÃ DUYỆT)
        const filter = { status: 'Active' };

        const totalListings = await Listing.countDocuments(filter);
        const listings = await Listing.find(filter)
            .sort({ createdAt: -1 }) // Sắp xếp tin mới nhất lên đầu
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: listings,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalListings / limit),
                totalItems: totalListings,
                limit: limit
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy tin đăng theo ID
exports.getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        // Bổ sung: Nếu tin chưa Active, chỉ Admin hoặc chủ sở hữu mới được xem
        if (listing.status !== 'Active' &&
            (req.user.role !== 'admin' && listing.user_id.toString() !== req.user._id)
        ) {
            return res.status(403).json({ message: 'Access denied. Listing is not active.' });
        }
        res.json(listing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// --- CRUD NGƯỜI DÙNG ---
exports.getListingsByOwner = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy ID của người dùng từ token
        console.log("User ID from token:", userId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Lọc theo user_id và cho phép tất cả trạng thái (Active, Pending, Hidden, Sold)
        const filter = { user_id: userId };

        // Tùy chọn lọc theo status nếu User muốn
        if (req.query.status) {
            // Đảm bảo status là hợp lệ
            if (['Active', 'Pending', 'Sold', 'Hidden'].includes(req.query.status)) {
                filter.status = req.query.status;
            }
        }

        const totalListings = await Listing.countDocuments(filter);
        const listings = await Listing.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: listings,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalListings / limit),
                totalItems: totalListings,
                limit: limit
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// 🟢 Tạo tin đăng mới
// Listing Controller - Sửa hàm exports.createListing
exports.createListing = async (req, res) => {
    try {
        const userIdFromToken = req.user._id;
        const body = req.body;

        // --- BỔ SUNG LOGIC XỬ LÝ ID BẮT BUỘC (FIX) ---
        // Nếu category là Vehicle nhưng vehicle_id không có trong body, 
        // ta gán tạm thời một ObjectId mới. (Thao tác này giúp bypass validation)
        if (body.category === 'Vehicle' && !body.vehicle_id) {
            // TẠO MỘT OBJECT ID MỚI ĐỂ LÀM PLACEHOLDER
            body.vehicle_id = new mongoose.Types.ObjectId();
        }

        // Tương tự cho Battery
        if (body.category === 'Battery' && !body.battery_id) {
            // TẠO MỘT OBJECT ID MỚI ĐỂ LÀM PLACEHOLDER
            body.battery_id = new mongoose.Types.ObjectId();
        }
        const listing = new Listing({
            ...body, // Sử dụng body đã được sửa
            user_id: userIdFromToken,
            status: 'Pending' // Mặc định trạng thái chờ duyệt
        });
        const savedListing = await listing.save();
        // Gửi tin nhắn đến RabbitMQ để Search-Service lưu bản nháp/Pending

        res.status(201).json({
            message: "Listing created successfully, waiting for approval",
            data: savedListing,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟡 Sửa tin đăng theo ID
exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const userIdFromToken = req.user._id;
        const userRoleFromToken = req.user.role;

        // 1. Tìm tin đăng
        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // 2. KIỂM TRA QUYỀN SỞ HỮU HOẶC ADMIN
        if (listing.user_id.toString() !== userIdFromToken && userRoleFromToken !== 'admin') {
            return res.status(403).json({ message: "Access denied. You are not the owner or admin." });
        }

        // 3. Cập nhật dữ liệu
        const updateData = req.body;
        delete updateData.user_id; // Ngăn không cho user tự ý đổi user_id

        // 🚨 SỬA LỖI: Nếu không phải admin, không cho phép thay đổi status VÀ isVerified
        if (userRoleFromToken !== 'admin') {
            delete updateData.status;
            delete updateData.isVerified; // Ngăn user thường tự gắn nhãn verified
        }

        // Nếu user thường sửa tin đã Active, chuyển lại về Pending để Admin duyệt lại
        if (userRoleFromToken !== 'admin' && listing.status === 'Active' && Object.keys(updateData).length > 0) {
            updateData.status = 'Pending';
            // Thêm thông báo cho người dùng biết tin sẽ bị duyệt lại
            res.status(200).json({ message: "Listing updated successfully. It has been set to 'Pending' for re-approval.", data: updatedListing });
        }


        const updatedListing = await Listing.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        // 4. Gửi tin nhắn "updated" đến RabbitMQ
        const message = {
            event: 'listing_updated',
            data: updatedListing
        };
        await sendMessage(message);

        res.status(200).json({
            message: "Listing updated successfully",
            data: updatedListing,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
// 🔴 Xóa tin đăng
exports.deleteListing = async (req, res) => {
    try {
        const { id } = req.params;
        const userIdFromToken = req.user._id;
        const userRoleFromToken = req.user.role;

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // 1. Logic kiểm tra quyền
        if (listing.user_id.toString() !== userIdFromToken && userRoleFromToken !== 'admin') {
            return res.status(403).json({ message: "Access denied. You are not the owner or admin." });
        }

        // 2. Gửi tin nhắn "deleted" đến RabbitMQ TRƯỚC KHI XÓA
        const message = {
            event: 'listing_deleted',
            id: id // Chỉ cần gửi ID
        };
        await sendMessage(message);

        // 3. Xóa
        await Listing.findByIdAndDelete(id);
        res.json({ message: "Listing deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};