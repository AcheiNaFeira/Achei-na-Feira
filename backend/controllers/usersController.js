const bcrypt = require('bcrypt');
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
  },

  async atualizarPerfil(req, res) {
    const { nome, email, whatsapp, novaSenha } = req.body;
    const userId = req.user.id;

    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }

    try {
      let result;
      if (novaSenha && novaSenha.trim().length > 0) {
        if (novaSenha.length < 6) {
          return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(novaSenha, salt);
        result = await db.query(
          'UPDATE users SET nome = $1, email = $2, whatsapp = $3, senha = $4 WHERE id = $5 RETURNING id, nome, email, tipo, whatsapp, precisa_trocar_senha',
          [nome.trim(), email.trim(), whatsapp || '', hashSenha, userId]
        );
      } else {
        result = await db.query(
          'UPDATE users SET nome = $1, email = $2, whatsapp = $3 WHERE id = $4 RETURNING id, nome, email, tipo, whatsapp, precisa_trocar_senha',
          [nome.trim(), email.trim(), whatsapp || '', userId]
        );
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      res.json({ message: 'Perfil atualizado com sucesso!', user: result.rows[0] });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: 'Este e-mail já está em uso por outra conta.' });
      }
      console.error('Erro ao atualizar perfil:', err);
      res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }
  }
};

module.exports = usersController;
