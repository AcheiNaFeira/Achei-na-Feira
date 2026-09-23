import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button, Logo } from '../components/Shared';
import api from '../api';

export function NovaSenha() { 
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.put('/auth/mudar-senha', { novaSenha });
      localStorage.setItem('token', res.data.token);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.precisa_trocar_senha = false;
      localStorage.setItem('user', JSON.stringify(user));
      
      navigate(`/${user.tipo}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao mudar senha');
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-aside">
        <Logo />
        <div>
          <span className="kicker">SEGURANÇA</span>
          <h1>Atualize sua<br /><em>senha.</em></h1>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <span className="kicker">PRIMEIRO ACESSO</span>
          <h1>Cadastre sua senha definitiva</h1>
          <p>Para sua segurança, defina uma nova senha para acessar o painel.</p>
          {error && <p style={{color: 'red'}}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <label>Nova Senha
              <input type="password" required minLength={6} value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
            </label>
            <Button type="submit">Salvar Senha <ArrowRight size={16} /></Button>
          </form>
        </div>
      </div>
    </main>
  );
}
