const crypto = require('crypto');
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
      const verificaFeira = await db.query('SELECT * FROM feiras WHERE id = $1 AND organizador_id = $2', [feira_id, organizador_id]);
      if (verificaFeira.rows.length === 0) {
        return res.status(403).json({ error: 'Feira não encontrada ou sem permissão.' });
      }

      const verificaFeirante = await db.query('SELECT * FROM users WHERE id = $1 AND tipo = $2', [feirante_id, 'feirante']);
      if (verificaFeirante.rows.length === 0) {
        return res.status(404).json({ error: 'Feirante não encontrado.' });
      }

      const verificaParticipacao = await db.query('SELECT * FROM participacoes WHERE feira_id = $1 AND feirante_id = $2', [feira_id, feirante_id]);
      if (verificaParticipacao.rows.length > 0) {
        const atual = verificaParticipacao.rows[0];
        if (atual.status === 'recusado') {
          const reenviado = await db.query(
            "UPDATE participacoes SET status = 'pendente', created_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
            [atual.id]
          );
          return res.status(200).json({ message: 'Convite reenviado com sucesso!', convite: reenviado.rows[0] });
        }
        return res.status(400).json({
          error: atual.status === 'aceito'
            ? 'Este feirante já está confirmado nesta feira.'
            : 'Este feirante já possui um convite pendente para esta feira.'
        });
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

  // POST /api/feiras/:id/link-convite (Organizador gera ou obtém o link de convite da feira)
  async gerarLinkConvite(req, res) {
    const feira_id = req.params.id;
    const organizador_id = req.user.id;
    const { regenerar } = req.body || {};

    try {
      const verifica = await db.query('SELECT id, nome, convite_token FROM feiras WHERE id = $1 AND organizador_id = $2', [feira_id, organizador_id]);
      if (verifica.rows.length === 0) {
        return res.status(403).json({ error: 'Feira não encontrada ou sem permissão.' });
      }

      let token = verifica.rows[0].convite_token;
      if (!token || regenerar) {
        token = crypto.randomBytes(12).toString('hex');
        await db.query('UPDATE feiras SET convite_token = $1 WHERE id = $2', [token, feira_id]);
      }

      res.json({ token, feira_nome: verifica.rows[0].nome });
    } catch (err) {
      console.error('Erro ao gerar link de convite:', err);
      res.status(500).json({ error: 'Erro ao gerar link de convite' });
    }
  },

  // GET /api/convites/link/:token (Rota pública para visualizar os dados da feira do convite)
  async obterPorToken(req, res) {
    const { token } = req.params;
    try {
      const result = await db.query(
        `SELECT f.id, f.nome, f.local, f.endereco_completo, f.data, f.hora_inicio, f.hora_fim, f.descricao, f.imagem_url, u.nome as organizador_nome
         FROM feiras f
         LEFT JOIN users u ON f.organizador_id = u.id
         WHERE f.convite_token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Link de convite inválido ou expirado.' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Erro ao buscar convite por token:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // POST /api/convites/link/:token/aceitar (Feirante aceita convite via link)
  async aceitarPorToken(req, res) {
    const { token } = req.params;
    const feirante_id = req.user.id;

    try {
      const feiraRes = await db.query('SELECT id, nome, data FROM feiras WHERE convite_token = $1', [token]);
      if (feiraRes.rows.length === 0) {
        return res.status(404).json({ error: 'Link de convite inválido ou expirado.' });
      }

      const feira = feiraRes.rows[0];
      await db.query(
        `INSERT INTO participacoes (feira_id, feirante_id, status)
         VALUES ($1, $2, 'aceito')
         ON CONFLICT (feira_id, feirante_id) DO UPDATE SET status = 'aceito'`,
        [feira.id, feirante_id]
      );

      res.json({ message: 'Convite aceito com sucesso! Você já está confirmado na feira.', feira });
    } catch (err) {
      console.error('Erro ao aceitar convite por link:', err);
      res.status(500).json({ error: 'Erro ao aceitar convite' });
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
  },

  // Organizador remove participante
  async removerParticipante(req, res) {
    const { feira_id, feirante_id } = req.params;
    const organizador_id = req.user.id;
    try {
      const verifica = await db.query('SELECT id FROM feiras WHERE id = $1 AND organizador_id = $2', [feira_id, organizador_id]);
      if (verifica.rows.length === 0) return res.status(403).json({ error: 'Acesso negado' });
      await db.query('DELETE FROM participacoes WHERE feira_id = $1 AND feirante_id = $2', [feira_id, feirante_id]);
      res.json({ message: 'Removido com sucesso' });
    } catch (e) {
      res.status(500).json({ error: 'Erro' });
    }
  },

  // Feirante sai da feira
  async sairDaFeira(req, res) {
    const { feira_id } = req.params;
    const feirante_id = req.user.id;
    try {
      await db.query('DELETE FROM participacoes WHERE feira_id = $1 AND feirante_id = $2', [feira_id, feirante_id]);
      res.json({ message: 'Você saiu da feira' });
    } catch (e) {
      res.status(500).json({ error: 'Erro' });
    }
  }
};

module.exports = convitesController;
