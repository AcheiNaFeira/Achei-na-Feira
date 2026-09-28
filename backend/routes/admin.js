const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/organizadores-pendentes', authMiddleware, roleMiddleware(['admin']), adminController.listarPendentes);
router.put('/organizadores/:id/aprovar', authMiddleware, roleMiddleware(['admin']), adminController.aprovar);
router.put('/organizadores/:id/recusar', authMiddleware, roleMiddleware(['admin']), adminController.recusar);

module.exports = router;
