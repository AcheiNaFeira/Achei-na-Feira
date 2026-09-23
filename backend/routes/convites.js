const express = require('express');
const router = express.Router();
const convitesController = require('../controllers/convitesController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rotas para feirantes verem e responderem seus convites
router.get('/', authMiddleware, roleMiddleware(['feirante']), convitesController.listarPendentes);
router.put('/:id/aceitar', authMiddleware, roleMiddleware(['feirante']), convitesController.aceitar);
router.put('/:id/recusar', authMiddleware, roleMiddleware(['feirante']), convitesController.recusar);

module.exports = router;
