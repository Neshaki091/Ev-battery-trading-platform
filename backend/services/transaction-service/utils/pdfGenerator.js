const PDFDocument = require('pdfkit');

/**
 * Tạo hợp đồng điện tử chuyên nghiệp cho giao dịch mua bán xe điện/pin
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
        CreationDate: new Date()
      }
    });
    
    const filename = `contract_${order.id}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.on('error', (err) => console.error('Response stream error:', err));
    
    doc.pipe(res);

    // Font mặc định của PDFKit
    const fontName = 'Helvetica';
    const fontBold = 'Helvetica-Bold';

    // ===================== HEADER =====================
    drawHeader(doc, fontName, fontBold, order);
    
    // ===================== THÔNG TIN HỢP ĐỒNG =====================
    drawContractInfo(doc, fontName, fontBold, order);
    
    // ===================== THÔNG TIN CÁC BÊN =====================
    drawPartiesInfo(doc, fontName, fontBold, order);
    
    // ===================== NỘI DUNG GIAO DỊCH =====================
    drawTransactionDetails(doc, fontName, fontBold, order);
    
    // ===================== ĐIỀU KHOẢN HỢP ĐỒNG =====================
    drawTermsAndConditions(doc, fontName, fontBold, order);
    
    // ===================== CHỮ KÝ ĐIỆN TỬ =====================
    drawSignatures(doc, fontName, fontBold, order);
    
    // ===================== FOOTER =====================
    drawFooter(doc, fontName, fontBold, order);
    
    doc.end();
    
    console.log(`Professional PDF contract generated for order: ${order.id} (using ${fontName})`);
  } catch (error) {
    console.error('PDF generation error:', error.message);
    if (doc) doc.end();
    res.status(500).json({ success: false, error: 'PDF generation failed: ' + error.message });
  }
};

/**
 * Vẽ header của hợp đồng
 */
function drawHeader(doc, fontName, fontBold, order) {
  // Border trên cùng
  doc.rect(50, 50, 495, 80).stroke();
  
  // Logo và tên công ty
  doc.font(fontBold)
     .fontSize(18)
     .fillColor('#1a73e8')
     .text('EV BATTERY TRADING PLATFORM', 60, 65, { width: 475, align: 'center' });
  
  doc.font(fontName)
     .fontSize(10)
     .fillColor('#666666')
     .text('Nen tang giao dich xe dien va pin uy tin hang dau Viet Nam', 60, 90, { width: 475, align: 'center' });
  
  doc.fontSize(9)
     .text('Website: evbattery.vn | Hotline: 1900-xxxx | Email: support@evbattery.vn', 60, 105, { width: 475, align: 'center' });
  
  doc.moveDown(3);
}

/**
 * Vẽ thông tin hợp đồng
 */
function drawContractInfo(doc, fontName, fontBold, order) {
  const y = 150;
  
  // Tiêu đề hợp đồng
  doc.font(fontBold)
     .fontSize(20)
     .fillColor('#000000')
     .text('HOP DONG DIEN TU MUA BAN', 50, y, { width: 495, align: 'center' });
  
  doc.fontSize(16)
     .fillColor('#d32f2f')
     .text(order.type === 'xe' ? 'XE DIEN' : 'PIN XE DIEN', 50, y + 25, { width: 495, align: 'center' });
  
  // Box thông tin hợp đồng
  const boxY = y + 55;
  doc.rect(50, boxY, 495, 60)
     .fillAndStroke('#f5f5f5', '#cccccc');
  
  doc.fillColor('#000000')
     .fontSize(11)
     .font(fontName);
  
  doc.text(`So hop dong:`, 70, boxY + 15);
  doc.font(fontBold)
     .fillColor('#d32f2f')
     .text(`HD-${order.id}`, 180, boxY + 15);
  
  doc.font(fontName)
     .fillColor('#000000')
     .text(`Ngay lap hop dong:`, 70, boxY + 35);
  doc.font(fontBold)
     .text(new Date().toLocaleDateString('vi-VN', { 
       year: 'numeric', 
       month: 'long', 
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit'
     }), 180, boxY + 35);
  
  doc.moveDown(5);
}

/**
 * Vẽ thông tin các bên tham gia
 */
