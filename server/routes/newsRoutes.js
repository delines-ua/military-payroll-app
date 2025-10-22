// server/routes/newsRoutes.js

const express = require('express');
const router = express.Router();
const { getMoDNews } = require('../controllers/newsController');

// Цей маршрут публічний, тому 'protect' не потрібен
router.route('/').get(getMoDNews);

module.exports = router;