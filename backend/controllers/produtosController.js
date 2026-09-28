const db = require('../db');

const produtosController = {
  // GET /api/produtos
  async listar(req, res) {
    const { categoria, busca } = req.query;
    let query = 'SELECT p.*, u.nome as feirante_nome, u.whatsapp as feirante_whatsapp FROM produtos p JOIN users u ON p.feirante_id = u.id WHERE 1=1';
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
        'SELECT p.*, u.nome as feirante_nome, u.whatsapp as feirante_whatsapp FROM produtos p JOIN users u ON p.feirante_id = u.id WHERE p.id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      const produto = result.rows[0];
      
      // Buscar as feiras confirmadas em que o feirante deste produto atua
      const feirasResult = await db.query(
        `SELECT f.id, f.nome, f.local, f.endereco_completo 
         FROM feiras f 
         JOIN participacoes part ON f.id = part.feira_id 
         WHERE part.feirante_id = $1 AND part.status = 'aceito'`,
        [produto.feirante_id]
      );
      
      produto.feiras = feirasResult.rows;

      res.json(produto);
    } catch (err) {
      console.error('Erro ao detalhar produto:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // POST /api/produtos
  async criar(req, res) {
    const { nome, descricao, preco, categoria } = req.body;
    const feirante_id = req.user.id;

    const files = req.files || [];
    if (files.length === 0 && !req.file) {
      return res.status(400).json({ error: 'Imagem é obrigatória.' });
    }
    
    // Suporta o envio single (req.file) antigo ou o novo array (req.files)
    let imagens_array = [];
    if (req.file) imagens_array.push(`/uploads/${req.file.filename}`);
    if (files.length > 0) imagens_array = files.map(f => `/uploads/${f.filename}`);
    
    const imagem_url = imagens_array.join(',');

    try {
      const result = await db.query(
        'INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url, feirante_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [nome, descricao, preco, categoria, imagem_url, feirante_id]
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
    const { nome, descricao, preco, categoria } = req.body;
    const feirante_id = req.user.id;
    
    const files = req.files || [];
    let nova_imagem_url = null;
    
    if (req.file) nova_imagem_url = `/uploads/${req.file.filename}`;
    if (files.length > 0) nova_imagem_url = files.map(f => `/uploads/${f.filename}`).join(',');

    try {
      const verifica = await db.query('SELECT * FROM produtos WHERE id = $1 AND feirante_id = $2', [id, feirante_id]);
      if (verifica.rows.length === 0) {
        return res.status(404).json({ error: 'Produto não encontrado ou sem permissão.' });
      }

      let query, params;
      if (nova_imagem_url) {
        // Appends to existing images if they sent new ones? 
        // No, replacing for simplicity. Usually an edit replaces.
        query = 'UPDATE produtos SET nome = $1, descricao = $2, preco = $3, categoria = $4, imagem_url = $5 WHERE id = $6 RETURNING *';
        params = [nome, descricao, preco, categoria, nova_imagem_url, id];
      } else {
        query = 'UPDATE produtos SET nome = $1, descricao = $2, preco = $3, categoria = $4 WHERE id = $5 RETURNING *';
        params = [nome, descricao, preco, categoria, id];
      }

      const result = await db.query(query, params);

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
      const result = await db.query('DELETE FROM produtos WHERE id = $1 AND feirante_id = $2 RETURNING id', [id, feirante_id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Produto não encontrado ou sem permissão.' });
      }
      res.json({ message: 'Produto deletado com sucesso!' });
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
};

module.exports = produtosController;
