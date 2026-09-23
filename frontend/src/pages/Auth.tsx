import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, Logo } from '../components/Shared';
import api from '../api';

export function Auth() { 
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, senha });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      if (user.precisa_trocar_senha) {
        navigate('/nova-senha');
      } else {
        navigate(`/${user.tipo}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro na autenticação');
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-aside">
        <Logo />
        <div>
          <span className="kicker">COMPRA LOCAL, VIDA REAL</span>
          <h1>O melhor da cidade<br /><em>começa perto.</em></h1>
          <p>Faça parte de uma comunidade que valoriza quem produz e quem escolhe consumir local.</p>
        </div>
        <span className="auth-caption">Joinville, SC · 2024</span>
      </div>
      <div className="auth-form-wrap">
        <button className="back-link" onClick={() => navigate('/')}><ArrowLeft size={16} /> Voltar</button>
        <div className="auth-form">
          <span className="kicker">QUE BOM TER VOCÊ AQUI</span>
          <h1>Entre na sua conta.</h1>
          {error && <p style={{color: 'red'}}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <label>Seu e-mail
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label>Senha
              <input type="password" required value={senha} onChange={e => setSenha(e.target.value)} />
            </label>
            <Button type="submit">Entrar <ArrowRight size={16} /></Button>
          </form>
        </div>
      </div>
    </main>
  );
}
