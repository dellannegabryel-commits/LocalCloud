import React, { useState } from 'react';
import { FileText, Image, Video, MoreVertical, File, Download, Trash2, ExternalLink } from 'lucide-react';
import { getDownloadUrl, getViewUrl, deleteFile } from '../../api/apiClient';

const FileItem = ({ id, original_name, size, created_at, onRefresh }) => {
  const [showOptions, setShowOptions] = useState(false);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const getIcon = () => {
    const extension = original_name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return <Image className="text-blue-400" size={20} />;
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return <Video className="text-purple-400" size={20} />;
    if (extension === 'pdf') return <FileText className="text-red-400" size={20} />;
    return <File className="text-slate-400" size={20} />;
  };

  const handleDelete = async () => {
    if (window.confirm('Excluir este arquivo permanentemente?')) {
      try {
        await deleteFile(id);
        onRefresh();
      } catch (error) {
        alert('Erro ao deletar arquivo.');
      }
    }
  };

  return (
    <div className="group flex items-center justify-between p-3 md:p-4 mb-2 bg-surface rounded-2xl border border-border hover:border-primary-blue/30 transition-all duration-300">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="p-3 bg-black rounded-xl border border-border/50 group-hover:border-primary-blue/20 transition-colors">
          {getIcon()}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-100 truncate pr-4">
            {original_name}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            <span>{formatSize(size)}</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            <span>{formatDate(created_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {/* Desktop Quick Actions */}
        <div className="hidden md:flex items-center gap-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <a href={getViewUrl(id)} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <ExternalLink size={18} />
          </a>
          <a href={getDownloadUrl(id)} download={original_name} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Download size={18} />
          </a>
          <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all">
            <Trash2 size={18} />
          </button>
        </div>

        {/* Mobile/Menu Toggle */}
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className={`p-2 rounded-xl transition-all ${showOptions ? 'bg-primary-blue text-white' : 'text-slate-500 hover:bg-white/5'}`}
          >
            <MoreVertical size={20} />
          </button>

          {showOptions && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-2xl shadow-2xl z-50 py-2 animate-slide-up md:animate-none">
                <a href={getViewUrl(id)} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/5 transition-colors">
                  <ExternalLink size={18} /> Visualizar
                </a>
                <a href={getDownloadUrl(id)} download={original_name} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/5 transition-colors">
                  <Download size={18} /> Baixar
                </a>
                <div className="h-px bg-border my-1 mx-2" />
                <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/5 transition-colors text-left">
                  <Trash2 size={18} /> Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileItem;
