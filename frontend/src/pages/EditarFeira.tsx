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
    cidade: '',
    estado: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    descricao: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: ''
  });
  const [imagem, setImagem] = useState<File | null>(null);

  useEffect(() => {
    api.get(`/feiras/${id}`).then(res => {
      const f = res.data;
      let cep = '', rua = '', numero = '', bairro = '';
      let cidade = '', estado = '';
      
      if (f.local) {
        if (f.local.includes(' - ')) {
          const parts = f.local.split(' - ');
          cidade = parts[0]?.trim() || '';
          estado = parts[1]?.trim() || '';
        } else {
          cidade = f.local.trim();
        }
      }

      if (f.endereco_completo) {
        // Tenta formato completo: "Rua, Numero - Bairro, Cidade - UF, CEP: 00000-000"
        const matchNovo = f.endereco_completo.match(/(.+),\s*(.+)\s*-\s*(.+),\s*(.+)\s*-\s*(.+),\s*CEP:\s*(.+)/);
        if (matchNovo) {
          rua = matchNovo[1]?.trim() || '';
          numero = matchNovo[2]?.trim() || '';
          bairro = matchNovo[3]?.trim() || '';
          if (!cidade) cidade = matchNovo[4]?.trim() || '';
          if (!estado) estado = matchNovo[5]?.trim() || '';
          cep = matchNovo[6]?.trim() || '';
        } else {
          // Tenta formato anterior: "Rua, Numero - Bairro, CEP: 00000-000"
          const matchAntigo = f.endereco_completo.match(/(.+),\s*(.+)\s*-\s*(.+),\s*CEP:\s*(.+)/);
          if (matchAntigo) {
            rua = matchAntigo[1]?.trim() || '';
            numero = matchAntigo[2]?.trim() || '';
            bairro = matchAntigo[3]?.trim() || '';
            cep = matchAntigo[4]?.trim() || '';
          }
        }
      }

      setFormData({
        nome: f.nome || '',
        cidade: cidade,
        estado: estado,
        data: f.data ? f.data.split('T')[0] : '',
        hora_inicio: f.hora_inicio || '',
        hora_fim: f.hora_fim || '',
        descricao: f.descricao || '',
        cep: cep,
        rua: rua,
        numero: numero,
        bairro: bairro
      });
    }).catch(console.error);
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const finalValue = name === 'estado' ? value.toUpperCase() : value;
    setFormData(prev => ({...prev, [name]: finalValue}));
    
    if (name === 'cep' && value.replace(/\D/g, '').length === 8) {
      buscarCep(value);
    }
  };

  const buscarCep = async (cepStr: string) => {
    const limpo = cepStr.replace(/\D/g, '');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          rua: data.logradouro || prev.rua,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP", err);
    }
  };

  const handleImage = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setImagem(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (formData.data) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const selectedDate = new Date(formData.data + 'T00:00:00');
      
      if (selectedDate < today) {
        return alert('Esta data já passou.');
      }
      
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() + 5);
      if (selectedDate > maxDate) {
        return alert('A feira pode ser registrada no máximo até 5 anos para frente.');
      }
    }

    try {
      const local = formData.estado ? `${formData.cidade} - ${formData.estado}` : formData.cidade;
      const endereco_completo = `${formData.rua}, ${formData.numero} - ${formData.bairro}, ${local}, CEP: ${formData.cep}`;
      const payload = { ...formData, local, endereco_completo };
      
      const data = new FormData();
      Object.entries(payload).forEach(([key, val]) => {
        if (!['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'local', 'endereco_completo'].includes(key)) {
          data.append(key, val as string);
        }
      });
      data.append('local', local);
      data.append('endereco_completo', endereco_completo);

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
            <small style={{color: '#666', display: 'block', marginTop: 4}}>Se enviar uma nova foto, substituirá a anterior.</small>
          </label>
          <label>Nome da Feira
            <input name="nome" required value={formData.nome} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
          </label>
          
          <div style={{display: 'flex', gap: 15, flexWrap: 'wrap'}}>
            <label style={{flex: '1.2 1 120px'}}>CEP
              <input name="cep" required placeholder="Ex: 00000-000" value={formData.cep} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
            </label>
            <label style={{flex: '2 1 180px'}}>Cidade
              <input name="cidade" required placeholder="Ex: Joinville" value={formData.cidade} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
            </label>
            <label style={{flex: '0.8 1 80px'}}>Estado
              <input name="estado" required placeholder="UF" maxLength={2} value={formData.estado} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4, textTransform: 'uppercase'}} />
            </label>
          </div>

          <div style={{display: 'flex', gap: 15}}>
            <label style={{flex: 2}}>Rua
              <input name="rua" required placeholder="Ex: Rua XV de Novembro" value={formData.rua} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
            </label>
            <label style={{flex: 1}}>Número
              <input name="numero" required placeholder="Ex: 123" value={formData.numero} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
            </label>
          </div>
          
          <label>Bairro
            <input name="bairro" required placeholder="Ex: Centro" value={formData.bairro} onChange={handleChange} style={{width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4}} />
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
