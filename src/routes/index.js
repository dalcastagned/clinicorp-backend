const express = require('express');
const taskRoutes = require('./taskRoutes');

const router = express.Router();

router.use('/', taskRoutes);

module.exports = router;