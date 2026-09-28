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
  const [imagens, setImagens] = useState<File[]>([]);

  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleImages = (e: any) => {
    if (e.target.files) {
      setImagens(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (imagens.length === 0) return alert('Por favor, envie ao menos uma imagem do produto.');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      
      // Append all images
      imagens.forEach(img => {
        data.append('imagens', img);
      });

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
          <label>Fotos do Produto (Pode selecionar várias)
            <input type="file" multiple accept="image/*" onChange={handleImages} required />
          </label>
          <small style={{color: '#64748b', marginTop: -10}}>Selecione até 5 fotos para criar um carrossel na página do produto.</small>

          <label>Nome do produto
            <input type="text" name="nome" placeholder="Ex: Tomate Carmem" value={formData.nome} onChange={handleChange} required />
          </label>
          <label>Descrição
            <textarea name="descricao" placeholder="Detalhes do produto, cultivo, etc." value={formData.descricao} onChange={handleChange} />
          </label>
          <div style={{display: 'flex', gap: 15}}>
            <label style={{flex: 1}}>Preço (R$)
              <input type="number" step="0.01" name="preco" placeholder="0.00" value={formData.preco} onChange={handleChange} required />
            </label>
            <label style={{flex: 1}}>Categoria
              <select name="categoria" value={formData.categoria} onChange={handleChange}>
                <option>Frutas & Verduras</option>
                <option>Orgânicos</option>
                <option>Artesanato</option>
                <option>Flores</option>
                <option>Alimentos Prontos</option>
                <option>Laticínios</option>
                <option>Colecionáveis</option>
                <option>Roupas</option>
              </select>
            </label>
          </div>
          
          <Button type="submit"><Save size={16} /> Salvar Produto</Button>
        </form>
      </div>
    </Shell>
  );
}
