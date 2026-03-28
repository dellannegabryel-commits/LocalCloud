import React, { useState, useEffect } from 'react';
import { Search, Filter, X, FileText, Download, Trash2, ChevronRight, LogOut } from 'lucide-react'; // Importei X, FileText, Download, Trash2, ChevronRight, LogOut
import FileItem from '../components/ui/FileItem';
import { searchFiles, getFiles, getDownloadUrl, deleteFile } from '../api/apiClient'; // Importei searchFiles

const SearchPage = ({ onRefresh }) => { // onRefresh prop might be useful if delete/download are initiated here
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await searchFiles(searchTerm);
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Não foi possível realizar a busca.');
      setSearchResults([]); // Clear results on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Excluir este arquivo permanentemente?')) {
      try {
        await deleteFile(id);
        // Re-run search to update results after delete
        handleSearch({ preventDefault: () => {} }); 
        if (onRefresh) onRefresh(); // Notify parent (App.jsx) to refresh main file list
      } catch (err) {
        alert('Erro ao deletar arquivo.');
      }
    }
  };

  return (
    <div className="px-4 md:px-8 pt-6 pb-24 md:pb-10">
      <h1 className="text-3xl font-black text-white tracking-tighter mb-8">Busca</h1>

      <form onSubmit={handleSearch} className="flex items-center gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar em todos os seus arquivos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-16 text-sm font-medium focus:border-primary-blue/50 focus:ring-1 focus:ring-primary-blue/20 outline-none transition-all"
          />
          {searchTerm && (
            <button 
              type="button"
              onClick={() => { setSearchTerm(''); setSearchResults([]); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button 
          type="submit" 
          className="bg-primary-blue text-white font-bold py-3 px-6 rounded-xl active:scale-95 transition-all shadow-lg shadow-primary-blue/10 hover:bg-blue-600 disabled:opacity-50 disabled:scale-100"
          disabled={!searchTerm || isLoading}
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-blue"></div>
        </div>
      )}

      {!isLoading && searchResults.length > 0 ? (
        <div className="space-y-1">
          <div className="hidden md:grid grid-cols-12 px-4 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
            <div className="col-span-8">Nome</div>
            <div className="col-span-2 text-right pr-12">Ações</div>
          </div>
          {searchResults.map((file) => (
            <FileItem 
              key={file.id} 
              id={file.id} 
              original_name={file.original_name} 
              size={file.size} 
              created_at={file.created_at} 
              onRefresh={handleDelete} // Pass handleDelete for refresh after delete
            />
          ))}
        </div>
      ) : (!isLoading && !error && searchTerm && searchResults.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface/30 rounded-[2.5rem] border border-dashed border-border/50">
          <div className="p-6 bg-surface rounded-full mb-4">
            <Search size={32} className="text-slate-700" />
          </div>
          <p className="text-slate-500 font-bold">Nenhum resultado encontrado</p>
          <p className="text-slate-600 text-xs mt-1">Tente ajustar sua busca.</p>
        </div>
      ) : (!searchTerm && searchResults.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface/30 rounded-[2.5rem] border border-dashed border-border/50">
          <div className="p-6 bg-surface rounded-full mb-4">
            <Search size={32} className="text-slate-700" />
          </div>
          <p className="text-slate-500 font-bold">Comece a buscar</p>
          <p className="text-slate-600 text-xs mt-1">Digite um nome de arquivo ou extensão no campo acima.</p>
        </div>
      ) : null}
    </div>
  );
};

export default SearchPage;
