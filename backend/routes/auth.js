const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rota pública (agora apenas login)
router.post('/login', authController.login);

// Rotas protegidas (todos podem mudar senha)
router.put('/mudar-senha', authMiddleware, authController.mudarSenha);

// Rotas protegidas (apenas organizadores)
// Organizador cria um feirante
router.post('/feirante', authMiddleware, roleMiddleware(['organizador']), authController.criarFeirante);

module.exports = router;