function drawPartiesInfo(doc, fontName, fontBold, order) {
  const y = doc.y + 10;
  
  // Bên A - Người mua
  doc.rect(50, y, 240, 100).stroke();
  doc.font(fontBold)
     .fontSize(12)
     .fillColor('#1a73e8')
     .text('BEN A - NGUOI MUA', 60, y + 10);
  
  doc.font(fontName)
     .fontSize(10)
     .fillColor('#000000')
     .text(`Ma thanh vien: ${order.userId || 'N/A'}`, 60, y + 30)
     .text(`Vai tro: Nguoi mua hang`, 60, y + 45)
     .text(`Trang thai: ${order.status === 'paid' ? 'Da thanh toan' : 'Chua thanh toan'}`, 60, y + 60)
     .text(`Quyen loi: Duoc bao hanh, ho tro`, 60, y + 75);
  
  // Bên B - Người bán
  doc.rect(305, y, 240, 100).stroke();
  doc.font(fontBold)
     .fontSize(12)
     .fillColor('#1a73e8')
     .text('BEN B - NGUOI BAN', 315, y + 10);
  
  doc.font(fontName)
     .fontSize(10)
     .fillColor('#000000')
     .text(`Tin dang: ${order.listingId || order.itemId || 'N/A'}`, 315, y + 30)
     .text(`Ma nguoi ban: ${order.sellerId || 'N/A'}`, 315, y + 45)
     .text(`Vai tro: Nguoi cung cap hang`, 315, y + 60)
     .text(`Nghia vu: Giao hang, bao hanh`, 315, y + 75);
  
  doc.moveDown(8);
}

/**
 * Vẽ chi tiết giao dịch
 */
function drawTransactionDetails(doc, fontName, fontBold, order) {
  const y = doc.y + 10;
  
  doc.font(fontBold)
     .fontSize(13)
     .fillColor('#000000')
     .text('NOI DUNG GIAO DICH', 50, y);
  
  // Bảng thông tin giao dịch
  const tableY = y + 25;
  const rowHeight = 30;
  
  // Header bảng
  doc.rect(50, tableY, 495, rowHeight).fillAndStroke('#1a73e8', '#000000');
  doc.font(fontBold)
     .fillColor('#ffffff')
     .fontSize(10)
     .text('Mo ta', 60, tableY + 10, { width: 235 })
     .text('Thong tin', 300, tableY + 10, { width: 235 });
  
  // Các dòng dữ liệu
  const rows = [
    ['Loai san pham', order.type === 'xe' ? 'XE DIEN' : 'PIN XE DIEN'],
    ['Gia tri giao dich', `${order.price ? order.price.toLocaleString('vi-VN') : '0'} VND`],
    ['Phi hoa hong (5%)', `${order.price ? Math.round(order.price * 0.05).toLocaleString('vi-VN') : '0'} VND`],
    ['Ngay thanh toan', order.paidAt ? new Date(order.paidAt).toLocaleDateString('vi-VN') : 'Chua thanh toan'],
    ['Phuong thuc thanh toan', 'Chuyen khoan qua nen tang'],
  ];
  
  doc.fillColor('#000000').font(fontName);
  rows.forEach((row, i) => {
    const rowY = tableY + rowHeight * (i + 1);
    const bgColor = i % 2 === 0 ? '#f9f9f9' : '#ffffff';
    doc.rect(50, rowY, 495, rowHeight).fillAndStroke(bgColor, '#cccccc');
    
    doc.fillColor('#333333')
       .fontSize(10)
       .text(row[0], 60, rowY + 10, { width: 225 });
    
    doc.font(fontBold)
       .fillColor('#000000')
       .text(row[1], 300, rowY + 10, { width: 235 });
    
    doc.font(fontName);
  });
  
  doc.y = tableY + rowHeight * (rows.length + 1) + 10;
}

/**
 * Vẽ điều khoản hợp đồng
 */
