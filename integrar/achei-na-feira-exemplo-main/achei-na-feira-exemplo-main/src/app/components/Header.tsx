import { ShoppingBag, Heart, Leaf, Menu, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="flex items-center gap-2">
              
              <span className="text-4xl font-bold tracking-tight">
                <span className="text-[#4A9FB5]">ACHEI</span>
              </span>
            </div>
            <div className="flex items-center rounded-lg mt-1">
              
              <ShoppingBag className="w-7 h-7 text-[#94552E]" strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-[#E67E3F]">FEIRA</span>
             {/* <Leaf className="w-8 h-8 text-[#E67E3F] " /> */}
            </div>
          </div>

         {/* <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-6 h-6" />
		 </Button> */}
			
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar feiras, produtos, categorias..."
              className="pl-10 h-12"
            />
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant={currentPage === 'home' ? 'default' : 'ghost'}
              onClick={() => onNavigate('home')}
            >
              Início
            </Button>
            <Button
              variant={currentPage === 'feiras' ? 'default' : 'ghost'}
              onClick={() => onNavigate('feiras')}
            >
              Feiras
            </Button>
            <Button
              variant={currentPage === 'produtos' ? 'default' : 'ghost'}
              onClick={() => onNavigate('produtos')}
            >
              Produtos
            </Button>
            
          </nav>
        </div>
		<nav className="md:hidden items-center gap-2 flex justify-center">
            <Button
              variant={currentPage === 'home' ? 'default' : 'ghost'}
              onClick={() => onNavigate('home')}
            >
              Início
            </Button>
            <Button
              variant={currentPage === 'feiras' ? 'default' : 'ghost'}
              onClick={() => onNavigate('feiras')}
            >
              Feiras
            </Button>
            <Button
              variant={currentPage === 'produtos' ? 'default' : 'ghost'}
              onClick={() => onNavigate('produtos')}
            >
              Produtos
            </Button>
            
          </nav>
      </div>
    </header>
  );
}
