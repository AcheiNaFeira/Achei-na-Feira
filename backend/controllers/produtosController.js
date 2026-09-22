const db = require('../db');

const produtosController = {
  // GET /api/produtos
  async listar(req, res) {
    const { categoria, busca } = req.query;
    let query = 'SELECT p.*, u.nome as feirante_nome FROM produtos p JOIN users u ON p.feirante_id = u.id WHERE 1=1';
    const params = [];
    
    if (categoria) {
      params.push(categoria);
      query += ` AND p.categoria = $${params.length}`;
    }
    if (busca) {
      params.push(`%${busca}%`);
      query += ` AND (p.nome ILIKE $${params.length} OR p.descricao ILIKE $${params.length})`;
    }

    query += ' ORDER BY p.created_at DESC';

    try {
      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao listar produtos:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // GET /api/produtos/:id
  async detalhe(req, res) {
    const { id } = req.params;
    try {
      const result = await db.query(
        'SELECT p.*, u.nome as feirante_nome FROM produtos p JOIN users u ON p.feirante_id = u.id WHERE p.id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Erro ao detalhar produto:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // POST /api/produtos
  async criar(req, res) {
    const { nome, descricao, preco, categoria, emoji } = req.body;
    const feirante_id = req.user.id;

    if (!nome || !preco || !categoria) {
      return res.status(400).json({ error: 'Nome, preço e categoria são obrigatórios.' });
    }

    try {
      const result = await db.query(
        'INSERT INTO produtos (nome, descricao, preco, categoria, emoji, feirante_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [nome, descricao, preco, categoria, emoji, feirante_id]
      );
      res.status(201).json({ message: 'Produto cadastrado com sucesso!', produto: result.rows[0] });
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // PUT /api/produtos/:id
  async editar(req, res) {
    const { id } = req.params;
    const { nome, descricao, preco, categoria, emoji } = req.body;
    const feirante_id = req.user.id;

    try {
      const verifica = await db.query('SELECT * FROM produtos WHERE id = $1 AND feirante_id = $2', [id, feirante_id]);
      if (verifica.rows.length === 0) {
        return res.status(404).json({ error: 'Produto não encontrado ou sem permissão.' });
      }

      const result = await db.query(
        'UPDATE produtos SET nome = $1, descricao = $2, preco = $3, categoria = $4, emoji = $5 WHERE id = $6 RETURNING *',
        [nome, descricao, preco, categoria, emoji, id]
      );

      res.json({ message: 'Produto atualizado com sucesso!', produto: result.rows[0] });
    } catch (err) {
      console.error('Erro ao editar produto:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // DELETE /api/produtos/:id
  async deletar(req, res) {
    const { id } = req.params;
    const feirante_id = req.user.id;

    try {
      const verifica = await db.query('SELECT * FROM produtos WHERE id = $1 AND feirante_id = $2', [id, feirante_id]);
      if (verifica.rows.length === 0) {
        return res.status(404).json({ error: 'Produto não encontrado ou sem permissão.' });
      }

      await db.query('DELETE FROM produtos WHERE id = $1', [id]);
      res.json({ message: 'Produto removido com sucesso!' });
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
};

module.exports = produtosController;
