const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generate = (res, order) => {
  if (!order || !order.id) {
    return res.status(400).json({ success: false, error: 'Invalid order data' });
  }

  let doc;
  try {
    doc = new PDFDocument({ margin: 50 });
    const filename = `contract_${order.id}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    res.on('error', (err) => console.error('Response stream error:', err));
    
    doc.pipe(res);
    

    const rootDir = process.cwd();  // Root project
    const fontPath = path.join(rootDir, 'fonts', 'DejaVuSans.ttf');
    
    console.log(`Debug font path: ${fontPath}`);  // Log để check
    
    let fontName = 'Helvetica';  // Fallback
    if (fs.existsSync(fontPath)) {
      try {
        doc.registerFont('VietnameseFont', fontPath);
        fontName = 'VietnameseFont';
        console.log('Font DejaVuSans registered successfully');
      } catch (regErr) {
        console.error('Register font error:', regErr.message);
      }
    } else {
      console.warn(`Font file not found at ${fontPath}. Using Helvetica.`);
    }

    doc.font(fontName).fontSize(25).text('HỢP ĐỒNG MUA BÁN XE ĐIỆN / PIN CŨ', 100, 100);
    doc.moveDown();
    doc.font(fontName).fontSize(12).text(`Số hợp đồng: HD-${order.id}`);
    doc.font(fontName).text(`Ngày lập: ${new Date().toLocaleDateString('vi-VN')}`);
    doc.moveDown(2);
    doc.font(fontName).text('BÊN MUA:');
    doc.font(fontName).text(`- ID Thành viên: ${order.userId || 'Unknown'}`);
    doc.moveDown();
    doc.font(fontName).text('BÊN BÁN: (Thông tin từ tin đăng ID: ' + (order.itemId || order.listingId || 'Unknown') + ')');
    doc.moveDown();
    doc.font(fontName).text('NỘI DUNG GIAO DỊCH:');
    doc.font(fontName).text(`- Loại sản phẩm: ${order.type ? order.type.toUpperCase() : 'Unknown'}`);
    doc.font(fontName).text(`- Giá trị giao dịch: ${order.price ? order.price.toLocaleString('vi-VN') : 0} VND`);
    doc.font(fontName).text(`- Ngày thanh toán: ${order.paidAt ? new Date(order.paidAt).toLocaleDateString('vi-VN') : 'Chưa thanh toán'}`);
    doc.moveDown(2);
    
    doc.font(fontName).text('ĐIỀU KHOẢN HỢP ĐỒNG:');
    doc.font(fontName).text('1. Thời hạn giao hàng: Trong vòng 7 ngày kể từ ngày ký hợp đồng.');
    doc.font(fontName).text('2. Bảo hành: Pin/xe được bảo hành 6 tháng, kiểm tra tình trạng pin trước khi giao.');
    doc.font(fontName).text('3. Hỗ trợ sau bán: Người mua có quyền đánh giá và phản hồi trên nền tảng.');
    doc.font(fontName).text('4. Khiếu nại: Xử lý qua Admin trong 14 ngày, phí hoa hồng 5% từ giao dịch.');
    doc.moveDown(2);
    
    doc.font(fontName).text('Các bên cam kết thực hiện đúng hợp đồng. Nền tảng chỉ hỗ trợ ký số hóa.');
    doc.font(fontName).text('Chữ ký điện tử: [Tự động ký qua hệ thống]');
    
    doc.end();
    
    console.log(`PDF generated for order: ${order.id} (using ${fontName})`);
  } catch (error) {
    console.error('PDF generation error:', error.message);
    if (doc) doc.end();
    res.status(500).json({ success: false, error: 'PDF generation failed: ' + error.message });
  }
};

module.exports = { generate };