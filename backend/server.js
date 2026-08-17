const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Criar tabela de usuários (Apenas para garantir que o banco funciona)
const initDb = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela de usuários verificada/criada.');
  } catch (err) {
    console.error('Erro ao inicializar o banco:', err);
  }
};

// Inicializa o banco de dados
initDb();

// Rotas de Exemplo
app.get('/', (req, res) => {
  res.send('API do Achei na Feira rodando com sucesso! 🚀');
});

// Endpoint de teste de Login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  // Isso é apenas um mock inicial integrado ao banco
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }
    
    const user = result.rows[0];
    if (user.senha === senha) {
      return res.json({ message: 'Login bem-sucedido!', user: { id: user.id, nome: user.nome, email: user.email } });
    } else {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Endpoint de teste de Cadastro
app.post('/api/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO users (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, senha]
    );
    res.status(201).json({ message: 'Usuário criado!', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // Violação de constraint unique
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
