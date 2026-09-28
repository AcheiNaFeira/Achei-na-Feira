const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const db = require('./db');
const authRoutes = require('./routes/auth');
const feirasRoutes = require('./routes/feiras');
const produtosRoutes = require('./routes/produtos');
const convitesRoutes = require('./routes/convites');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Contador de Views Diário
app.post('/api/visita', async (req, res) => {
  try {
    await db.query(`
      INSERT INTO analytics_daily (data, views) 
      VALUES (CURRENT_DATE, 1) 
      ON CONFLICT (data) DO UPDATE SET views = analytics_daily.views + 1
    `);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar visita' });
  }
});

// Criar tabelas e setup inicial
const initDb = async () => {
  try {
    await db.query('CREATE TABLE IF NOT EXISTS analytics_daily (data DATE PRIMARY KEY, views INTEGER DEFAULT 0)');
    await db.query('CREATE TABLE IF NOT EXISTS likes_log (id SERIAL PRIMARY KEY, tipo VARCHAR(20), item_id INTEGER, ip VARCHAR(45), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        tipo VARCHAR(50) NOT NULL DEFAULT 'consumidor',
        precisa_trocar_senha BOOLEAN DEFAULT false,
        status_aprovacao VARCHAR(20) DEFAULT 'ativo',
        whatsapp VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Para atualizar as tabelas antigas que não tinham esses campos
    try {
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) NOT NULL DEFAULT 'consumidor';`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS precisa_trocar_senha BOOLEAN DEFAULT false;`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status_aprovacao VARCHAR(20) DEFAULT 'ativo';`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);`);
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
        imagem_url TEXT,
        organizador_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    try {
      await db.query(`ALTER TABLE feiras ADD COLUMN IF NOT EXISTS imagem_url TEXT;`);
      await db.query(`ALTER TABLE feiras ADD COLUMN IF NOT EXISTS endereco_completo TEXT;`);
      await db.query(`ALTER TABLE feiras ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;`);
    } catch (e) {}

    await db.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        preco DECIMAL(10,2) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        emoji VARCHAR(10),
        imagem_url TEXT,
        feirante_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Para atualizar as tabelas antigas que não tinham a imagem
    try {
      await db.query(`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS imagem_url TEXT;`);
      await db.query(`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;`);
    } catch (e) {}

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
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
