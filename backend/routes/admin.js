const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/organizadores-pendentes', authMiddleware, roleMiddleware(['admin']), adminController.listarPendentes);
router.put('/organizadores/:id/aprovar', authMiddleware, roleMiddleware(['admin']), adminController.aprovar);
router.put('/organizadores/:id/recusar', authMiddleware, roleMiddleware(['admin']), adminController.recusar);

router.get('/estatisticas', authMiddleware, roleMiddleware(['admin']), adminController.getEstatisticas);
router.get('/usuarios', authMiddleware, roleMiddleware(['admin']), adminController.listarTodosUsuarios);
router.put('/usuarios/:id/status', authMiddleware, roleMiddleware(['admin']), adminController.alterarStatusUsuario);

router.get('/feiras', authMiddleware, roleMiddleware(['admin']), adminController.listarFeirasAdmin);
router.delete('/feiras/:id', authMiddleware, roleMiddleware(['admin']), adminController.deletarFeiraAdmin);

router.get('/produtos', authMiddleware, roleMiddleware(['admin']), adminController.listarProdutosAdmin);
router.delete('/produtos/:id', authMiddleware, roleMiddleware(['admin']), adminController.deletarProdutoAdmin);

module.exports = router;
