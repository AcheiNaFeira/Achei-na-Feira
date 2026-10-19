const express = require('express');
const router = express.Router();
const convitesController = require('../controllers/convitesController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rotas de convite por link
router.get('/link/:token', convitesController.obterPorToken);
router.post('/link/:token/aceitar', authMiddleware, roleMiddleware(['feirante']), convitesController.aceitarPorToken);

// Rotas para feirantes verem e responderem seus convites
router.get('/', authMiddleware, roleMiddleware(['feirante']), convitesController.listarPendentes);
router.put('/:id/aceitar', authMiddleware, roleMiddleware(['feirante']), convitesController.aceitar);
router.put('/:id/recusar', authMiddleware, roleMiddleware(['feirante']), convitesController.recusar);

// Feirante sai da feira
router.delete('/feira/:feira_id/sair', authMiddleware, roleMiddleware(['feirante']), convitesController.sairDaFeira);

// Organizador remove participante
router.delete('/feira/:feira_id/feirante/:feirante_id', authMiddleware, roleMiddleware(['organizador']), convitesController.removerParticipante);

module.exports = router;
