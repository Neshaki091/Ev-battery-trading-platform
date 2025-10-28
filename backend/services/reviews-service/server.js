const express = require('express');
const prisma = require('./prisma/client');
const reviewRoutes = require('./src/routes/review.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/reviews', reviewRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});