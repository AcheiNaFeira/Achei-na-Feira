import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, CheckCircle, Link2, MapPin, Tent } from 'lucide-react';
import { Button, Shell } from '../components/Shared';
import api, { formatDateBR, getImageUrl } from '../api';

export function ConviteLink() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [feira, setFeira] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [aceitando, setAceitando] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    api.get(`/convites/link/${token}`)
      .then(res => {
        setFeira(res.data);
        setLoading(false);
      })
      .catch(err => {
        setErro(err.response?.data?.error || 'Link de convite inválido ou expirado.');
        setLoading(false);
      });
  }, [token]);

  const handleAceitar = async () => {
    if (!user) {
      navigate(`/login?redirect=/convite/${token}`);
      return;
    }

    setAceitando(true);
    try {
      await api.post(`/convites/link/${token}/aceitar`);
      alert(`Parabéns! Sua participação na feira "${feira.nome}" foi confirmada!`);
      navigate('/feirante');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao aceitar convite.');
    } finally {
      setAceitando(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>Carregando convite...</div>
      </Shell>
    );
  }

  if (erro || !feira) {
    return (
      <Shell>
        <div className="panel" style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center', padding: 40 }}>
          <Tent size={42} color="#ef4444" style={{ margin: '0 auto 15px' }} />
          <h2>Convite Indisponível</h2>
          <p style={{ color: '#64748b', marginBottom: 25 }}>{erro}</p>
          <Button onClick={() => navigate('/')}>Voltar para o Início</Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ maxWidth: 580, margin: '50px auto', padding: '0 20px' }}>
        <div className="panel" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
          <div
            style={
              feira.imagem_url
                ? { backgroundImage: `url(${getImageUrl(feira.imagem_url)})`, backgroundSize: 'cover', backgroundPosition: 'center', height: 200 }
                : { background: 'linear-gradient(135deg, #f97316, #ea580c)', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }
            }
          >
            {!feira.imagem_url && <Tent size={56} />}
          </div>

          <div style={{ padding: 30 }}>
            <span className="kicker" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Link2 size={14} /> CONVITE OFICIAL PARA FEIRANTE
            </span>
            <h1 style={{ marginTop: 8, marginBottom: 10 }}>{feira.nome}</h1>
            {feira.organizador_nome && (
              <p style={{ color: '#64748b', fontSize: 14, marginTop: 0 }}>
                Organizado por <b>{feira.organizador_nome}</b>
              </p>
            )}

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155', fontSize: 14 }}>
                <CalendarDays size={16} color="#f97316" />
                <span><b>{formatDateBR(feira.data)}</b> • {feira.hora_inicio} às {feira.hora_fim}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155', fontSize: 14 }}>
                <MapPin size={16} color="#f97316" />
                <span>{feira.endereco_completo || feira.local}</span>
              </div>
            </div>

            {feira.descricao && (
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, marginBottom: 25 }}>
                {feira.descricao}
              </p>
            )}

            {!user && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0, textAlign: 'center' }}>
                  Faça login ou crie sua conta de <b>Feirante</b> para vincular seus produtos a esta feira automaticamente.
                </p>
                <Button onClick={() => navigate(`/login?redirect=/convite/${token}`)} style={{ width: '100%', justifyContent: 'center' }}>
                  Entrar / Cadastrar para Aceitar Convite
                </Button>
              </div>
            )}

            {user && user.tipo === 'feirante' && (
              <Button onClick={handleAceitar} style={{ width: '100%', justifyContent: 'center' }}>
                <CheckCircle size={18} /> {aceitando ? 'Confirmando...' : 'Aceitar Convite e Participar da Feira'}
              </Button>
            )}

            {user && user.tipo !== 'feirante' && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: 14, borderRadius: 8, textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: '#9a3412' }}>
                  Você está conectado como <b>{user.tipo}</b>. Apenas contas de <b>Feirante</b> podem aceitar este convite.
                </p>
                <Button variant="outline" onClick={() => navigate(`/feira/${feira.id}`)}>
                  Ver Página da Feira
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
