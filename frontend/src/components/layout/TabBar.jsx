import React from 'react';
import { Home, Folder, Plus, Search, Settings } from 'lucide-react';

const TabBar = ({ activeTab, setActiveTab, onUploadClick }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass h-20 px-6 flex items-center justify-between z-50 border-t border-border">
      <TabItem 
        icon={<Home size={22} />} 
        label="Início" 
        active={activeTab === 'home'} 
        onClick={() => setActiveTab('home')}
      />
      <TabItem 
        icon={<Folder size={22} />} 
        label="Arquivos" 
        active={activeTab === 'explorer'} 
        onClick={() => setActiveTab('explorer')}
      />
      
      <div className="relative -top-6">
        <button 
          onClick={onUploadClick}
          className="bg-primary-blue p-4 rounded-full shadow-lg shadow-primary-blue/30 active:scale-90 transition-all hover:bg-blue-600"
        >
          <Plus size={28} className="text-white" />
        </button>
      </div>

      <TabItem icon={<Search size={22} />} label="Busca" />
      <TabItem icon={<Settings size={22} />} label="Ajustes" />
    </nav>
  );
};

const TabItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 active:scale-90 transition-transform ${active ? 'text-primary-blue' : 'text-slate-500'}`}
  >
    {icon}
    <span className="text-[10px] font-bold tracking-tight">{label}</span>
  </button>
);

export default TabBar;
