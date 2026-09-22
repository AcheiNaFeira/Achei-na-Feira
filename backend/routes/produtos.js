const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtosController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rotas públicas
router.get('/', produtosController.listar);
router.get('/:id', produtosController.detalhe);

// Rotas protegidas (apenas feirantes)
router.post('/', authMiddleware, roleMiddleware(['feirante']), produtosController.criar);
router.put('/:id', authMiddleware, roleMiddleware(['feirante']), produtosController.editar);
router.delete('/:id', authMiddleware, roleMiddleware(['feirante']), produtosController.deletar);

module.exports = router;
