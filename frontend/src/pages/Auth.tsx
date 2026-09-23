import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, Logo } from '../components/Shared';
import api from '../api';

export function Auth({ signup = false }: { signup?: boolean }) { 
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('consumidor');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (signup) {
        await api.post('/auth/register', { nome, email, senha, tipo });
        navigate('/login');
      } else {
        const res = await api.post('/auth/login', { email, senha });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        if (user.precisa_trocar_senha) {
          navigate('/nova-senha');
        } else {
          navigate(`/${user.tipo}`);
        }
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
          <span className="kicker">COMIDA LOCAL, VIDA REAL</span>
          <h1>O melhor da cidade<br /><em>começa perto.</em></h1>
        </div>
      </div>
      <div className="auth-form-wrap">
        <button className="back-link" onClick={() => navigate('/')}><ArrowLeft size={16} /> Voltar</button>
        <div className="auth-form">
          <span className="kicker">{signup ? 'BEM-VINDO' : 'QUE BOM TER VOCÊ AQUI'}</span>
          <h1>{signup ? 'Crie sua conta.' : 'Entre na sua conta.'}</h1>
          {error && <p style={{color: 'red'}}>{error}</p>}
          <form onSubmit={handleSubmit}>
            {signup && (
              <label>Seu nome
                <input required value={nome} onChange={e => setNome(e.target.value)} />
              </label>
            )}
            <label>Seu e-mail
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            {signup && (
              <label>Como você quer usar?
                <select value={tipo} onChange={e => setTipo(e.target.value)}>
                  <option value="consumidor">Quero encontrar produtos</option>
                  <option value="feirante">Quero vender produtos</option>
                </select>
              </label>
            )}
            <label>Senha
              <input type="password" required value={senha} onChange={e => setSenha(e.target.value)} />
            </label>
            <Button type="submit">{signup ? 'Criar minha conta' : 'Entrar'} <ArrowRight size={16} /></Button>
          </form>
          <div className="auth-switch">
            <button onClick={() => navigate(signup ? '/login' : '/cadastro')}>{signup ? 'Ir para Login' : 'Criar conta'}</button>
          </div>
        </div>
      </div>
    </main>
  );
}
