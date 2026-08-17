import { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { FeirasPage } from './components/FeirasPage';
import { ProdutosPage } from './components/ProdutosPage';
import { MinhaContaPage } from './components/MinhaContaPage'; // Optionally if they have it

export default function App() {
  // Auth state
  const [isLoginView, setIsLoginView] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{nome: string, email: string} | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  // Navigation state
  const [currentPage, setCurrentPage] = useState('home');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    try {
      const endpoint = isLoginView ? 'http://localhost:3001/api/login' : 'http://localhost:3001/api/register';
      const bodyData = isLoginView ? { email, senha } : { nome, email, senha };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        setCurrentPage('home'); // Go to Home after login
      } else {
        setErro(data.error || 'Ocorreu um erro.');
      }
    } catch (err) {
      setErro('Erro de conexão com o servidor.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'feiras':
        return <FeirasPage />;
      case 'produtos':
        return <ProdutosPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E8F5F7] to-white">
        {/* We can pass handleLogout to Header if we want, but for now we just render Header and Pages as originally built */}
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        
        {/* Simple Logout button bar at the very top, above the header, or you can integrate it into the Header.tsx later */}
        <div className="bg-teal-600 text-white px-4 py-1 flex justify-between items-center text-sm">
          <span>Bem-vindo(a), {user?.nome}!</span>
          <button onClick={handleLogout} className="hover:underline">Sair</button>
        </div>

        <main className="w-full">
          {renderPage()}
        </main>
      </div>
    );
  }

  // LOGIN SCREEN
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#E67E3F] mb-2">Achei na Feira</h1>
          <p className="text-gray-500">
            {isLoginView ? 'Bem-vindo de volta!' : 'Crie sua conta e aproveite'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleAuth}>
          {erro && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {erro}
            </div>
          )}

          {!isLoginView && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input
                type="text"
                required={!isLoginView}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A9FB5] focus:border-[#4A9FB5] outline-none transition"
                placeholder="Seu nome"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A9FB5] focus:border-[#4A9FB5] outline-none transition"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A9FB5] focus:border-[#4A9FB5] outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#E67E3F] hover:bg-[#D66E2F] text-white font-medium py-3 rounded-lg mt-6 transition-colors"
          >
            {isLoginView ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-[#4A9FB5] hover:text-[#387e91] text-sm font-medium"
          >
            {isLoginView
              ? 'Não tem uma conta? Cadastre-se'
              : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
}