import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Shell } from '../components/Shared';
import api from '../api';

export function EditarFeira() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    local: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    descricao: '',
    endereco_completo: ''
  });
  const [imagem, setImagem] = useState<File | null>(null);

  useEffect(() => {
    api.get(`/feiras/${id}`).then(res => {
      const f = res.data;
      setFormData({
        nome: f.nome || '',
        local: f.local || '',
        data: f.data ? f.data.split('T')[0] : '',
        hora_inicio: f.hora_inicio || '',
        hora_fim: f.hora_fim || '',
        descricao: f.descricao || '',
        endereco_completo: f.endereco_completo || ''
      });
    }).catch(console.error);
  }, [id]);

  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleImage = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setImagem(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      if (imagem) {
        data.append('imagem', imagem);
      }

      await api.put(`/feiras/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
      alert('Feira atualizada com sucesso!');
      navigate('/organizador');
    } catch (err) {
      alert('Erro ao atualizar feira');
    }
  };

  return (
    <Shell>
      <div style={{maxWidth: 600, margin: '40px auto'}}>
        <button className="back-link" onClick={() => navigate('/organizador')}><ArrowLeft size={16} /> Voltar</button>
        <h1 style={{marginTop: 20}}>Editar Feira</h1>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 15, marginTop: 20}}>
          <label>Foto de Capa da Feira (Opcional)
            <input type="file" accept="image/*" onChange={handleImage} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4, background: '#fff'}} />
            <small style={{color: '#666', display: 'block', marginTop: 4}}>Envie uma nova imagem para substituir a atual.</small>
          </label>
          <label>Nome da Feira
            <input name="nome" required value={formData.nome} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
          </label>
          <label>Cidade / Local resumido
            <input name="local" required placeholder="Ex: Praça da Matriz" value={formData.local} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
          </label>
          <label>Endereço Completo (para GPS)
            <input name="endereco_completo" required placeholder="Rua, Número, CEP, Cidade" value={formData.endereco_completo} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
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
          <Button type="submit"><Save size={16} /> Salvar Alterações</Button>
        </form>
      </div>
    </Shell>
  );
}
