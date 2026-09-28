import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, Logo } from '../components/Shared';
import api from '../api';

export function Auth() { 
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [tipo, setTipo] = useState('feirante');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, senha });
        const { user } = res.data;
        localStorage.setItem('user', JSON.stringify(user));
        
        if (user.precisa_trocar_senha) {
          navigate('/nova-senha');
        } else {
          navigate(`/${user.tipo}`);
        }
      } else {
        await api.post('/auth/register', { nome, email, senha, tipo, whatsapp });
        setSuccess('Cadastro realizado! Faça login para continuar.');
        setIsLogin(true);
        setSenha('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro na operação');
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
          <h1>{isLogin ? 'Entre na sua conta.' : 'Crie sua conta.'}</h1>
          
          {error && <p style={{color: 'red', marginBottom: 10}}>{error}</p>}
          {success && <p style={{color: 'green', marginBottom: 10}}>{success}</p>}
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <label>Seu nome
                  <input type="text" required value={nome} onChange={e => setNome(e.target.value)} />
                </label>
                <label>WhatsApp
                  <input type="text" placeholder="(DD) 99999-9999" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                </label>
              </>
            )}
            
            <label>Seu e-mail
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label>Senha
              <input type="password" required value={senha} onChange={e => setSenha(e.target.value)} />
            </label>
            
            {!isLogin && (
              <label>Perfil
                <select value={tipo} onChange={e => setTipo(e.target.value)} style={{padding: '10px', borderRadius: '4px', border: '1px solid #dbe4da', width: '100%'}}>
                  <option value="feirante">Feirante (Vender produtos)</option>
                  <option value="organizador">Organizador (Criar feiras)</option>
                </select>
              </label>
            )}
            
            <Button type="submit">{isLogin ? 'Entrar' : 'Cadastrar'} <ArrowRight size={16} /></Button>
          </form>
          
          <button 
            type="button" 
            className="text-link" 
            style={{marginTop: 20}} 
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
          >
            {isLogin ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </div>
      </div>
    </main>
  );
}
