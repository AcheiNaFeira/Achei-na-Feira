const fs = require('fs');
let content = fs.readFileSync('controllers/authController.js', 'utf8');

content = content.replace(
  /res\.json\(\{\s*message: 'Login bem-sucedido!',\s*token,\s*user: \{/g,
  `res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });\n      res.json({\n        message: 'Login bem-sucedido!',\n        user: {`
);

content = content.replace(
  /res\.json\(\{\s*message: 'Senha atualizada com sucesso!',\s*token\s*\}\);/g,
  `res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });\n      res.json({ message: 'Senha atualizada com sucesso!' });`
);

if (!content.includes('logout(req, res)')) {
  content = content.replace(
    /};\s*module\.exports = authController;/g,
    `,\n  async logout(req, res) {\n    res.clearCookie('token');\n    res.json({ message: 'Logout bem-sucedido!' });\n  },\n  async me(req, res) {\n    try {\n      const result = await db.query('SELECT id, nome, email, tipo, precisa_trocar_senha, whatsapp FROM users WHERE id = $1', [req.user.id]);\n      if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });\n      res.json({ user: result.rows[0] });\n    } catch (err) {\n      res.status(500).json({ error: 'Erro no servidor' });\n    }\n  }\n};\n\nmodule.exports = authController;`
  );
}

fs.writeFileSync('controllers/authController.js', content);
