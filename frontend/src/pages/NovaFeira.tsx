import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Logo, Shell } from '../components/Shared';
import api from '../api';

export function NovaFeira() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    local: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    descricao: ''
  });

  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/feiras', formData);
      alert('Feira criada com sucesso!');
      navigate('/organizador');
    } catch (err) {
      alert('Erro ao criar feira');
    }
  };

  return (
    <Shell>
      <div style={{maxWidth: 600, margin: '40px auto'}}>
        <button className="back-link" onClick={() => navigate('/organizador')}><ArrowLeft size={16} /> Voltar</button>
        <h1 style={{marginTop: 20}}>Nova Feira</h1>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 15, marginTop: 20}}>
          <label>Nome da Feira
            <input name="nome" required value={formData.nome} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
          </label>
          <label>Endereço / Local
            <input name="local" required value={formData.local} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
          </label>
          <label>Data
            <input type="date" name="data" required value={formData.data} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
          </label>
          <div style={{display: 'flex', gap: 15}}>
            <label style={{flex: 1}}>Hora de Início
              <input type="time" name="hora_inicio" required value={formData.hora_inicio} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
            </label>
            <label style={{flex: 1}}>Hora de Fim
              <input type="time" name="hora_fim" required value={formData.hora_fim} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
            </label>
          </div>
          <label>Descrição
            <textarea name="descricao" rows={4} value={formData.descricao} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
          </label>
          <Button type="submit"><Save size={16} /> Salvar Feira</Button>
        </form>
      </div>
    </Shell>
  );
}
