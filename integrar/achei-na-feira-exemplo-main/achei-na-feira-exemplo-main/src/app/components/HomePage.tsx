import { MapPin, Calendar, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const feirasDestaque = [
    {
      id: 1,
      nome: 'Feira Orgânica da Praça',
      local: 'Praça Central, Centro',
      dia: 'Sábados',
      horario: '7h às 14h',
      avaliacao: 4.8,
      categoria: 'Orgânico',
      imagem: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      nome: 'Feira do Produtor Rural',
      local: 'Av. Principal, Bairro Novo',
      dia: 'Quartas e Sábados',
      horario: '6h às 13h',
      avaliacao: 4.6,
      categoria: 'Produtos Frescos',
      imagem: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      nome: 'Feira de Artesanato',
      local: 'Parque Municipal',
      dia: 'Domingos',
      horario: '8h às 18h',
      avaliacao: 4.9,
      categoria: 'Artesanato',
      imagem: 'https://images.unsplash.com/photo-1523438097201-512ae7d59c44?w=400&h=250&fit=crop'
    }
  ];

  const categorias = [
    { nome: 'Frutas & Verduras', icon: '🍅', cor: 'bg-green-100 text-green-700' },
    { nome: 'Orgânicos', icon: '🍄', cor: 'bg-emerald-100 text-emerald-700' },
    { nome: 'Artesanato', icon: '🎨', cor: 'bg-purple-100 text-purple-700' },
    { nome: 'Flores', icon: '🌸', cor: 'bg-pink-100 text-pink-700' },
    { nome: 'Alimentos', icon: '🍞', cor: 'bg-orange-100 text-orange-700' },
    { nome: 'Laticínios', icon: '🧀', cor: 'bg-yellow-100 text-yellow-700' }
  ];

  return (
    <div className="w-full">
      <section className="bg-gradient-to-r from-[#4A9FB5] to-[#5BB5C9] text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-5xl mb-4">
              Descubra as melhores feiras da sua região
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Encontre produtos frescos, artesanato local e muito mais. Conecte-se com produtores e feirantes perto de você.
            </p>
            <Button
              size="lg"
              className="bg-[#E67E3F] hover:bg-[#D66E2F] text-white"
              onClick={() => onNavigate('feiras')}
            >
              Explorar Feiras
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl mb-8">Categorias Populares</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categorias.map((cat, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-2">{cat.icon}</div>
                <p className={`px-3 py-1 rounded-full text-sm inline-block ${cat.cor}`}>
                  {cat.nome}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl">Feiras em Destaque</h2>
          <Button variant="outline" onClick={() => onNavigate('feiras')}>
            Ver Todas
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feirasDestaque.map((feira) => (
            <Card key={feira.id} className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
              <div className="h-48 overflow-hidden">
                <ImageWithFallback
                  src={feira.imagem}
                  alt={feira.nome}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{feira.nome}</CardTitle>
                  <Badge variant="secondary">{feira.categoria}</Badge>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{feira.local}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 mb-6">
                    <Calendar className="w-4 h-4" />
                    <span>{feira.dia} • {feira.horario}</span>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-[#E67E3F] text-white py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl mb-4">É produtor ou feirante?</h2>
          <p className="text-xl mb-8 opacity-90">
            Cadastre sua feira e apareça para milhares de pessoas na sua região
          </p>
          <Button size="lg" className="bg-white text-[#E67E3F] hover:bg-gray-100">
            Divulgar Minha Feira
          </Button>
        </div>
      </section>
    </div>
  );
}
