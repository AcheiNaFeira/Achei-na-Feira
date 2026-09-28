const db = require('../db');

const feirasController = {
  // GET /api/feiras
  async listar(req, res) {
    const { cidade, data } = req.query;
    let query = 'SELECT * FROM feiras WHERE 1=1';
    const params = [];
    
    // Filtros de exemplo, podem ser expandidos
    if (cidade) {
      params.push(`%${cidade}%`);
      query += ` AND local ILIKE $${params.length}`;
    }
    if (data) {
      params.push(data);
      query += ` AND data = $${params.length}`;
    }

    query += ' ORDER BY data DESC';

    try {
      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao listar feiras:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // GET /api/feiras/:id
  async detalhe(req, res) {
    const { id } = req.params;
    try {
      const result = await db.query('SELECT * FROM feiras WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Feira não encontrada' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Erro ao detalhar feira:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // GET /api/feiras/:id/produtos
  async listarProdutos(req, res) {
    const { id } = req.params;
    try {
      const result = await db.query(`
        SELECT p.*, u.nome as feirante_nome, u.whatsapp as feirante_whatsapp
        FROM produtos p
        JOIN participacoes part ON p.feirante_id = part.feirante_id
        JOIN users u ON p.feirante_id = u.id
        WHERE part.feira_id = $1 AND part.status = 'aceito'
      `, [id]);
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao listar produtos da feira:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // POST /api/feiras
  async criar(req, res) {
    const { nome, local, data, hora_inicio, hora_fim, descricao, endereco_completo } = req.body;
    const organizador_id = req.user.id;
    const imagem_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!nome || !local || !data || !hora_inicio || !hora_fim) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
    }

    try {
      const result = await db.query(
        'INSERT INTO feiras (nome, local, data, hora_inicio, hora_fim, descricao, endereco_completo, imagem_url, organizador_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [nome, local, data, hora_inicio, hora_fim, descricao, endereco_completo, imagem_url, organizador_id]
      );
      res.status(201).json({ message: 'Feira criada com sucesso!', feira: result.rows[0] });
    } catch (err) {
      console.error('Erro ao criar feira:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // PUT /api/feiras/:id
  async editar(req, res) {
    const { id } = req.params;
    const { nome, local, data, hora_inicio, hora_fim, descricao, endereco_completo } = req.body;
    const organizador_id = req.user.id;
    const nova_imagem_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const verifica = await db.query('SELECT * FROM feiras WHERE id = $1 AND organizador_id = $2', [id, organizador_id]);
      if (verifica.rows.length === 0) {
        return res.status(404).json({ error: 'Feira não encontrada ou você não tem permissão para editá-la.' });
      }

      let query, params;
      if (nova_imagem_url) {
        query = 'UPDATE feiras SET nome = $1, local = $2, data = $3, hora_inicio = $4, hora_fim = $5, descricao = $6, endereco_completo = $7, imagem_url = $8 WHERE id = $9 RETURNING *';
        params = [nome, local, data, hora_inicio, hora_fim, descricao, endereco_completo, nova_imagem_url, id];
      } else {
        query = 'UPDATE feiras SET nome = $1, local = $2, data = $3, hora_inicio = $4, hora_fim = $5, descricao = $6, endereco_completo = $7 WHERE id = $8 RETURNING *';
        params = [nome, local, data, hora_inicio, hora_fim, descricao, endereco_completo, id];
      }

      const result = await db.query(query, params);

      res.json({ message: 'Feira atualizada com sucesso!', feira: result.rows[0] });
    } catch (err) {
      console.error('Erro ao editar feira:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // DELETE /api/feiras/:id
  async deletar(req, res) {
    const { id } = req.params;
    const organizador_id = req.user.id;

    try {
      // Verifica permissão
      const verifica = await db.query('SELECT * FROM feiras WHERE id = $1 AND organizador_id = $2', [id, organizador_id]);
      if (verifica.rows.length === 0) {
        return res.status(404).json({ error: 'Feira não encontrada ou você não tem permissão para deletá-la.' });
      }

      await db.query('DELETE FROM feiras WHERE id = $1', [id]);
      res.json({ message: 'Feira removida com sucesso!' });
    } catch (err) {
      console.error('Erro ao deletar feira:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
};

module.exports = feirasController;
