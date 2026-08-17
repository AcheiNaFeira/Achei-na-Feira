import { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { FeirasPage } from './components/FeirasPage';
import { ProdutosPage } from './components/ProdutosPage';
import { MinhaContaPage } from './components/MinhaContaPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F5F7] to-white">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="w-full">
        {renderPage()}
      </main>
    </div>
  );
}