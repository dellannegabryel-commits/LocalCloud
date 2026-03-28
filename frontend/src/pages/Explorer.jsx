import React, { useState } from 'react';
import { ChevronRight, LayoutGrid, List, Search, Filter } from 'lucide-react';
import FileItem from '../components/ui/FileItem';

const Explorer = ({ files, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFiles = files.filter(file => 
    file.original_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 md:px-8 pt-6 pb-24 md:pb-10">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar whitespace-nowrap py-1">
            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest active:text-primary-blue transition-colors cursor-pointer">LocalDrive</span>
            <ChevronRight size={12} className="text-slate-800" />
            <span className="text-white font-bold text-[10px] uppercase tracking-widest">Meus Arquivos</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Arquivos</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar no drive..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:border-primary-blue/50 focus:ring-1 focus:ring-primary-blue/20 outline-none transition-all"
            />
          </div>
          <button className="p-3 bg-surface border border-border rounded-xl text-slate-400 hover:text-white transition-colors active:scale-95">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface/30 rounded-[2.5rem] border border-dashed border-border/50">
          <div className="p-6 bg-surface rounded-full mb-4">
            <Search size={32} className="text-slate-700" />
          </div>
          <p className="text-slate-500 font-bold">Nenhum arquivo encontrado</p>
          <p className="text-slate-600 text-xs mt-1">Tente ajustar sua busca ou faça um novo upload.</p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="hidden md:grid grid-cols-12 px-4 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
            <div className="col-span-8">Nome</div>
            <div className="col-span-2 text-right pr-12">Ações</div>
          </div>
          {filteredFiles.map((file) => (
            <FileItem key={file.id} {...file} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explorer;
