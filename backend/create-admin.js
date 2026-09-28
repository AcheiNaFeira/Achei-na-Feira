require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const hash = await bcrypt.hash('admin123', 10);
  try {
    await db.query(
      `INSERT INTO users (nome, email, senha, tipo, status_aprovacao, precisa_trocar_senha) 
       VALUES ('Administrador', 'admin@acheinafeira.com', $1, 'admin', 'ativo', false) 
       ON CONFLICT (email) DO UPDATE SET tipo = 'admin', status_aprovacao = 'ativo'`,
      [hash]
    );
    console.log('Admin configurado: admin@acheinafeira.com / admin123');
  } catch (err) {
    console.error('Erro ao criar admin:', err);
  } finally {
    process.exit(0);
  }
}

createAdmin();
