const app = require('./src/app');
const { connectDatabase } = require('./src/config/database'); // <- Cần THÊM .js
const { startListingConsumer } = require('./src/service/listingConsumer')
require('dotenv').config();

const PORT = process.env.PORT || 8004;
connectDatabase();
// ...
app.listen(PORT, () => {
  console.log(`✅ Search Service is running on http://localhost:${PORT}`); // <-- SỬA LẠI ĐÂY
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  startListingConsumer();
});

