const express = require('express');
const router = express.Router();
const feirasController = require('../controllers/feirasController');
const convitesController = require('../controllers/convitesController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rotas públicas
router.get('/', feirasController.listar);
router.get('/:id', feirasController.detalhe);
router.get('/:id/feirantes', convitesController.listarFeirantes); // Lista feirantes confirmados

// Rotas protegidas (apenas organizadores)
router.post('/', authMiddleware, roleMiddleware(['organizador']), feirasController.criar);
router.post('/:id/convidar', authMiddleware, roleMiddleware(['organizador']), convitesController.convidar);
router.put('/:id', authMiddleware, roleMiddleware(['organizador']), feirasController.editar);
router.delete('/:id', authMiddleware, roleMiddleware(['organizador']), feirasController.deletar);

module.exports = router;
