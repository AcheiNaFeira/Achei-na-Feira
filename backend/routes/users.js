const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/feirantes', authMiddleware, roleMiddleware(['organizador', 'admin']), usersController.listarFeirantes);

module.exports = router;
