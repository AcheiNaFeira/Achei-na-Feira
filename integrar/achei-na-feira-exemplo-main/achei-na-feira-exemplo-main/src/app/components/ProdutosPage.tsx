import { useState } from 'react';
import { Phone, Star, MapPin, Heart, Navigation } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ProdutosPage() {
  const [favoritos, setFavoritos] = useState<number[]>([]);

  const produtos = [
    {
      id: 1,
      nome: 'Tomates Orgânicos',
      preco: 8.50,
      unidade: 'kg',
      vendedor: 'Feira Orgânica da Praça',
      avaliacao: 4.9,
      categoria: 'Verduras e Legumes',
      imagem: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop',
      local: 'Praça Central',
      telefone: '(11) 98765-1234'
    },
    {
      id: 2,
      nome: 'Alface Crespa',
      preco: 3.50,
      unidade: 'maço',
      vendedor: 'Feira do Produtor Rural',
      avaliacao: 4.7,
      categoria: 'Verduras e Legumes',
      imagem: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=300&fit=crop',
      local: 'Bairro Novo',
      telefone: '(11) 98765-5678'
    },
    {
      id: 3,
      nome: 'Morangos Frescos',
      preco: 12.00,
      unidade: 'bandeja 500g',
      vendedor: 'Feira Orgânica da Praça',
      avaliacao: 5.0,
      categoria: 'Frutas',
      imagem: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=300&fit=crop',
      local: 'Praça Central',
      telefone: '(11) 98765-1234'
    },
    {
      id: 4,
      nome: 'Queijo Artesanal',
      preco: 28.00,
      unidade: '500g',
      vendedor: 'Feira Gastronômica',
      avaliacao: 4.8,
      categoria: 'Laticínios',
      imagem: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300&h=300&fit=crop',
      local: 'Praça da Alimentação',
      telefone: '(11) 98765-9012'
    },
    {
      id: 5,
      nome: 'Pão Caseiro',
      preco: 15.00,
      unidade: 'unidade',
      vendedor: 'Feira Gastronômica',
      avaliacao: 4.9,
      categoria: 'Padaria',
      imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop',
      local: 'Praça da Alimentação',
      telefone: '(11) 98765-9012'
    },
    {
      id: 6,
      nome: 'Mel Puro',
      preco: 22.00,
      unidade: '500ml',
      vendedor: 'Feira do Produtor Rural',
      avaliacao: 5.0,
      categoria: 'Alimentos',
      imagem: 'https://images.unsplash.com/photo-1587049352846-4a222e784422?w=300&h=300&fit=crop',
      local: 'Bairro Novo',
      telefone: '(11) 98765-5678'
    },
    {
      id: 7,
      nome: 'Cesta de Flores',
      preco: 35.00,
      unidade: 'unidade',
      vendedor: 'Feira de Flores',
      avaliacao: 4.8,
      categoria: 'Flores',
      imagem: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=300&fit=crop',
      local: 'Centro de Eventos',
      telefone: '(11) 98765-3456'
    },
    {
      id: 8,
      nome: 'Cesta Artesanal',
      preco: 45.00,
      unidade: 'unidade',
      vendedor: 'Feira de Artesanato',
      avaliacao: 4.9,
      categoria: 'Artesanato',
      imagem: 'https://images.unsplash.com/photo-1523438097201-512ae7d59c44?w=300&h=300&fit=crop',
      local: 'Parque Municipal',
      telefone: '(11) 98765-7890'
    },
    {
      id: 9,
      nome: 'Batata Orgânica',
      preco: 6.50,
      unidade: 'kg',
      vendedor: 'Feira Orgânica da Praça',
      avaliacao: 4.6,
      categoria: 'Verduras e Legumes',
      imagem: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop',
      local: 'Praça Central',
      telefone: '(11) 98765-1234'
    }
  ];

  const categorias = ['Todos', 'Verduras e Legumes', 'Frutas', 'Laticínios', 'Padaria', 'Alimentos', 'Flores', 'Artesanato'];

  const toggleFavorito = (id: number) => {
    if (favoritos.includes(id)) {
      setFavoritos(favoritos.filter(f => f !== id));
    } else {
      setFavoritos([...favoritos, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Catálogo de Produtos</h1>
        <p className="text-gray-600">
          Descubra produtos frescos e artesanais. Entre em contato direto com os feirantes para mais informações.
        </p>
      </div>

      <Tabs defaultValue="Todos" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto">
          {categorias.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categorias.map((categoria) => (
          <TabsContent key={categoria} value={categoria}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {produtos
                .filter(p => categoria === 'Todos' || p.categoria === categoria)
                .map((produto) => (
                  <Card key={produto.id} className="overflow-hidden hover:shadow-xl transition-all group">
                    <div className="h-56 overflow-hidden relative">
                      <ImageWithFallback
                        src={produto.imagem}
                        alt={produto.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                        onClick={() => toggleFavorito(produto.id)}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favoritos.includes(produto.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-600'
                          }`}
                        />
                      </Button>
                      <Badge className="absolute top-3 left-3 bg-[#4A9FB5]">
                        {produto.categoria}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{produto.nome}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{produto.vendedor}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{produto.avaliacao}</span>
                        </div>
                        <div className="mt-3">
                          <p className="text-2xl text-[#E67E3F]">
                            R$ {produto.preco.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">por {produto.unidade}</p>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        className="w-full bg-[#4A9FB5] hover:bg-[#3A8FA5]"
                        onClick={() => window.open(`https://wa.me/55${produto.telefone.replace(/\D/g, '')}?text=Olá! Vi o produto ${produto.nome} no Achei na Feira e gostaria de mais informações.`, '_blank')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Entrar em Contato
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(produto.local)}`, '_blank')}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Como Chegar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
