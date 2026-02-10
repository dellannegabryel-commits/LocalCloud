import { useState, useEffect, useMemo } from 'react';
import {
  Upload, HardDrive, List, Search, Trash2,
  Download, FileText, Image as ImageIcon, File, X, Plus, Home, Settings,
  BarChart3, PieChart, Activity, ChevronRight
} from 'lucide-react';
import api from './api/axios';
import './index.css';

function App() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'upload', 'files', 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await api.get('/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleUpload = async (uploadedFile) => {
    if (!uploadedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchFiles();
      setActiveTab('files');
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/files/${id}`);
      setFiles(files.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-purple-400" />;
    if (mimetype.includes('pdf') || mimetype.includes('text')) return <FileText className="w-5 h-5 text-blue-400" />;
    return <File className="w-5 h-5 text-indigo-400" />;
  };

  const getCategory = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.includes('pdf') || mimetype.includes('text') || mimetype.includes('document')) return 'document';
    return 'other';
  };

  const stats = useMemo(() => {
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    return {
      totalSize,
      formattedTotal: formatSize(totalSize),
      percentage: Math.min((totalSize / (10 * 1024 * 1024 * 1024)) * 100, 100).toFixed(1)
    };
  }, [files]);

  const processedFiles = useMemo(() => {
    let result = files.filter(f =>
      f.original_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterType !== 'all') {
      result = result.filter(f => getCategory(f.mimetype) === filterType);
    }

    result.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'size') return b.size - a.size;
      return 0;
    });

    return result;
  }, [files, searchQuery, filterType, sortBy]);

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-200 flex flex-col md:flex-row overflow-hidden font-sans">

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-72 border-r border-slate-900/50 p-8 flex-col gap-10 bg-slate-950/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-600/20">
            <HardDrive className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight underline decoration-indigo-500/30 decoration-4 underline-offset-8">LocalDrive</h1>
        </div>

        <nav className="flex flex-col gap-3">
          {[
            { id: 'home', icon: Home, label: 'Dashboard' },
            { id: 'upload', icon: Plus, label: 'Add New File' },
            { id: 'files', icon: List, label: 'My Explorer' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-medium border ${activeTab === item.id ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/20 shadow-inner' : 'text-slate-500 hover:bg-slate-900 border-transparent'}`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto glass p-6 rounded-3xl border-slate-800/50">
          <div className="text-xs text-slate-500 mb-3 uppercase font-bold tracking-widest">Storage Status</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mb-3 overflow-hidden">
            <div style={{ width: `${stats.percentage}%` }} className="bg-gradient-to-r from-indigo-600 to-purple-500 h-full rounded-full transition-all duration-1000"></div>
          </div>
          <p className="text-sm font-medium text-slate-300">{stats.formattedTotal} <span className="text-slate-600 ml-1">of 10 GB</span></p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-5 bg-slate-950/80 backdrop-blur-lg border-b border-slate-900 fixed top-0 w-full z-40">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg"><HardDrive className="w-5 h-5 text-white" /></div>
          <span className="font-bold text-lg tracking-tight">LocalDrive</span>
        </div>
        <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 text-slate-400">
          {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-950">
        <main className="flex-1 overflow-y-auto pt-20 pb-28 md:py-12 md:px-12 px-5 no-scrollbar scroll-smooth">
          <div className="max-w-5xl mx-auto space-y-12">

            {/* Search Expansion */}
            {isSearchOpen && (
              <div className="md:hidden animate-in slide-in-from-top duration-300">
                <input
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  autoFocus
                />
              </div>
            )}

            {/* DASHBOARD VIEW */}
            {activeTab === 'home' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">Welcome back</h2>
                  <p className="text-slate-500 text-lg font-medium">Your local cloud is healthy and running.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="glass p-8 rounded-[2.5rem] space-y-4">
                    <BarChart3 className="w-10 h-10 text-indigo-500" />
                    <div>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Total Usage</p>
                      <p className="text-3xl font-black text-slate-100">{stats.formattedTotal}</p>
                    </div>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem] space-y-4">
                    <Activity className="w-10 h-10 text-purple-500" />
                    <div>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Total Files</p>
                      <p className="text-3xl font-black text-slate-100">{files.length}</p>
                    </div>
                  </div>
                  <div className="hidden lg:block glass p-8 rounded-[2.5rem] space-y-4">
                    <PieChart className="w-10 h-10 text-blue-500" />
                    <div>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Availability</p>
                      <p className="text-3xl font-black text-slate-100">100%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black tracking-tight">Recent Activity</h3>
                    <button onClick={() => setActiveTab('files')} className="text-indigo-400 font-bold flex items-center gap-1">Explorer <ChevronRight className="w-4 h-4" /></button>
                  </div>
                  <div className="grid gap-4">
                    {files.slice(0, 4).map(file => (
                      <div key={file.id} className="glass p-6 rounded-[2rem] flex items-center justify-between group hover:bg-slate-900 transition-all">
                        <div className="flex items-center gap-6 min-w-0">
                          <div className="bg-slate-900 p-4 rounded-2xl">{getFileIcon(file.mimetype)}</div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-200 truncate pr-4 text-lg">{file.original_name}</p>
                            <p className="text-xs text-slate-500 font-black tracking-widest uppercase">{formatSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <a href={`/download/${file.id}`} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-400"><Download className="w-5 h-5" /></a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* UPLOAD VIEW */}
            {activeTab === 'upload' && (
              <div className="space-y-10 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto pt-10">
                <div className="text-center space-y-3">
                  <h2 className="text-4xl font-black tracking-tighter">Add Files</h2>
                  <p className="text-slate-500 text-lg">Securely upload to your personal storage.</p>
                </div>

                <div
                  className={`relative group border-4 border-dashed rounded-[3.5rem] p-16 md:p-32 transition-all duration-500 flex flex-col items-center justify-center gap-10 ${dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800/60 bg-slate-900/20'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); const file = e.dataTransfer.files[0]; if (file) handleUpload(file); }}
                >
                  <div className="bg-indigo-600/10 p-12 rounded-[3rem] group-hover:scale-110 transition-transform duration-700">
                    <Plus className="w-20 h-20 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-black text-center max-w-xs leading-tight">Drag and drop here or <span className="text-indigo-400 underline decoration-2 underline-offset-4">browse files</span></p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e.target.files[0])} />

                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-950/95 rounded-[3.5rem] flex flex-col items-center justify-center backdrop-blur-3xl z-10 animate-in fade-in duration-300">
                      <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-400 rounded-full animate-spin mb-6"></div>
                      <p className="text-indigo-400 font-black tracking-[0.4em] text-xl uppercase animate-pulse">Uploading</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EXPLORER VIEW */}
            {activeTab === 'files' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter">My Explorer</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Managing your stored files</p>
                  </div>
                  <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800/50 flex gap-1">
                    {['all', 'image', 'document'].map(type => (
                      <button
                        key={type} onClick={() => setFilterType(type)}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  {processedFiles.map(file => (
                    <div key={file.id} className="glass p-5 rounded-[2.5rem] flex items-center justify-between group hover:bg-slate-900 transition-all border border-transparent hover:border-slate-800/50">
                      <div className="flex items-center gap-6 min-w-0">
                        <div className="bg-slate-900 p-4 rounded-2xl shadow-inner">{getFileIcon(file.mimetype)}</div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-100 text-lg truncate pr-4">{file.original_name}</p>
                          <p className="text-xs text-slate-500 font-black tracking-widest uppercase">{formatSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`/download/${file.id}`} className="p-3.5 bg-slate-900 rounded-2xl text-slate-400 hover:text-indigo-400 transition-all"><Download className="w-5 h-5" /></a>
                        <button onClick={() => handleDelete(file.id)} className="p-3.5 bg-slate-900 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                  {processedFiles.length === 0 && <div className="text-center py-32 bg-slate-900/20 rounded-[4rem] border-2 border-slate-900 border-dashed"><p className="text-slate-600 font-bold text-xl uppercase tracking-widest">No files matching</p></div>}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Mobile Navbar */}
        <nav className="md:hidden fixed bottom-0 w-full bottom-nav-blur border-t border-slate-900/50 flex justify-around items-center p-6 z-50 rounded-t-[2.5rem]">
          <button onClick={() => setActiveTab('home')} className={`p-4 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-600'}`}><Home className="w-7 h-7" /></button>

          <button onClick={() => setActiveTab('upload')} className="relative -top-10 p-6 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-600/40 text-white active:scale-95 transition-transform"><Plus className="w-9 h-9" /></button>

          <button onClick={() => setActiveTab('files')} className={`p-4 rounded-2xl transition-all ${activeTab === 'files' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-600'}`}><List className="w-7 h-7" /></button>
        </nav>
      </div>

    </div>
  );
}

export default App;
