const express = require('express');
const router = express.Router();
const feirasController = require('../controllers/feirasController');
const convitesController = require('../controllers/convitesController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/upload');

// Rotas públicas
router.get('/', feirasController.listar);
router.get('/:id', feirasController.detalhe);
router.get('/:id/feirantes', convitesController.listarFeirantes);
router.get('/:id/produtos', feirasController.listarProdutos);

// Rotas protegidas (apenas organizadores)
router.post('/', authMiddleware, roleMiddleware(['organizador']), upload.single('imagem'), feirasController.criar);
router.post('/:id/convidar', authMiddleware, roleMiddleware(['organizador']), convitesController.convidar);
router.put('/:id', authMiddleware, roleMiddleware(['organizador']), upload.single('imagem'), feirasController.editar);
router.delete('/:id', authMiddleware, roleMiddleware(['organizador']), feirasController.deletar);

router.post('/:id/like', async (req, res) => {
  const db = require('../db');
  const { id } = req.params;
  const cookieName = `liked_feira_${id}`;

  try {
    if (req.cookies[cookieName]) {
      // Remove o like
      await db.query('UPDATE feiras SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = $1', [id]);
      const result = await db.query('SELECT likes FROM feiras WHERE id = $1', [id]);
      res.clearCookie(cookieName, { httpOnly: true, sameSite: 'lax' });
      res.json({ likes: result.rows[0].likes, liked: false });
    } else {
      // Adiciona o like
      await db.query('UPDATE feiras SET likes = COALESCE(likes, 0) + 1 WHERE id = $1', [id]);
      const result = await db.query('SELECT likes FROM feiras WHERE id = $1', [id]);
      // 1 ano para o toggle persistir caso feche o navegador
      res.cookie(cookieName, 'true', { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
      res.json({ likes: result.rows[0].likes, liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar like' });
  }
});

module.exports = router;
