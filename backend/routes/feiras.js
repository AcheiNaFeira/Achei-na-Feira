const express = require('express');
const router = express.Router();
const feirasController = require('../controllers/feirasController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rotas públicas
router.get('/', feirasController.listar);
router.get('/:id', feirasController.detalhe);

// Rotas protegidas (apenas organizadores)
router.post('/', authMiddleware, roleMiddleware(['organizador']), feirasController.criar);
router.put('/:id', authMiddleware, roleMiddleware(['organizador']), feirasController.editar);
router.delete('/:id', authMiddleware, roleMiddleware(['organizador']), feirasController.deletar);

module.exports = router;
