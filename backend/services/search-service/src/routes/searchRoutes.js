const { Router } = require('express');
const { getListings } = require('../controllers/searchController');

const router = Router();
router.get('/listings', getListings);

module.exports = router; // <-- Dùng module.exports