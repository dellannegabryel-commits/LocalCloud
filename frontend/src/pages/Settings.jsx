import React from 'react';
import { Settings, LogOut, User, Cloud, ShieldCheck, Bell, ArrowRight } from 'lucide-react'; // Importei ArrowRight

const SettingsPage = ({ setActiveTab }) => { // Receiving setActiveTab to potentially navigate to sub-pages
  const settingsOptions = [
    { id: 'account', icon: <User size={20} />, label: 'Conta', description: 'Gerenciar informações do usuário e perfil.' },
    { id: 'storage', icon: <Cloud size={20} />, label: 'Armazenamento', description: 'Configurações de limite de espaço e uso.' },
    { id: 'security', icon: <ShieldCheck size={20} />, label: 'Segurança', description: 'Opções de autenticação e privacidade.' },
    { id: 'notifications', icon: <Bell size={20} />, label: 'Notificações', description: 'Preferências de alertas e atualizações.' },
  ];

  const handleLogout = () => {
    // In a real app, this would clear authentication tokens, user data, etc.
    // For now, we'll just simulate a redirect/reset.
    if (window.confirm('Tem certeza que deseja sair?')) {
      console.log('User logged out.');
      // For a SPA, you might reset state and redirect to login/home
      setActiveTab('home'); // Reset to home tab as a basic reset
      // If there was a login page, you would navigate there.
    }
  };

  return (
    <div className="px-4 md:px-8 pt-6 pb-24 md:pb-10">
      <h1 className="text-3xl font-black text-white tracking-tighter mb-8">Ajustes</h1>

      <div className="bg-surface rounded-3xl border border-border p-6 shadow-2xl">
        <div className="space-y-6">
          {settingsOptions.map((option) => (
            <div 
              key={option.id} 
              onClick={() => setActiveTab(option.id)} // Basic navigation simulation
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
            >
              <div className="p-3 bg-primary-blue/10 rounded-xl text-primary-blue">
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">{option.label}</h3>
                <p className="text-slate-500 text-xs font-medium">{option.description}</p>
              </div>
              <ArrowRight className="text-slate-600" size={16} />
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-3 text-red-400 font-bold py-3 px-6 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/15 transition-all active:scale-95"
          >
            <LogOut size={18} />
            <span className="text-sm">Sair da Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
