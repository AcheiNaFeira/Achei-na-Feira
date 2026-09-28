
const fs = require('fs');
let content = fs.readFileSync('backend/controllers/convitesController.js', 'utf8');
content = content.replace(/};\s*module\.exports = convitesController;/, \
  ,
  async removerParticipante(req, res) {
    const { feira_id, feirante_id } = req.params;
    const organizador_id = req.user.id;
    try {
      const db = require('../db');
      const verificaFeira = await db.query('SELECT id FROM feiras WHERE id = \ AND organizador_id = \', [feira_id, organizador_id]);
      if (verificaFeira.rows.length === 0) return res.status(403).json({ error: 'Acesso negado' });
      await db.query('DELETE FROM participacoes WHERE feira_id = \ AND feirante_id = \', [feira_id, feirante_id]);
      res.json({ message: 'Participante removido' });
    } catch(err) { res.status(500).json({ error: 'Erro' }); }
  },

  async sairDaFeira(req, res) {
    const { feira_id } = req.params;
    const feirante_id = req.user.id;
    try {
      const db = require('../db');
      await db.query('DELETE FROM participacoes WHERE feira_id = \ AND feirante_id = \', [feira_id, feirante_id]);
      res.json({ message: 'Você saiu da feira' });
    } catch(err) { res.status(500).json({ error: 'Erro' }); }
  }
};
module.exports = convitesController;
\);
fs.writeFileSync('backend/controllers/convitesController.js', content);

