import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Shell } from '../components/Shared';
import api, { getImageUrl } from '../api';

export function EditarProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: 'Frutas & Verduras'
  });
  const [imagensAtuais, setImagensAtuais] = useState<string[]>([]);
  const [novasImagens, setNovasImagens] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/produtos/${id}`)
      .then(res => {
        const prod = res.data;
        setFormData({
          nome: prod.nome || '',
          descricao: prod.descricao || '',
          preco: prod.preco || '',
          categoria: prod.categoria === 'Alimentos Prontos' ? 'Alimentos' : (prod.categoria || 'Frutas & Verduras')
        });
        if (prod.imagem_url) {
          setImagensAtuais(prod.imagem_url.split(','));
        }
        setLoading(false);
      })
      .catch(() => {
        alert('Erro ao carregar dados do produto.');
        navigate('/feirante');
      });
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNovasImagens(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));

      novasImagens.forEach(img => {
        data.append('imagens', img);
      });

      await api.put(`/produtos/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Produto atualizado com sucesso!');
      navigate('/feirante');
    } catch (err) {
      alert('Erro ao atualizar produto.');
    }
  };

  if (loading) {
    return <Shell><div style={{ padding: 40, textAlign: 'center' }}>Carregando produto...</div></Shell>;
  }

  return (
    <Shell>
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <button className="back-link" onClick={() => navigate('/feirante')}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <h1 style={{ marginTop: 20 }}>Editar Produto</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 20 }}>
          {imagensAtuais.length > 0 && novasImagens.length === 0 && (
            <div>
              <span style={{ fontSize: 14, color: '#475569', display: 'block', marginBottom: 8 }}>Fotos atuais:</span>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
                {imagensAtuais.map((img, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(img)}
                    alt="Foto atual"
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                ))}
              </div>
            </div>
          )}

          <label>Substituir Fotos do Produto (Opcional)
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImages}
              style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }}
            />
          </label>
          <small style={{ color: '#64748b', marginTop: -10 }}>
            Deixe em branco para manter as fotos atuais ou selecione até 5 novas fotos.
          </small>

          <label>Nome do produto
            <input
              type="text"
              name="nome"
              placeholder="Ex: Tomate Carmem"
              value={formData.nome}
              onChange={handleChange}
              required
              style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </label>

          <label>Descrição
            <textarea
              name="descricao"
              placeholder="Detalhes do produto, cultivo, etc."
              value={formData.descricao}
              onChange={handleChange}
              style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
            />
          </label>

          <div style={{ display: 'flex', gap: 15 }}>
            <label style={{ flex: 1 }}>Preço (R$)
              <input
                type="number"
                step="0.01"
                name="preco"
                placeholder="0.00"
                value={formData.preco}
                onChange={handleChange}
                required
                style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </label>
            <label style={{ flex: 1 }}>Categoria
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }}
              >
                <option>Frutas & Verduras</option>
                <option>Orgânicos</option>
                <option>Artesanato</option>
                <option>Flores</option>
                <option>Alimentos</option>
                <option>Laticínios</option>
                <option>Colecionáveis</option>
                <option>Roupas</option>
              </select>
            </label>
          </div>

          <Button type="submit"><Save size={16} /> Salvar Alterações</Button>
        </form>
      </div>
    </Shell>
  );
}
