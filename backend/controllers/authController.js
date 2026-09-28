const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_temporaria';

const authController = {
  async register(req, res) {
    const { nome, email, senha, tipo, whatsapp } = req.body;
    
    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    if (!['feirante', 'organizador', 'admin'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido.' });
    }

    const status_aprovacao = tipo === 'organizador' ? 'pendente' : 'ativo';

    try {
      const salt = await bcrypt.genSalt(10);
      const hashSenha = await bcrypt.hash(senha, salt);

      const result = await db.query(
        'INSERT INTO users (nome, email, senha, tipo, status_aprovacao, whatsapp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nome, email, tipo, status_aprovacao',
        [nome, email, hashSenha, tipo, status_aprovacao, whatsapp]
      );

      res.status(201).json({ 
        message: 'Usuário registrado com sucesso!', 
        user: result.rows[0]
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: 'E-mail já cadastrado.' });
      }
      console.error('Erro no register:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },
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

      if (user.tipo === 'organizador' && user.status_aprovacao === 'pendente') {
        return res.status(403).json({ error: 'Sua conta de organizador aguarda aprovação de um administrador.' });
      }

      if (user.status_aprovacao === 'banido') {
        return res.status(403).json({ error: 'Sua conta foi desativada pelo administrador.' });
      }

      const token = jwt.sign(
        { id: user.id, tipo: user.tipo, precisa_trocar_senha: user.precisa_trocar_senha },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
      res.json({
        message: 'Login bem-sucedido!',
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

      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
      res.json({ message: 'Senha atualizada com sucesso!' });
    } catch (err) {
      console.error('Erro no mudar-senha:', err);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
,
  async logout(req, res) {
    res.clearCookie('token');
    res.json({ message: 'Logout bem-sucedido!' });
  },
  async me(req, res) {
    try {
      const result = await db.query('SELECT id, nome, email, tipo, precisa_trocar_senha, whatsapp FROM users WHERE id = $1', [req.user.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
      res.json({ user: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
};

module.exports = authController;
