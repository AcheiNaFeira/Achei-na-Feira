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
  },

  async getEstatisticas(req, res) {
    try {
      const viewsTotalRes = await db.query("SELECT COALESCE(SUM(views), 0) as views FROM analytics_daily");
      const viewsDailyRes = await db.query("SELECT COALESCE(views, 0) as views FROM analytics_daily WHERE data = CURRENT_DATE");
      const viewsWeeklyRes = await db.query("SELECT COALESCE(SUM(views), 0) as views FROM analytics_daily WHERE data >= CURRENT_DATE - INTERVAL '7 days'");

      const feirasRes = await db.query("SELECT count(*) as count FROM feiras");
      const produtosRes = await db.query("SELECT count(*) as count FROM produtos");
      
      res.json({
        views: parseInt(viewsTotalRes.rows[0]?.views || 0),
        views_diarias: parseInt(viewsDailyRes.rows[0]?.views || 0),
        views_semanais: parseInt(viewsWeeklyRes.rows[0]?.views || 0),
        feiras: parseInt(feirasRes.rows[0].count),
        produtos: parseInt(produtosRes.rows[0].count)
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  async listarTodosUsuarios(req, res) {
    try {
      const result = await db.query(
        "SELECT id, nome, email, tipo, status_aprovacao, created_at FROM users WHERE tipo IN ('feirante', 'organizador') ORDER BY created_at DESC"
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  async alterarStatusUsuario(req, res) {
    const { id } = req.params;
    const { status } = req.body; // 'ativo' ou 'banido'
    try {
      await db.query("UPDATE users SET status_aprovacao = $1 WHERE id = $2", [status, id]);
      res.json({ message: 'Status atualizado com sucesso' });
    } catch (err) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  async listarFeirasAdmin(req, res) {
    try {
      const result = await db.query("SELECT * FROM feiras ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  async deletarFeiraAdmin(req, res) {
    const { id } = req.params;
    try {
      await db.query("DELETE FROM feiras WHERE id = $1", [id]);
      res.json({ message: 'Feira deletada com sucesso' });
    } catch (err) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  async listarProdutosAdmin(req, res) {
    try {
      const result = await db.query("SELECT * FROM produtos ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  async deletarProdutoAdmin(req, res) {
    const { id } = req.params;
    try {
      await db.query("DELETE FROM produtos WHERE id = $1", [id]);
      res.json({ message: 'Produto deletado com sucesso' });
    } catch (err) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
};

module.exports = adminController;
