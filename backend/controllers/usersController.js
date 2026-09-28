const db = require('../db');

const usersController = {
  async listarFeirantes(req, res) {
    try {
      const result = await db.query(
        "SELECT id, nome, email FROM users WHERE tipo = 'feirante' ORDER BY nome ASC"
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao listar feirantes:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  async listarMinhasFeiras(req, res) {
    try {
      const result = await db.query(
        "SELECT f.* FROM feiras f JOIN participacoes p ON f.id = p.feira_id WHERE p.feirante_id = $1 AND p.status = 'aceito'",
        [req.user.id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
};

module.exports = usersController;
