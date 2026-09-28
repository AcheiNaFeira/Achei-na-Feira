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
    categoria: 'Frutas & Verduras'
  });
  const [imagem, setImagem] = useState<File | null>(null);

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
    if (!imagem) return alert('Por favor, envie uma imagem do produto.');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      data.append('imagem', imagem);

      await api.post('/produtos', data, { headers: { 'Content-Type': 'multipart/form-data' }});
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
          <label>Foto do Produto (Obrigatório)
            <input type="file" required accept="image/*" onChange={handleImage} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4, background: '#fff'}} />
          </label>
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
          <label>Descrição Detalhada
            <textarea name="descricao" rows={4} value={formData.descricao} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
          </label>
          <Button type="submit"><Save size={16} /> Salvar Produto</Button>
        </form>
      </div>
    </Shell>
  );
}
