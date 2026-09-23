require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcrypt');

async function run() {
  const hash = await bcrypt.hash('123456', 10);
  try {
    await db.query(
      "INSERT INTO users (nome, email, senha, tipo, precisa_trocar_senha) VALUES ('Org Teste', 'org@teste.com', $1, 'organizador', false) ON CONFLICT (email) DO NOTHING",
      [hash]
    );
    console.log('Organizador org@teste.com / 123456 criado');
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
