import React from 'react';
import { Home, Folder, Search, Settings, Plus, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onUploadClick }) => {
  const menuItems = [
    { id: 'home', icon: <Home size={20} />, label: 'Início' },
    { id: 'explorer', icon: <Folder size={20} />, label: 'Arquivos' },
    { id: 'search', icon: <Search size={20} />, label: 'Busca' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Ajustes' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface border-r border-border p-6 z-40">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center shadow-lg shadow-primary-blue/20">
          <Folder size={18} className="text-white" />
        </div>
        <h1 className="text-xl font-black tracking-tighter text-white">LocalDrive</h1>
      </div>

      <button 
        onClick={onUploadClick}
        className="flex items-center justify-center gap-2 bg-primary-blue hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl mb-10 transition-all active:scale-95 shadow-lg shadow-primary-blue/10"
      >
        <Plus size={20} />
        <span>Novo Upload</span>
      </button>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all active:scale-95 ${
              activeTab === item.id 
              ? 'bg-primary-blue/10 text-primary-blue border border-primary-blue/20' 
              : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-border mt-auto">
        <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 font-bold hover:text-red-400 transition-colors active:scale-95">
          <LogOut size={20} />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
