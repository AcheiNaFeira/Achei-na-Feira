const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const authRoutes = require('./routes/auth');
const feirasRoutes = require('./routes/feiras');
const produtosRoutes = require('./routes/produtos');
const convitesRoutes = require('./routes/convites');

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
        tipo VARCHAR(50) NOT NULL DEFAULT 'consumidor',
        precisa_trocar_senha BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Para atualizar as tabelas antigas que não tinham esses campos
    try {
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) NOT NULL DEFAULT 'consumidor';`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS precisa_trocar_senha BOOLEAN DEFAULT false;`);
    } catch (e) {
      // Ignora erro se coluna já existir em outros dialetos
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS feiras (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        local VARCHAR(255) NOT NULL,
        data DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fim TIME NOT NULL,
        descricao TEXT,
        organizador_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        preco DECIMAL(10,2) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        emoji VARCHAR(10),
        feirante_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS participacoes (
        id SERIAL PRIMARY KEY,
        feira_id INTEGER REFERENCES feiras(id) ON DELETE CASCADE,
        feirante_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(feira_id, feirante_id)
      );
    `);

    console.log('Tabelas verificadas/criadas com sucesso.');
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

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/feiras', feirasRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/convites', convitesRoutes);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
