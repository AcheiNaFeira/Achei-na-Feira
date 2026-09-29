const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtosController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/upload');

// Rotas públicas
router.get('/', produtosController.listar);
router.get('/:id', produtosController.detalhe);

// Rotas protegidas (apenas feirantes)
router.post('/', authMiddleware, roleMiddleware(['feirante']), upload.array('imagens', 5), produtosController.criar);
router.put('/:id', authMiddleware, roleMiddleware(['feirante']), upload.array('imagens', 5), produtosController.editar);
router.delete('/:id', authMiddleware, roleMiddleware(['feirante']), produtosController.deletar);

router.post('/:id/like', async (req, res) => {
  const db = require('../db');
  const { id } = req.params;
  const cookieName = `liked_produto_${id}`;

  try {
    if (req.cookies[cookieName]) {
      // Remove o like
      await db.query('UPDATE produtos SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = $1', [id]);
      const result = await db.query('SELECT likes FROM produtos WHERE id = $1', [id]);
      res.clearCookie(cookieName, { httpOnly: true, sameSite: 'lax' });
      res.json({ likes: result.rows[0].likes, liked: false });
    } else {
      // Adiciona o like
      await db.query('UPDATE produtos SET likes = COALESCE(likes, 0) + 1 WHERE id = $1', [id]);
      const result = await db.query('SELECT likes FROM produtos WHERE id = $1', [id]);
      res.cookie(cookieName, 'true', { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
      res.json({ likes: result.rows[0].likes, liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar like' });
  }
});

module.exports = router;
