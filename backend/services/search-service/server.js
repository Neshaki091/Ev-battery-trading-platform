const app = require('./src/app');
const { connectDatabase } = require('./src/config/database'); // <- Cần THÊM .js

require('dotenv').config();

const PORT = process.env.PORT || 8004;
connectDatabase();

app.listen(PORT, () => {
  console.log(`✅ Search Service is running on http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
});

