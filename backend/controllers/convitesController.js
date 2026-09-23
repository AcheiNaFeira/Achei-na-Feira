const db = require('../db');

const convitesController = {
  // GET /api/convites
  // O feirante vê os convites pendentes dele
  async listarPendentes(req, res) {
    const feirante_id = req.user.id;

    try {
      const result = await db.query(
        `SELECT p.id as convite_id, p.status, f.nome as feira_nome, f.data, f.local 
         FROM participacoes p
         JOIN feiras f ON p.feira_id = f.id
         WHERE p.feirante_id = $1 AND p.status = 'pendente'
         ORDER BY p.created_at DESC`,
        [feirante_id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao listar convites:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // PUT /api/convites/:id/aceitar
  async aceitar(req, res) {
    const { id } = req.params;
    const feirante_id = req.user.id;

    try {
      const result = await db.query(
        `UPDATE participacoes 
         SET status = 'aceito' 
         WHERE id = $1 AND feirante_id = $2 AND status = 'pendente'
         RETURNING *`,
        [id, feirante_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Convite não encontrado ou já processado.' });
      }

      res.json({ message: 'Convite aceito com sucesso!' });
    } catch (err) {
      console.error('Erro ao aceitar convite:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // PUT /api/convites/:id/recusar
  async recusar(req, res) {
    const { id } = req.params;
    const feirante_id = req.user.id;

    try {
      const result = await db.query(
        `UPDATE participacoes 
         SET status = 'recusado' 
         WHERE id = $1 AND feirante_id = $2 AND status = 'pendente'
         RETURNING *`,
        [id, feirante_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Convite não encontrado ou já processado.' });
      }

      res.json({ message: 'Convite recusado.' });
    } catch (err) {
      console.error('Erro ao recusar convite:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // POST /api/feiras/:id/convidar (Para ser usado nas rotas de feiras)
  async convidar(req, res) {
    const feira_id = req.params.id;
    const { feirante_id } = req.body;
    const organizador_id = req.user.id;

    if (!feirante_id) {
      return res.status(400).json({ error: 'ID do feirante é obrigatório.' });
    }

    try {
      // 1. Verificar se a feira existe e pertence ao organizador logado
      const verificaFeira = await db.query('SELECT * FROM feiras WHERE id = $1 AND organizador_id = $2', [feira_id, organizador_id]);
      if (verificaFeira.rows.length === 0) {
        return res.status(403).json({ error: 'Feira não encontrada ou sem permissão.' });
      }

      // 2. Verificar se o feirante existe e é do tipo feirante
      const verificaFeirante = await db.query('SELECT * FROM users WHERE id = $1 AND tipo = $2', [feirante_id, 'feirante']);
      if (verificaFeirante.rows.length === 0) {
        return res.status(404).json({ error: 'Feirante não encontrado.' });
      }

      // 3. Inserir convite (verifica se já não existe antes para não duplicar)
      const verificaParticipacao = await db.query('SELECT * FROM participacoes WHERE feira_id = $1 AND feirante_id = $2', [feira_id, feirante_id]);
      if (verificaParticipacao.rows.length > 0) {
        return res.status(400).json({ error: 'O feirante já foi convidado para esta feira.' });
      }

      const result = await db.query(
        'INSERT INTO participacoes (feira_id, feirante_id, status) VALUES ($1, $2, $3) RETURNING *',
        [feira_id, feirante_id, 'pendente']
      );

      res.status(201).json({ message: 'Convite enviado com sucesso!', convite: result.rows[0] });
    } catch (err) {
      console.error('Erro ao convidar feirante:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // GET /api/feiras/:id/feirantes
  async listarFeirantes(req, res) {
    const feira_id = req.params.id;

    try {
      const result = await db.query(
        `SELECT u.id, u.nome, u.email, p.status, p.created_at as participacao_data
         FROM participacoes p
         JOIN users u ON p.feirante_id = u.id
         WHERE p.feira_id = $1 AND p.status = 'aceito'
         ORDER BY u.nome ASC`,
        [feira_id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao listar feirantes da feira:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
};

module.exports = convitesController;
