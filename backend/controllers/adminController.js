const db = require('../db');

const adminController = {
  async listarPendentes(req, res) {
    try {
      const result = await db.query(
        "SELECT id, nome, email, created_at FROM users WHERE tipo = 'organizador' AND status_aprovacao = 'pendente' ORDER BY created_at ASC"
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao listar organizadores pendentes:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  async aprovar(req, res) {
    const { id } = req.params;
    try {
      const result = await db.query(
        "UPDATE users SET status_aprovacao = 'ativo' WHERE id = $1 AND tipo = 'organizador' RETURNING id, nome, status_aprovacao",
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Organizador não encontrado ou não pendente.' });
      }
      res.json({ message: 'Organizador aprovado com sucesso!', user: result.rows[0] });
    } catch (err) {
      console.error('Erro ao aprovar organizador:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  async recusar(req, res) {
    const { id } = req.params;
    try {
      const result = await db.query(
        "DELETE FROM users WHERE id = $1 AND tipo = 'organizador' AND status_aprovacao = 'pendente' RETURNING id",
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Organizador não encontrado ou não pendente.' });
      }
      res.json({ message: 'Cadastro de organizador recusado (removido).' });
    } catch (err) {
      console.error('Erro ao recusar organizador:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
};

module.exports = adminController;
