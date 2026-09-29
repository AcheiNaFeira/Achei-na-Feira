
const fs = require('fs');
let code = fs.readFileSync('backend/routes/feiras.js', 'utf8');
code = code.replace(/router\.post\('\/:id\/like'[\s\S]*\}\);/, \outer.post('/:id/like', async (req, res) => {
  const db = require('../db');
  const { id } = req.params;
  const cookieName = \\\liked_feira_\\\\;

  try {
    if (req.cookies[cookieName]) {
      await db.query('UPDATE feiras SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = \', [id]);
      const result = await db.query('SELECT likes FROM feiras WHERE id = \', [id]);
      res.clearCookie(cookieName, { httpOnly: true, sameSite: 'lax' });
      res.json({ likes: result.rows[0].likes, liked: false });
    } else {
      await db.query('UPDATE feiras SET likes = COALESCE(likes, 0) + 1 WHERE id = \', [id]);
      const result = await db.query('SELECT likes FROM feiras WHERE id = \', [id]);
      res.cookie(cookieName, 'true', { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
      res.json({ likes: result.rows[0].likes, liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar like' });
  }
});\);
fs.writeFileSync('backend/routes/feiras.js', code);

let code2 = fs.readFileSync('backend/routes/produtos.js', 'utf8');
code2 = code2.replace(/router\.post\('\/:id\/like'[\s\S]*\}\);/, \outer.post('/:id/like', async (req, res) => {
  const db = require('../db');
  const { id } = req.params;
  const cookieName = \\\liked_produto_\\\\;

  try {
    if (req.cookies[cookieName]) {
      await db.query('UPDATE produtos SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = \', [id]);
      const result = await db.query('SELECT likes FROM produtos WHERE id = \', [id]);
      res.clearCookie(cookieName, { httpOnly: true, sameSite: 'lax' });
      res.json({ likes: result.rows[0].likes, liked: false });
    } else {
      await db.query('UPDATE produtos SET likes = COALESCE(likes, 0) + 1 WHERE id = \', [id]);
      const result = await db.query('SELECT likes FROM produtos WHERE id = \', [id]);
      res.cookie(cookieName, 'true', { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
      res.json({ likes: result.rows[0].likes, liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar like' });
  }
});\);
fs.writeFileSync('backend/routes/produtos.js', code2);

