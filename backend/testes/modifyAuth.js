const fs = require('fs');

let authController = fs.readFileSync('backend/controllers/authController.js', 'utf8');

const registerMethod = `
  async register(req, res) {
    const { nome, email, senha, tipo } = req.body;
    
    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    if (!['consumidor', 'feirante', 'organizador', 'admin'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido.' });
    }

    const status_aprovacao = tipo === 'organizador' ? 'pendente' : 'ativo';

    try {
      const salt = await bcrypt.genSalt(10);
      const hashSenha = await bcrypt.hash(senha, salt);

      const result = await db.query(
        'INSERT INTO users (nome, email, senha, tipo, status_aprovacao) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, tipo, status_aprovacao',
        [nome, email, hashSenha, tipo, status_aprovacao]
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
  },`;

authController = authController.replace('const authController = {', 'const authController = {' + registerMethod);

const loginCheck = `
      if (user.tipo === 'organizador' && user.status_aprovacao === 'pendente') {
        return res.status(403).json({ error: 'Sua conta de organizador aguarda aprovação de um administrador.' });
      }
`;

authController = authController.replace(
  'const token = jwt.sign(',
  loginCheck + '\n      const token = jwt.sign('
);

fs.writeFileSync('backend/controllers/authController.js', authController);

let authRoutes = fs.readFileSync('backend/routes/auth.js', 'utf8');
authRoutes = authRoutes.replace(
  "router.post('/login', authController.login);",
  "router.post('/register', authController.register);\nrouter.post('/login', authController.login);"
);
fs.writeFileSync('backend/routes/auth.js', authRoutes);
