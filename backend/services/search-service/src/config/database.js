const mongoose = require('mongoose'); // <-- SỬA;
const connectDatabase = async () => {
  try{
    await mongoose.connect(
        process.env.MONGODB_URI,
    );
    console.log("LIÊN KẾT CSDL THÀNH CÔNG");
  }catch(error){
    console.error('LỖI KẾT NỐI CSDL:', error);
    process.exit(1); // Dừng ứng dụng nếu không kết nối được CSDL

  }
  };
  
  module.exports = { connectDatabase };