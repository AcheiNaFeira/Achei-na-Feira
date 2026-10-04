require('dotenv').config({ path: '../.env' });
const db = require('../db');
const bcrypt = require('bcrypt');

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Uso: node createOrganizer.js <Nome> <Email> <Senha_Temporaria>');
  process.exit(1);
}

const [nome, email, senha] = args;

async function createOrganizer() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(senha, salt);

    const result = await db.query(
      'INSERT INTO users (nome, email, senha, tipo, precisa_trocar_senha) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, tipo',
      [nome, email, hashSenha, 'organizador', true]
    );

    console.log('✅ Organizador criado com sucesso!');
    console.log(result.rows[0]);
    console.log('⚠️ Informe o email e a senha temporária para o organizador. Ele deverá trocar a senha no primeiro acesso.');
  } catch (err) {
    if (err.code === '23505') {
      console.error('❌ Erro: Este e-mail já está em uso.');
    } else {
      console.error('❌ Erro ao criar organizador:', err);
    }
  } finally {
    process.exit(0);
  }
}

createOrganizer();
