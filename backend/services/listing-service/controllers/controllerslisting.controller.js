const Listing = require("../models/modelslisting.model"); // Sửa lại đường dẫn nếu cần
const { sendMessage, publishEvent } = require('../util/mqService');
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // <<== BỔ SUNG

// === BỔ SUNG: Khởi tạo Gemini AI ===
// Đảm bảo bạn đã cài: npm install @google/generative-ai
// và có file .env với GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- PHẦN ADMIN ---

// Lấy tất cả danh sách (chỉ Admin)
exports.getAllListings = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
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

// Duyệt tin đăng (chỉ Admin)
exports.approveListing = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { status: 'Active' },
            { new: true }
        );

        if (!updatedListing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Gửi tin nhắn "created" để Search-Service index tin này
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

// Gắn nhãn "Đã kiểm định" (Chỉ Admin)
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
            { isVerified: isVerified },
            { new: true }
        );

        if (!updatedListing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Gửi tin nhắn cập nhật
        const message = {
            event: 'listing_updated',
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


// --- PHẦN CÔNG KHAI (PUBLIC) ---

// Lấy tất cả danh sách công khai (Chỉ tin 'Active')
exports.getPublicListings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { status: { $in: ['Active', 'Sold'] } };

        const totalListings = await Listing.countDocuments(filter);
        const listings = await Listing.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        console.log("Fetched public listings:", listings.length);
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

        // === KIỂM TRA QUYỀN TRUY CẬP ===
        const internalApiKey = req.headers['x-internal-key'];
        const token = req.headers.authorization;

        // 1. Cho phép Service nội bộ (như TransactionService)
        if (internalApiKey && internalApiKey === process.env.INTERNAL_API_KEY) {
            return res.json(listing);
        }

        // 2. Nếu listing 'Active', cho phép tất cả (cả khách)
        if (listing.status === 'Active' || listing.status === 'Sold') {
            return res.json(listing);
        }

        // 3. Nếu listing KHÔNG 'Active' (Pending, Sold, Hidden)
        // Phải kiểm tra user
        if (!req.user) {
            return res.status(401).json({ message: 'You must be logged in to view this listing.' });
        }

        // 4. Cho phép Admin
        if (req.user.role === 'admin') {
            return res.json(listing);
        }

        // 5. Cho phép Người bán (Seller)
        if (listing.user_id.toString() === req.user._id) {
            return res.json(listing);
        }

        // 6. ⭐️ KIỂM TRA MỚI: Cho phép Người mua (Buyer)
        if (listing.status === 'Sold') {
            try {
                // Gọi nội bộ TransactionService để kiểm tra
                const transServiceUrl = process.env.TRANSACTION_SERVICE_URL || 'http://backend-transaction-service-1:4000';

                // Cần 1 route mới bên TransactionService: GET /transactions/check-buyer/:listingId
                // (Route này sẽ kiểm tra xem req.user.id có phải là buyer của listing này không)
                const checkRes = await axios.get(
                    `${transServiceUrl}/check-buyer/${listing._id}`,
                    // Gửi token của user VÀ internal key để TransactionService tin tưởng
                    {
                        headers: {
                            Authorization: token,
                            'x-internal-key': process.env.INTERNAL_API_KEY
                        }
                    }
                );

                if (checkRes.data.isBuyer) {
                    return res.json(listing);
                }
            } catch (err) {
                console.error("Error checking buyer status:", err.message);
                // Bỏ qua lỗi và để nó rơi xuống 403
            }
        }

        // 7. Nếu không phải các trường hợp trên -> Từ chối
        return res.status(403).json({ message: 'Access denied. Listing is not active or you do not have permission.' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// --- CRUD NGƯỜI DÙNG ---

// Lấy tin đăng của chính người đó
exports.getListingsByOwner = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { user_id: userId };

        if (req.query.status) {
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

// Tạo tin đăng mới
exports.createListing = async (req, res) => {
    try {
        const userIdFromToken = req.user._id;
        const body = req.body;

        if (body.category === 'Vehicle' && !body.vehicle_id) {
            body.vehicle_id = new mongoose.Types.ObjectId();
        }
        if (body.category === 'Battery' && !body.battery_id) {
            body.battery_id = new mongoose.Types.ObjectId();
        }

        const listing = new Listing({
            ...body, // body từ frontend đã chứa (title, description, vehicle_brand...)
            user_id: userIdFromToken,
            status: 'Pending' // Mặc định trạng thái chờ duyệt
        });
        const savedListing = await listing.save();

        // Publish event to RabbitMQ for analytics service
        try {
            await publishEvent('listing_created', {
                listingId: savedListing._id,
                authorId: savedListing.user_id,
                price: savedListing.price
            });
        } catch (error) {
            console.error('Error publishing listing_created event:', error.message);
        }

        // (Đã tắt) Chỉ gửi message đến Search Service KHI ADMIN DUYỆT

        res.status(201).json({
            message: "Listing created successfully, waiting for approval",
            data: savedListing,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Sửa tin đăng theo ID
exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const userIdFromToken = req.user._id;
        const userRoleFromToken = req.user.role;

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        if (listing.user_id.toString() !== userIdFromToken && userRoleFromToken !== 'admin') {
            return res.status(403).json({ message: "Access denied. You are not the owner or admin." });
        }

        const updateData = req.body;
        delete updateData.user_id;

        // Ngăn user thường tự ý đổi status và nhãn verified
        if (userRoleFromToken !== 'admin') {
            delete updateData.status;
            delete updateData.isVerified;
        }

        // Nếu user thường sửa tin đã Active, chuyển lại về Pending để Admin duyệt lại
        if (userRoleFromToken !== 'admin' && listing.status === 'Active' && Object.keys(updateData).length > 0) {
            updateData.status = 'Pending';

            const pendingListing = await Listing.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            });

            // Báo cho Search Service biết tin này không còn Active nữa
            const message = {
                event: 'listing_updated',
                data: pendingListing
            };
            await sendMessage(message);

            return res.status(200).json({ message: "Listing updated successfully. It has been set to 'Pending' for re-approval.", data: pendingListing });
        }


        const updatedListing = await Listing.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        // Gửi tin nhắn "updated" đến RabbitMQ (chủ yếu dành cho Admin sửa)
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

// Xóa tin đăng
exports.deleteListing = async (req, res) => {
    try {
        const { id } = req.params;
        const userIdFromToken = req.user._id;
        const userRoleFromToken = req.user.role;

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        if (listing.user_id.toString() !== userIdFromToken && userRoleFromToken !== 'admin') {
            return res.status(403).json({ message: "Access denied. You are not the owner or admin." });
        }

        // Gửi tin nhắn "deleted" đến RabbitMQ TRƯỚC KHI XÓA
        const message = {
            event: 'listing_deleted',
            id: id // Chỉ cần gửi ID
        };
        await sendMessage(message);

        await Listing.findByIdAndDelete(id);
        res.json({ message: "Listing deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Cập nhật status (Endpoint nội bộ/Admin)
exports.updateListingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;


        if (!status || !['Active', 'Pending', 'Sold', 'Hidden'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!updatedListing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Gửi tin nhắn cập nhật cho Search Service
        const message = {
            event: 'listing_updated',
            data: updatedListing
        };
        await sendMessage(message);

        res.status(200).json({
            message: `Listing status updated to ${status}`,
            data: updatedListing,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


// === BỔ SUNG: CHỨC NĂNG AI GỢI Ý GIÁ ===
exports.suggestPrice = async (req, res) => {
    try {
        // 1. Lấy dữ liệu từ frontend
        const {
            title,
            description,
            category,
            condition,
            vehicle_brand,
            vehicle_model,
            vehicle_manufacturing_year,
            vehicle_mileage_km,
            battery_capacity_kwh,
            battery_condition_percentage
        } = req.body;

        // 2. Chọn mô hình
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 3. Tạo Prompt
        const prompt = `
      Bạn là một chuyên gia định giá xe điện và pin xe điện cũ tại thị trường Việt Nam.
      Hãy phân tích thông tin sản phẩm sau đây:
      - Tiêu đề: ${title}
      - Danh mục: ${category}
      - Tình trạng: ${condition}
      - Mô tả: ${description}
      ${category === 'Vehicle' ? `
      - Hãng xe: ${vehicle_brand || 'Không rõ'}
      - Mẫu xe: ${vehicle_model || 'Không rõ'}
      - Năm sản xuất: ${vehicle_manufacturing_year || 'Không rõ'}
      - Số KM đã đi: ${vehicle_mileage_km || 'Không rõ'}
      ` : ''}
      ${category === 'Battery' ? `
      - Dung lượng pin: ${battery_capacity_kwh || 'Không rõ'} kWh
      - Tình trạng pin: ${battery_condition_percentage || 'Không rõ'} %
      ` : ''}

      Dựa trên tất cả thông tin này, hãy đề xuất một mức giá bán hợp lý (đơn vị VND).
      
      YÊU CẦU QUAN TRỌNG: Chỉ trả lời bằng MỘT CON SỐ duy nhất, không thêm chữ "VND", không dấu phẩy, không giải thích.
      Ví dụ: 850000000
    `;

        // 4. Gọi API của Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 5. Lọc và chuyển đổi kết quả
        const suggestedPrice = parseInt(text.replace(/[^0-9]/g, ''));

        if (!suggestedPrice || isNaN(suggestedPrice)) {
            console.error("Gemini trả về không phải số:", text);
            return res.status(500).json({ message: "AI không thể tính toán giá. Vui lòng tự nhập." });
        }

        // 6. Trả về giá cho frontend
        res.status(200).json({
            message: "Gợi ý giá thành công",
            suggestedPrice: suggestedPrice
        });

    } catch (error) {
        console.error("Lỗi khi gọi Gemini API:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi kết nối với AI gợi ý" });
    }
};