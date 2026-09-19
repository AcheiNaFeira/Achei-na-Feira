const roleMiddleware = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !req.user.tipo) {
      return res.status(401).json({ error: 'Usuário não autenticado ou sem permissão.' });
    }

    if (!rolesPermitidos.includes(req.user.tipo)) {
      return res.status(403).json({ error: 'Acesso negado para este perfil.' });
    }

    // Se for organizador e ainda precisar trocar senha, bloquear acesso a outras rotas 
    // a menos que seja a própria rota de trocar senha
    if (req.user.precisa_trocar_senha && req.path !== '/mudar-senha') {
       return res.status(403).json({ error: 'É necessário trocar a senha antes de acessar os recursos.' });
    }

    next();
  };
};

module.exports = roleMiddleware;
