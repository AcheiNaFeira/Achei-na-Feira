import { User, MapPin, Heart, Bell, Settings, LogOut, Star, Calendar, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function MinhaContaPage() {
  const usuario = {
    nome: 'Maria Silva',
    email: 'maria.silva@email.com',
    telefone: '(11) 98765-4321',
    endereco: 'Rua das Flores, 123 - Centro',
    membro: 'Agosto 2025'
  };

  const feirasFavoritas = [
    {
      id: 1,
      nome: 'Feira Orgânica da Praça',
      local: 'Praça Central',
      avaliacao: 4.8,
      telefone: '(11) 98765-1234',
      dia: 'Sábados'
    },
    {
      id: 2,
      nome: 'Feira Gastronômica',
      local: 'Praça da Alimentação',
      avaliacao: 4.8,
      telefone: '(11) 98765-9012',
      dia: 'Sábados'
    },
    {
      id: 3,
      nome: 'Feira de Artesanato',
      local: 'Parque Municipal',
      avaliacao: 4.9,
      telefone: '(11) 98765-7890',
      dia: 'Domingos'
    }
  ];

  const produtosFavoritos = [
    { id: 1, nome: 'Tomates Orgânicos', vendedor: 'Feira Orgânica', preco: 8.50, telefone: '(11) 98765-1234', local: 'Praça Central' },
    { id: 2, nome: 'Morangos Frescos', vendedor: 'Feira Orgânica', preco: 12.00, telefone: '(11) 98765-1234', local: 'Praça Central' },
    { id: 3, nome: 'Queijo Artesanal', vendedor: 'Feira Gastronômica', preco: 28.00, telefone: '(11) 98765-9012', local: 'Praça da Alimentação' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Minha Conta</h1>
        <p className="text-gray-600">Gerencie suas informações e preferências</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" />
                <AvatarFallback>MS</AvatarFallback>
              </Avatar>
              <CardTitle>{usuario.nome}</CardTitle>
              <CardDescription>{usuario.email}</CardDescription>
              <Badge variant="secondary" className="mx-auto mt-2">
                Membro desde {usuario.membro}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{usuario.endereco}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{usuario.telefone}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Notificações
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Minhas Atividades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#4A9FB5]" />
                  <span className="text-sm">Feiras Visitadas</span>
                </div>
                <span className="text-xl">8</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#E67E3F]" />
                  <span className="text-sm">Favoritos</span>
                </div>
                <span className="text-xl">15</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">Avaliações Feitas</span>
                </div>
                <span className="text-xl">12</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="feiras" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="feiras">
                <MapPin className="w-4 h-4 mr-2" />
                Feiras Favoritas
              </TabsTrigger>
              <TabsTrigger value="produtos">
                <Heart className="w-4 h-4 mr-2" />
                Produtos Favoritos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feiras" className="space-y-4">
              {feirasFavoritas.map((feira) => (
                <Card key={feira.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{feira.nome}</CardTitle>
                        <CardDescription className="space-y-1 mt-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {feira.local}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {feira.dia}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{feira.avaliacao}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </Button>
                    </div>
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
                      <MapPin className="w-4 h-4 mr-2" />
                      Localização
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="produtos" className="space-y-4">
              {produtosFavoritos.map((produto) => (
                <Card key={produto.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{produto.nome}</CardTitle>
                        <CardDescription className="mt-1">
                          {produto.vendedor} - {produto.local}
                        </CardDescription>
                        <p className="text-2xl text-[#E67E3F] mt-3">
                          R$ {produto.preco.toFixed(2)}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button
                      className="flex-1 bg-[#4A9FB5] hover:bg-[#3A8FA5]"
                      onClick={() => window.open(`https://wa.me/55${produto.telefone.replace(/\D/g, '')}?text=Olá! Vi o produto ${produto.nome} no Achei na Feira.`, '_blank')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contato
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(produto.local)}`, '_blank')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Como Chegar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
