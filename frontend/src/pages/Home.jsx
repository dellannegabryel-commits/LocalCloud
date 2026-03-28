import React, { useMemo } from 'react';
import StorageCard from '../components/dashboard/StorageCard';
import { Image, FileText, Play, Music, ArrowRight } from 'lucide-react';
import FileItem from '../components/ui/FileItem';

const Home = ({ files, onRefresh }) => {
  const quickAccess = [
    { label: 'Fotos', icon: <Image size={24} />, color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/20' },
    { label: 'Vídeos', icon: <Play size={24} />, color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500/20' },
    { label: 'Docs', icon: <FileText size={24} />, color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/20' },
    { label: 'Músicas', icon: <Music size={24} />, color: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/20' },
  ];

  const storageStats = useMemo(() => {
    const totalBytes = files.reduce((acc, file) => acc + file.size, 0);
    const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
    return {
      used: totalGB,
      total: 128 // Mock total limit
    };
  }, [files]);

  const recentFiles = files.slice(0, 4);

  return (
    <div className="px-4 md:px-8 pt-10 pb-24 md:pb-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Visão Geral</p>
          <h1 className="text-3xl font-black text-white tracking-tighter">LocalDrive</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-bold text-white">Administrador</span>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-surface border border-border overflow-hidden active:scale-95 transition-all hover:border-primary-blue/30 cursor-pointer shadow-lg">
            <img src="https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2">
          <StorageCard used={storageStats.used} total={storageStats.total} />
          
          <div className="flex justify-between items-center mb-6 mt-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Acesso Rápido</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickAccess.map((item, idx) => (
              <button key={idx} className={`p-6 rounded-3xl border ${item.border} ${item.color} active:scale-95 transition-all flex flex-col items-center gap-4 backdrop-blur-md group hover:bg-white/5`}>
                <div className="p-3 rounded-2xl bg-black/20 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface rounded-3xl border border-border p-6 h-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Atividades Recentes</h4>
              <button className="text-primary-blue text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                Ver Tudo <ArrowRight size={10} />
              </button>
            </div>
            
            <div className="space-y-1">
              {recentFiles.length === 0 ? (
                <p className="text-slate-600 text-xs italic py-10 text-center">Nenhuma atividade recente.</p>
              ) : (
                recentFiles.map((file) => (
                  <FileItem key={file.id} {...file} onRefresh={onRefresh} />
                ))
              )}
              </div>
              </div>
              </div>
              </div>


      
      {/* Footer Banner Desktop */}
      <div className="hidden md:flex mt-8 bg-gradient-to-r from-primary-blue/20 to-transparent rounded-[2.5rem] border border-primary-blue/10 p-10 items-center justify-between overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10">
          <h4 className="text-xl font-black text-white mb-2">Backup Automático Inteligente</h4>
          <p className="text-slate-400 text-sm font-medium max-w-md">Sincronize seu dispositivo local e proteja seus arquivos com o LocalDrive Pro.</p>
        </div>
        <button className="relative z-10 bg-white text-black font-black px-8 py-4 rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-widest shadow-xl shadow-white/5 hover:bg-slate-200">
          Configurar Agora
        </button>
      </div>
    </div>
  );
};

export default Home;
