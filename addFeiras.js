
const fs = require('fs');
let content = fs.readFileSync('backend/controllers/usersController.js', 'utf8');
content = content.replace(/};\s*module\.exports = usersController;/, \
  ,
  async listarMinhasFeiras(req, res) {
    try {
      const db = require('../db');
      const result = await db.query(
        'SELECT f.* FROM feiras f JOIN participacoes p ON f.id = p.feira_id WHERE p.feirante_id = \ AND p.status = \\'aceito\\'',
        [req.user.id]
      );
      res.json(result.rows);
    } catch(err) { res.status(500).json({ error: 'Erro' }); }
  }
};
module.exports = usersController;
\);
fs.writeFileSync('backend/controllers/usersController.js', content);

