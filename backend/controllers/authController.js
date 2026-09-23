const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_temporaria';

const authController = {
  async criarFeirante(req, res) {
    const { nome, email } = req.body;
    
    // Gera uma senha provisória padrão
    const senhaProvisoria = 'Mudar123';

    try {
      const salt = await bcrypt.genSalt(10);
      const hashSenha = await bcrypt.hash(senhaProvisoria, salt);

      const result = await db.query(
        'INSERT INTO users (nome, email, senha, tipo, precisa_trocar_senha) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, tipo, precisa_trocar_senha',
        [nome, email, hashSenha, 'feirante', true]
      );

      res.status(201).json({ 
        message: 'Feirante criado!', 
        user: result.rows[0],
        senha_provisoria: senhaProvisoria 
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: 'E-mail já cadastrado.' });
      }
      console.error('Erro no criarFeirante:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  async login(req, res) {
    const { email, senha } = req.body;

    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }

      const user = result.rows[0];
      const validPass = await bcrypt.compare(senha, user.senha);
      if (!validPass) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }

      const token = jwt.sign(
        { id: user.id, tipo: user.tipo, precisa_trocar_senha: user.precisa_trocar_senha },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({
        message: 'Login bem-sucedido!',
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          precisa_trocar_senha: user.precisa_trocar_senha
        }
      });
    } catch (err) {
      console.error('Erro no login:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  async mudarSenha(req, res) {
    const { novaSenha } = req.body;
    const userId = req.user.id;

    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashSenha = await bcrypt.hash(novaSenha, salt);

      await db.query(
        'UPDATE users SET senha = $1, precisa_trocar_senha = false WHERE id = $2',
        [hashSenha, userId]
      );

      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = userResult.rows[0];

      const token = jwt.sign(
        { id: user.id, tipo: user.tipo, precisa_trocar_senha: user.precisa_trocar_senha },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({ message: 'Senha atualizada com sucesso!', token });
    } catch (err) {
      console.error('Erro no mudar-senha:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
};

module.exports = authController;
