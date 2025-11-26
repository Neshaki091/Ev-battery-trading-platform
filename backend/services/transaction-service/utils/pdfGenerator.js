const PDFDocument = require('pdfkit');
const path = require('path');

/**
 * Sinh hợp đồng điện tử có hỗ trợ tiếng Việt (Unicode)
 */
const generate = (res, order) => {
   if (!order || !order.id) {
      return res.status(400).json({ success: false, error: 'Invalid order data' });
   }

   let doc;
   try {
      doc = new PDFDocument({
         margin: 50,
         size: 'A4',
         info: {
            Title: `Hợp đồng điện tử HD-${order.id}`,
            Author: 'EV Battery Trading Platform',
            Subject: 'Hợp đồng mua bán xe điện/pin',
            CreationDate: new Date(),
         },
      });

      const filename = `contract_${order.id}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      doc.pipe(res);

      // 🧩 Font Unicode (bạn cần có file DejaVuSans.ttf trong thư mục fonts)
      const fontPath = path.join(__dirname, '../fonts/DejaVuSans.ttf');
      const fontBoldPath = path.join(__dirname, '../fonts/DejaVuSans-Bold.ttf');

      doc.registerFont('Regular', fontPath);
      doc.registerFont('Bold', fontBoldPath);

      const fontName = 'Regular';
      const fontBold = 'Bold';

      // Vẽ nội dung
      drawHeader(doc, fontName, fontBold, order);
      drawContractInfo(doc, fontName, fontBold, order);
      drawPartiesInfo(doc, fontName, fontBold, order);
      drawTransactionDetails(doc, fontName, fontBold, order);
      drawTermsAndConditions(doc, fontName, fontBold, order);
      drawSignatures(doc, fontName, fontBold, order);
      drawFooter(doc, fontName, fontBold, order);

      doc.end();
      console.log(`PDF contract generated successfully for order: ${order.id}`);
   } catch (error) {
      console.error('PDF generation error:', error.message);
      if (doc) doc.end();
      res.status(500).json({ success: false, error: 'PDF generation failed: ' + error.message });
   }
};

/* ======= Các hàm con (giữ nguyên, chỉ sửa fontName/fontBold dùng cho Unicode) ======= */

function drawHeader(doc, fontName, fontBold, order) {
   doc.rect(50, 50, 495, 80).stroke();
   doc.font(fontBold).fontSize(18).fillColor('#1a73e8')
      .text('EV BATTERY TRADING PLATFORM', 60, 65, { width: 475, align: 'center' });

   doc.font(fontName).fontSize(10).fillColor('#666')
      .text('Nền tảng giao dịch xe điện và pin uy tín hàng đầu Việt Nam', 60, 90, { width: 475, align: 'center' });

   doc.fontSize(9)
      .text('Website: evbattery.vn | Hotline: 1900-xxxx | Email: support@evbattery.vn', 60, 105, { width: 475, align: 'center' });
}

function drawContractInfo(doc, fontName, fontBold, order) {
   const y = 150;
   doc.font(fontBold).fontSize(20).fillColor('#000')
      .text('HỢP ĐỒNG ĐIỆN TỬ MUA BÁN', 50, y, { width: 495, align: 'center' });
   doc.fontSize(16).fillColor('#d32f2f')
      .text(order.type === 'xe' ? 'XE ĐIỆN' : 'PIN XE ĐIỆN', 50, y + 25, { width: 495, align: 'center' });

   const boxY = y + 55;
   doc.rect(50, boxY, 495, 60).fillAndStroke('#f5f5f5', '#ccc');
   doc.fillColor('#000').fontSize(11).font(fontName);

   doc.text('Số hợp đồng:', 70, boxY + 15);
   doc.font(fontBold).fillColor('#d32f2f').text(`HD-${order.id}`, 180, boxY + 15);

   doc.font(fontName).fillColor('#000').text('Ngày lập hợp đồng:', 70, boxY + 35);
   doc.font(fontBold).text(new Date().toLocaleString('vi-VN'), 180, boxY + 35);
}

function drawPartiesInfo(doc, fontName, fontBold, order) {
   const y = doc.y + 20;

   // BÊN A
   doc.rect(50, y, 240, 100).stroke();
   doc.font(fontBold).fontSize(12).fillColor('#1a73e8').text('BÊN A - NGƯỜI MUA', 60, y + 10);

   const buyer = order.userId || {};
   const buyerFirstName = buyer.profile?.firstName || '';
   const buyerLastName = buyer.profile?.lastName || '';
   const buyerUsername = buyer.profile?.username || '';
   // Tạo tên đầy đủ: "Họ Tên (username)" hoặc chỉ "username" nếu không có họ tên
   const buyerFullName = (buyerFirstName || buyerLastName) 
      ? `${buyerFirstName} ${buyerLastName} (${buyerUsername})` 
      : buyerUsername || 'Người mua';
   const buyerEmail = buyer.profile?.email || buyer._id || 'N/A';
   const buyerPhone = buyer.profile?.phonenumber || 'N/A';

   doc.font(fontName).fontSize(10).fillColor('#000')
      .text(`Tên: ${buyerFullName}`, 60, y + 30)
      .text(`Email: ${buyerEmail}`, 60, y + 45)
      .text(`SĐT: ${buyerPhone}`, 60, y + 60)
      .text(`Trạng thái: ${order.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}`, 60, y + 75);

   // BÊN B
   doc.rect(305, y, 240, 100).stroke();
   doc.font(fontBold).fontSize(12).fillColor('#1a73e8').text('BÊN B - NGƯỜI BÁN', 315, y + 10);

   const seller = order.sellerId || {};
   const sellerFirstName = seller.profile?.firstName || '';
   const sellerLastName = seller.profile?.lastName || '';
   const sellerUsername = seller.profile?.username || '';
   // Tạo tên đầy đủ: "Họ Tên (username)" hoặc chỉ "username" nếu không có họ tên
   const sellerFullName = (sellerFirstName || sellerLastName) 
      ? `${sellerFirstName} ${sellerLastName} (${sellerUsername})` 
      : sellerUsername || 'Người bán';
   const sellerEmail = seller.profile?.email || seller._id || 'N/A';
   const sellerPhone = seller.profile?.phonenumber || 'N/A';
   const listing = order.listingId || {};
   const listingTitle = listing.title || 'Sản phẩm';

   doc.font(fontName).fontSize(10).fillColor('#000')
      .text(`Tên: ${sellerFullName}`, 315, y + 30)
      .text(`Email: ${sellerEmail}`, 315, y + 45)
      .text(`SĐT: ${sellerPhone}`, 315, y + 60)
      .text(`Sản phẩm: ${listingTitle}`, 315, y + 75);
}

function drawTransactionDetails(doc, fontName, fontBold, order) {
   const y = doc.y + 20;
   doc.font(fontBold).fontSize(13).fillColor('#000').text('NỘI DUNG GIAO DỊCH', 50, y);
   const tableY = y + 25;
   const rowHeight = 30;

   doc.rect(50, tableY, 495, rowHeight).fillAndStroke('#1a73e8', '#000');
   doc.font(fontBold).fillColor('#fff').fontSize(10)
      .text('Mô tả', 60, tableY + 10, { width: 235 })
      .text('Thông tin', 300, tableY + 10, { width: 235 });

   const rows = [
      ['Loại sản phẩm', order.type === 'xe' ? 'Xe điện' : 'Pin xe điện'],
      ['Giá trị giao dịch', `${order.price?.toLocaleString('vi-VN') || '0'} VND`],
      ['Phí hoa hồng (5%)', `${Math.round(order.price * 0.05).toLocaleString('vi-VN')} VND`],
      ['Ngày thanh toán', order.paidAt ? new Date(order.paidAt).toLocaleDateString('vi-VN') : 'Chưa thanh toán'],
      ['Phương thức thanh toán', 'Chuyển khoản qua nền tảng'],
   ];

   doc.font(fontName).fillColor('#000');
   rows.forEach((row, i) => {
      const rowY = tableY + rowHeight * (i + 1);
      const bg = i % 2 === 0 ? '#f9f9f9' : '#fff';
      doc.rect(50, rowY, 495, rowHeight).fillAndStroke(bg, '#ccc');
      doc.fillColor('#333').fontSize(10).text(row[0], 60, rowY + 10, { width: 225 });
      doc.font(fontBold).fillColor('#000').text(row[1], 300, rowY + 10, { width: 235 });
   });
   doc.y = tableY + rowHeight * (rows.length + 1) + 10;
}

function drawTermsAndConditions(doc, fontName, fontBold) {
   const y = doc.y + 10;
   doc.font(fontBold).fontSize(13).text('ĐIỀU KHOẢN VÀ ĐIỀU KIỆN HỢP ĐỒNG', 50, y);
   doc.moveDown(0.5);
   const terms = [
      { title: 'Điều 1: Thời hạn giao hàng', content: 'Bên B cam kết giao hàng trong vòng 7 ngày làm việc kể từ khi hợp đồng được ký và thanh toán thành công.' },
      { title: 'Điều 2: Bảo hành và chất lượng', content: 'Sản phẩm được bảo hành 6 tháng cho lỗi kỹ thuật. Bên A có quyền kiểm tra sản phẩm trước khi nhận.' },
      { title: 'Điều 3: Quyền và nghĩa vụ', content: 'Hai bên cam kết tuân thủ quy định của nền tảng và hỗ trợ nhau trong quá trình giao dịch.' },
      { title: 'Điều 4: Giải quyết tranh chấp', content: 'Mọi khiếu nại được gửi đến bộ phận Admin trong vòng 14 ngày kể từ khi nhận hàng.' },
      { title: 'Điều 5: Hiệu lực hợp đồng', content: 'Hợp đồng có hiệu lực từ thời điểm được ký điện tử và thanh toán thành công.' },
   ];
   terms.forEach(t => {
      doc.font(fontBold).fontSize(10).text(t.title, 50, doc.y + 5);
      doc.font(fontName).fontSize(9).text(t.content, 50, doc.y + 2, { width: 495, align: 'justify' });
   });
}

function drawSignatures(doc, fontName, fontBold, order) {
   const y = doc.y + 20;
   if (y > 650) doc.addPage();
   const sigY = doc.y;

   const buyer = order.userId || {};
   const buyerFirstName = buyer.profile?.firstName || '';
   const buyerLastName = buyer.profile?.lastName || '';
   const buyerUsername = buyer.profile?.username || '';
   const buyerFullName =
      (buyerFirstName || buyerLastName)
         ? `${buyerFirstName} ${buyerLastName} (${buyerUsername})`
         : buyerUsername || 'Người mua';

   const seller = order.sellerId || {};
   const sellerFirstName = seller.profile?.firstName || '';
   const sellerLastName = seller.profile?.lastName || '';
   const sellerUsername = seller.profile?.username || '';
   const sellerFullName =
      (sellerFirstName || sellerLastName)
         ? `${sellerFirstName} ${sellerLastName} (${sellerUsername})`
         : sellerUsername || 'Người bán';

   // BÊN A
   doc.rect(50, sigY, 240, 100).stroke();
   doc
      .font(fontBold)
      .fontSize(11)
      .text('BÊN A - NGƯỜI MUA', 60, sigY + 10, { width: 220, align: 'center' });
   doc
      .font(fontName)
      .fontSize(9)
      .fillColor('#666')
      .text('Chữ ký (họ tên đầy đủ)', 60, sigY + 30, { width: 220, align: 'center' });
   doc
      .font(fontBold)
      .fontSize(12)
      .fillColor('#1a73e8')
      .text(buyerFullName, 60, sigY + 50, { width: 220, align: 'center' });

   // BÊN B
   doc.rect(305, sigY, 240, 100).stroke();
   doc
      .font(fontBold)
      .fontSize(11)
      .fillColor('#000')
      .text('BÊN B - NGƯỜI BÁN', 315, sigY + 10, { width: 220, align: 'center' });
   doc
      .font(fontName)
      .fontSize(9)
      .fillColor('#666')
      .text('Chữ ký (họ tên đầy đủ)', 315, sigY + 30, { width: 220, align: 'center' });
   doc
      .font(fontBold)
      .fontSize(12)
      .fillColor('#1a73e8')
      .text(sellerFullName, 315, sigY + 50, { width: 220, align: 'center' });
}

function drawFooter(doc, fontName) {
   const footerY = doc.page.height - 80;
   doc.font(fontName).fontSize(8).fillColor('#999')
      .text('HỢP ĐỒNG ĐIỆN TỬ - EV BATTERY TRADING PLATFORM', 50, footerY - 20, { width: 495, align: 'center' });
   doc.rect(50, footerY, 495, 60).fillAndStroke('#f0f0f0', '#ccc');
   doc.fillColor('#666').fontSize(8)
      .text('Hợp đồng được tạo và lưu trữ điện tử trên nền tảng EV Battery Trading Platform', 60, footerY + 10, { width: 475, align: 'center' });
}

module.exports = { generate };
