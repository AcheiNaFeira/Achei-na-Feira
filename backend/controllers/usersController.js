const db = require('../db');

const usersController = {
  async listarFeirantes(req, res) {
    const { busca } = req.query;
    try {
      let query = "SELECT id, nome, email, whatsapp FROM users WHERE tipo = 'feirante' AND COALESCE(status_aprovacao, 'ativo') != 'banido'";
      const params = [];

      if (busca) {
        params.push(`%${busca}%`);
        query += ` AND (nome ILIKE $1 OR email ILIKE $1 OR COALESCE(whatsapp, '') ILIKE $1)`;
      }

      query += ' ORDER BY nome ASC';
      const result = await db.query(query, params);
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
