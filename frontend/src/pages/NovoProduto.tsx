import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Shell } from '../components/Shared';
import api from '../api';

export function NovoProduto() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: 'Frutas & Verduras',
    emoji: '🍎',
    imagem_url: ''
  });

  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/produtos', formData);
      alert('Produto cadastrado com sucesso!');
      navigate('/feirante');
    } catch (err) {
      alert('Erro ao cadastrar produto');
    }
  };

  return (
    <Shell>
      <div style={{maxWidth: 600, margin: '40px auto'}}>
        <button className="back-link" onClick={() => navigate('/feirante')}><ArrowLeft size={16} /> Voltar</button>
        <h1 style={{marginTop: 20}}>Novo Produto</h1>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 15, marginTop: 20}}>
          <label>Nome do Produto
            <input name="nome" required value={formData.nome} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
          </label>
          <div style={{display: 'flex', gap: 15}}>
            <label style={{flex: 1}}>Preço (R$)
              <input type="number" step="0.01" name="preco" required value={formData.preco} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
            </label>
            <label style={{flex: 1}}>Categoria
              <select name="categoria" value={formData.categoria} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}}>
                <option>Frutas & Verduras</option>
                <option>Orgânicos</option>
                <option>Artesanato</option>
                <option>Flores</option>
                <option>Alimentos</option>
                <option>Laticínios</option>
              </select>
            </label>
          </div>
          <div style={{display: 'flex', gap: 15}}>
            <label style={{flex: 1}}>URL da Foto/Imagem
              <input type="url" name="imagem_url" placeholder="https://..." value={formData.imagem_url} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
            </label>
            <label style={{width: 100}}>Emoji
              <input name="emoji" value={formData.emoji} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
            </label>
          </div>
          <label>Descrição Detalhada
            <textarea name="descricao" rows={4} value={formData.descricao} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
          </label>
          <Button type="submit"><Save size={16} /> Salvar Produto</Button>
        </form>
      </div>
    </Shell>
  );
}