function drawTermsAndConditions(doc, fontName, fontBold, order) {
  const y = doc.y + 10;
  
  doc.font(fontBold)
     .fontSize(13)
     .fillColor('#000000')
     .text('DIEU KHOAN VA DIEU KIEN HOP DONG', 50, y);
  
  doc.moveDown(0.5);
  
  const terms = [
    {
      title: 'Dieu 1: Thoi han giao hang',
      content: 'Ben B cam ket giao hang trong vong 7 ngay lam viec ke tu ngay hop dong duoc ky ket va thanh toan. Dia diem giao hang theo thoa thuan giua hai ben.'
    },
    {
      title: 'Dieu 2: Bao hanh va chat luong',
      content: 'San pham duoc bao hanh 6 thang doi voi loi ky thuat. Ben B cam ket san pham dung mo ta, da kiem tra chat luong truoc khi giao. Ben A co quyen kiem tra tinh trang pin/xe truoc khi nhan.'
    },
    {
      title: 'Dieu 3: Quyen va nghia vu',
      content: 'Ben A co quyen danh gia, phan hoi tren nen tang. Ben B co nghia vu ho tro ky thuat sau ban hang. Hai ben cam ket tuan thu quy dinh cua nen tang.'
    },
    {
      title: 'Dieu 4: Giai quyet tranh chap',
      content: 'Moi khieu nai phai gui den bo phan Admin trong vong 14 ngay ke tu ngay nhan hang. Nen tang se lam trung gian hoa giai. Phi hoa hong 5% tu gia tri giao dich de duy tri dich vu.'
    },
    {
      title: 'Dieu 5: Hieu luc hop dong',
      content: 'Hop dong co hieu luc ke tu thoi diem duoc ky dien tu boi ca hai ben va thanh toan thanh cong. Hop dong duoc luu tru dien tu tren he thong blockchain cua nen tang.'
    }
  ];
  
  doc.font(fontName).fontSize(9).fillColor('#000000');
  
  terms.forEach((term, i) => {
    doc.font(fontBold)
       .fontSize(10)
       .text(term.title, 50, doc.y + 5, { width: 495 });
    
    doc.font(fontName)
       .fontSize(9)
       .text(term.content, 50, doc.y + 2, { width: 495, align: 'justify' });
    
    doc.moveDown(0.8);
  });
}

/**
 * Vẽ phần chữ ký điện tử
 */
function drawSignatures(doc, fontName, fontBold, order) {
  const y = doc.y + 15;
  
  // Kiểm tra nếu cần sang trang mới
  if (y > 650) {
    doc.addPage();
    doc.y = 50;
  }
  
  const sigY = doc.y;
  
  // Chữ ký bên A
  doc.rect(50, sigY, 240, 100).stroke();
  doc.font(fontBold)
     .fontSize(11)
     .fillColor('#000000')
     .text('BEN A - NGUOI MUA', 60, sigY + 10, { width: 220, align: 'center' });
  
  doc.font(fontName)
     .fontSize(9)
     .fillColor('#666666')
     .text('Chu ky dien tu', 60, sigY + 30, { width: 220, align: 'center' });
  
  doc.fontSize(16)
     .fillColor('#1a73e8')
     .text('[SIGNED]', 60, sigY + 50, { width: 220, align: 'center' });
  
  doc.fontSize(8)
     .fillColor('#999999')
     .text(`Signed: ${new Date().toISOString()}`, 60, sigY + 75, { width: 220, align: 'center' });
  
  // Chữ ký bên B
  doc.rect(305, sigY, 240, 100).stroke();
  doc.font(fontBold)
     .fontSize(11)
     .fillColor('#000000')
     .text('BEN B - NGUOI BAN', 315, sigY + 10, { width: 220, align: 'center' });
  
  doc.font(fontName)
     .fontSize(9)
     .fillColor('#666666')
     .text('Chu ky dien tu', 315, sigY + 30, { width: 220, align: 'center' });
  
  doc.fontSize(16)
     .fillColor('#1a73e8')
     .text('[SIGNED]', 315, sigY + 50, { width: 220, align: 'center' });
  
  doc.fontSize(8)
     .fillColor('#999999')
     .text(`Signed: ${new Date().toISOString()}`, 315, sigY + 75, { width: 220, align: 'center' });
  
  doc.y = sigY + 110;
}

/**
 * Vẽ footer với mã xác thực
 */
function drawFooter(doc, fontName, fontBold, order) {
  const pageHeight = doc.page.height;
  const footerY = pageHeight - 80;
  
  // Watermark
  doc.font(fontName)
     .fontSize(8)
     .fillColor('#e0e0e0')
     .text('HOP DONG DIEN TU - EV BATTERY TRADING PLATFORM', 50, footerY - 20, { 
       width: 495, 
       align: 'center' 
     });
  
  // Border footer
  doc.rect(50, footerY, 495, 60).fillAndStroke('#f0f0f0', '#cccccc');
  
  doc.fillColor('#666666')
     .fontSize(8)
     .font(fontName)
     .text('Hop dong nay duoc tao va luu tru dien tu tren nen tang EV Battery Trading Platform', 60, footerY + 10, { width: 475, align: 'center' });
  
  // Mã hash giả lập (blockchain)
  const contractHash = `SHA256:${Buffer.from(order.id.toString()).toString('base64').substring(0, 32)}...`;
  doc.fontSize(7)
     .fillColor('#999999')
     .text(`Ma xac thuc blockchain: ${contractHash}`, 60, footerY + 25, { width: 475, align: 'center' });
  
  doc.text(`Thoi gian tao: ${new Date().toISOString()}`, 60, footerY + 38, { width: 475, align: 'center' });
}

module.exports = { generate };