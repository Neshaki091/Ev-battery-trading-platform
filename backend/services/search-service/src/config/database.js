const mongoose = require('mongoose'); // <-- SỬA

const connectDatabase = async () => { // <-- SỬA
  try {
    await mongoose.connect(
      process.env.MONGO_URI,
    );
    console.log("LIÊN KẾT CSDL THÀNH CÔNG");
  } catch (error) {
    console.error('LỖI KẾT NỐI CSDL:', error);
    process.exit(1);
  }
};

module.exports = { connectDatabase }; // <-- SỬA