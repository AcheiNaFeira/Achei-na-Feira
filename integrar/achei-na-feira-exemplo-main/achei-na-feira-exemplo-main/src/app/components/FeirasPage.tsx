import { useState } from 'react';
import { MapPin, Calendar, Star, Filter, Clock, Phone, Navigation } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function FeirasPage() {
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroDia, setFiltroDia] = useState('todos');

  const feiras = [
    {
      id: 1,
      nome: 'Feira Orgânica da Praça',
      local: 'Praça Central, Centro',
      dia: 'Sábado',
      horario: '7h às 14h',
      avaliacao: 4.8,
      avaliacoes: 156,
      categoria: 'Orgânico',
      descricao: 'Produtos 100% orgânicos certificados, direto do produtor.',
      imagem: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop',
      distancia: '1.2 km',
      telefone: '(11) 98765-1234'
    },
    {
      id: 2,
      nome: 'Feira do Produtor Rural',
      local: 'Av. Principal, Bairro Novo',
      dia: 'Quarta',
      horario: '6h às 13h',
      avaliacao: 4.6,
      avaliacoes: 203,
      categoria: 'Produtos Frescos',
      descricao: 'Frutas, verduras, legumes frescos colhidos diariamente.',
      imagem: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
      distancia: '2.8 km',
      telefone: '(11) 98765-5678'
    },
    {
      id: 3,
      nome: 'Feira de Artesanato',
      local: 'Parque Municipal',
      dia: 'Domingo',
      horario: '8h às 18h',
      avaliacao: 4.9,
      avaliacoes: 342,
      categoria: 'Artesanato',
      descricao: 'Artesanato local, peças únicas feitas à mão.',
      imagem: 'https://images.unsplash.com/photo-1523438097201-512ae7d59c44?w=400&h=300&fit=crop',
      distancia: '3.5 km',
      telefone: '(11) 98765-7890'
    },
    {
      id: 4,
      nome: 'Feira Livre do Bairro Alto',
      local: 'Rua das Flores, Bairro Alto',
      dia: 'Terça',
      horario: '6h às 12h',
      avaliacao: 4.4,
      avaliacoes: 89,
      categoria: 'Produtos Frescos',
      descricao: 'Variedade de produtos frescos com preços acessíveis.',
      imagem: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&h=300&fit=crop',
      distancia: '4.1 km',
      telefone: '(11) 98765-4321'
    },
    {
      id: 5,
      nome: 'Feira de Flores',
      local: 'Centro de Eventos',
      dia: 'Sexta',
      horario: '7h às 15h',
      avaliacao: 4.7,
      avaliacoes: 127,
      categoria: 'Flores',
      descricao: 'Flores frescas, plantas ornamentais e arranjos.',
      imagem: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop',
      distancia: '1.9 km',
      telefone: '(11) 98765-3456'
    },
    {
      id: 6,
      nome: 'Feira Gastronômica',
      local: 'Praça da Alimentação',
      dia: 'Sábado',
      horario: '10h às 20h',
      avaliacao: 4.8,
      avaliacoes: 278,
      categoria: 'Alimentos',
      descricao: 'Comidas artesanais, queijos, embutidos e delícias locais.',
      imagem: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
      distancia: '2.3 km',
      telefone: '(11) 98765-9012'
    }
  ];

  const feirasFiltradas = feiras.filter(feira => {
    const categoriaMatch = filtroCategoria === 'todas' || feira.categoria === filtroCategoria;
    const diaMatch = filtroDia === 'todos' || feira.dia.toLowerCase() === filtroDia.toLowerCase();
    return categoriaMatch && diaMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Todas as Feiras</h1>
        <p className="text-gray-600">
          Encontre {feiras.length} feiras perto de você
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-5 h-5 text-gray-500" />
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas Categorias</SelectItem>
              <SelectItem value="Orgânico">Orgânico</SelectItem>
              <SelectItem value="Produtos Frescos">Produtos Frescos</SelectItem>
              <SelectItem value="Artesanato">Artesanato</SelectItem>
              <SelectItem value="Flores">Flores</SelectItem>
              <SelectItem value="Alimentos">Alimentos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <Calendar className="w-5 h-5 text-gray-500" />
          <Select value={filtroDia} onValueChange={setFiltroDia}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Dia da Semana" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Dias</SelectItem>
              <SelectItem value="segunda">Segunda-feira</SelectItem>
              <SelectItem value="terça">Terça-feira</SelectItem>
              <SelectItem value="quarta">Quarta-feira</SelectItem>
              <SelectItem value="quinta">Quinta-feira</SelectItem>
              <SelectItem value="sexta">Sexta-feira</SelectItem>
              <SelectItem value="sábado">Sábado</SelectItem>
              <SelectItem value="domingo">Domingo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={() => {
          setFiltroCategoria('todas');
          setFiltroDia('todos');
        }}>
          Limpar Filtros
        </Button>
      </div>

      {feirasFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Nenhuma feira encontrada com esses filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feirasFiltradas.map((feira) => (
            <Card key={feira.id} className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group justify-between">
              <div className="h-52 overflow-hidden relative">
                <ImageWithFallback
                  src={feira.imagem}
                  alt={feira.nome}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <Badge className="absolute top-3 right-3 bg-white text-gray-700">
                  {feira.distancia}
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{feira.nome}</CardTitle>
                </div>
                <Badge variant="secondary" className="w-fit mb-2">{feira.categoria}</Badge>
                <CardDescription className="space-y-2">
                  <p className="text-gray-700">{feira.descricao}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{feira.local}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{feira.dia}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{feira.horario}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  className="flex-1 bg-[#4A9FB5] hover:bg-[#3A8FA5]"
                  onClick={() => window.open(`https://wa.me/55${feira.telefone.replace(/\D/g, '')}?text=Olá! Vi a feira ${feira.nome} no Achei na Feira.`, '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contato
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(feira.local)}`, '_blank')}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Localização
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
