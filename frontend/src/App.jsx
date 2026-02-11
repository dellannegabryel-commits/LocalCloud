import { useState, useEffect, useMemo } from 'react';
import {
  Upload, HardDrive, List, Search, Trash2,
  Download, FileText, Image as ImageIcon, File, X, Plus, Home, Settings,
  BarChart3, PieChart, Activity, ChevronRight, Check, Palette, ShieldAlert, Eye
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

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('localcloud-theme') || 'oled');

  // Preview State
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('localcloud-theme', theme);
  }, [theme]);

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
    if (!window.confirm('Are you sure you want to delete this file? This action is permanent.')) return;
    try {
      await api.delete(`/files/${id}`);
      setFiles(files.filter(f => f.id !== id));
      if (previewFile && previewFile.id === id) setPreviewFile(null);
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
    if (mimetype.startsWith('video/')) return 'video';
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
    <div className="fixed inset-0 flex flex-col md:flex-row overflow-hidden font-sans bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-500">

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-72 border-r border-slate-900/50 p-8 flex-col gap-10 bg-[var(--bg-surface)] backdrop-blur-xl shrink-0">
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
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-medium border ${activeTab === item.id ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/20 shadow-inner' : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] border-transparent'}`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto glass p-6 rounded-3xl border-slate-800/50">
          <div className="text-xs text-[var(--text-muted)] mb-3 uppercase font-bold tracking-widest">Storage Status</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mb-3 overflow-hidden">
            <div style={{ width: `${stats.percentage}%` }} className="bg-gradient-to-r from-indigo-600 to-purple-500 h-full rounded-full transition-all duration-1000"></div>
          </div>
          <p className="text-sm font-medium text-slate-300">{stats.formattedTotal} <span className="text-[var(--text-muted)] ml-1">of 10 GB</span></p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-5 bg-[var(--bg-surface)]/80 backdrop-blur-lg border-b border-slate-900 fixed top-0 w-full z-40">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg"><HardDrive className="w-5 h-5 text-white" /></div>
          <span className="font-bold text-lg tracking-tight">LocalDrive</span>
        </div>
        <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 text-[var(--text-muted)]">
          {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)]">
        <main className="flex-1 overflow-y-auto pt-20 pb-28 md:py-12 md:px-12 px-5 no-scrollbar scroll-smooth">
          <div className="max-w-5xl mx-auto space-y-12">

            {/* Search Expansion */}
            {isSearchOpen && (
              <div className="md:hidden animate-in slide-in-from-top duration-300">
                <input
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="w-full bg-[var(--bg-surface)] border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  autoFocus
                />
              </div>
            )}

            {/* DASHBOARD VIEW */}
            {activeTab === 'home' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">Welcome back</h2>
                  <p className="text-[var(--text-muted)] text-lg font-medium">Your local cloud is healthy and running.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="glass p-8 rounded-[2.5rem] space-y-4">
                    <BarChart3 className="w-10 h-10 text-indigo-500" />
                    <div>
                      <p className="text-[var(--text-muted)] text-xs font-black uppercase tracking-widest">Total Usage</p>
                      <p className="text-3xl font-black">{stats.formattedTotal}</p>
                    </div>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem] space-y-4">
                    <Activity className="w-10 h-10 text-purple-500" />
                    <div>
                      <p className="text-[var(--text-muted)] text-xs font-black uppercase tracking-widest">Total Files</p>
                      <p className="text-3xl font-black">{files.length}</p>
                    </div>
                  </div>
                  <div className="hidden lg:block glass p-8 rounded-[2.5rem] space-y-4">
                    <PieChart className="w-10 h-10 text-blue-500" />
                    <div>
                      <p className="text-[var(--text-muted)] text-xs font-black uppercase tracking-widest">Availability</p>
                      <p className="text-3xl font-black">100%</p>
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
                      <div key={file.id} className="glass p-6 rounded-[2rem] flex items-center justify-between group hover:bg-[var(--bg-surface)] transition-all">
                        <div className="flex items-center gap-6 min-w-0">
                          <div className="bg-[var(--bg-main)] p-4 rounded-2xl">{getFileIcon(file.mimetype)}</div>
                          <div className="min-w-0">
                            <p className="font-bold truncate pr-4 text-lg">{file.original_name}</p>
                            <p className="text-xs text-[var(--text-muted)] font-black tracking-widest uppercase">{formatSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setPreviewFile(file)} className="p-3 bg-[var(--bg-surface)] rounded-xl text-[var(--text-muted)] hover:text-indigo-400"><Eye className="w-5 h-5" /></button>
                          <a href={`/download/${file.id}`} className="p-3 bg-[var(--bg-surface)] rounded-xl text-[var(--text-muted)] hover:text-indigo-400"><Download className="w-5 h-5" /></a>
                        </div>
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
                  <p className="text-[var(--text-muted)] text-lg">Securely upload to your personal storage.</p>
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
                  <p className="text-2xl font-black text-center max-w-xs leading-tight">Drag and drop here or <span className="text-indigo-400 underline decoration-2 underline-offset-4 pointer-events-none">browse files</span></p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e.target.files[0])} />

                  {isUploading && (
                    <div className="absolute inset-0 bg-[var(--bg-main)]/95 rounded-[3.5rem] flex flex-col items-center justify-center backdrop-blur-3xl z-10 animate-in fade-in duration-300">
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
                    <p className="text-[var(--text-muted)] font-medium tracking-tight">Managing your stored files</p>
                  </div>
                  <div className="bg-[var(--bg-surface)] p-1.5 rounded-2xl border border-slate-800/50 flex gap-1">
                    {['all', 'image', 'document', 'video'].map(type => (
                      <button
                        key={type} onClick={() => setFilterType(type)}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-[var(--text-muted)]'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  {processedFiles.map(file => (
                    <div key={file.id} className="glass p-5 rounded-[2.5rem] flex items-center justify-between group hover:bg-[var(--bg-surface)] transition-all border border-transparent hover:border-slate-800/50">
                      <div className="flex items-center gap-6 min-w-0">
                        <div className="bg-[var(--bg-main)] p-4 rounded-2xl shadow-inner">{getFileIcon(file.mimetype)}</div>
                        <div className="min-w-0">
                          <p className="font-bold text-lg truncate pr-4">{file.original_name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-[var(--text-muted)] font-black tracking-widest uppercase">{formatSize(file.size)}</span>
                            <span className="text-xs text-[var(--text-muted)] opacity-50">•</span>
                            <span className="text-xs text-[var(--text-muted)]">{new Date(file.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setPreviewFile(file)} className="p-3.5 bg-[var(--bg-main)] rounded-2xl text-[var(--text-muted)] hover:text-indigo-400 transition-all"><Eye className="w-5 h-5" /></button>
                        <a href={`/download/${file.id}`} className="p-3.5 bg-[var(--bg-main)] rounded-2xl text-[var(--text-muted)] hover:text-indigo-400 transition-all"><Download className="w-5 h-5" /></a>
                        <button onClick={() => handleDelete(file.id)} className="p-3.5 bg-[var(--bg-main)] rounded-2xl text-[var(--text-muted)] hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in slide-in-from-right-5 duration-700 max-w-2xl mx-auto py-10 space-y-12">
                <div className="text-center md:text-left">
                  <h3 className="text-4xl font-black tracking-tighter mb-2">Settings</h3>
                  <p className="text-[var(--text-muted)] text-lg font-medium">Personalize your cloud experience.</p>
                </div>

                <section className="space-y-6">
                  <div className="flex items-center gap-3 text-indigo-400">
                    <Palette className="w-6 h-6" />
                    <h4 className="font-black uppercase tracking-widest text-sm">Theme Preferences</h4>
                  </div>

                  <div className="grid gap-4">
                    {[
                      { id: 'oled', label: 'Oled Dark', desc: 'Pure black, best for battery and OLED screens.', color: 'bg-black' },
                      { id: 'indigo', label: 'Indigo Night', desc: 'Deep blue tones with purple accents.', color: 'bg-slate-900' },
                      { id: 'slate', label: 'Classic Slate', desc: 'Modern professional grey aesthetic.', color: 'bg-slate-800' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`glass p-6 rounded-[2.5rem] flex items-center justify-between text-left transition-all group ${theme === t.id ? 'border-indigo-600/50 bg-indigo-600/5 ring-1 ring-indigo-600/20' : 'hover:border-slate-700'}`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl ${t.color} border border-slate-800 shadow-inner shrink-0 group-hover:scale-105 transition-transform`}></div>
                          <div>
                            <p className="font-bold text-lg">{t.label}</p>
                            <p className="text-xs text-[var(--text-muted)]">{t.desc}</p>
                          </div>
                        </div>
                        {theme === t.id && <div className="bg-indigo-600 p-2 rounded-full shadow-lg"><Check className="w-4 h-4 text-white" /></div>}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>

        {/* FILE PREVIEW MODAL */}
        {previewFile && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
            <div className="absolute top-6 right-6 md:top-10 md:right-10 flex gap-4">
              <a href={`/download/${previewFile.id}`} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all text-white"><Download className="w-6 h-6" /></a>
              <button
                onClick={() => setPreviewFile(null)}
                className="bg-white/10 hover:bg-red-500/80 p-3 rounded-full transition-all text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full max-w-5xl h-full max-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
              {previewFile.mimetype.startsWith('image/') ? (
                <img
                  src={`/view/${previewFile.id}`}
                  alt={previewFile.original_name}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                />
              ) : previewFile.mimetype.startsWith('video/') ? (
                <video controls autoPlay className="max-w-full max-h-full rounded-2xl shadow-2xl">
                  <source src={`/view/${previewFile.id}`} type={previewFile.mimetype} />
                  Your browser does not support the video tag.
                </video>
              ) : previewFile.mimetype === 'application/pdf' ? (
                <iframe
                  src={`/view/${previewFile.id}`}
                  className="w-full h-full rounded-2xl border-none bg-white"
                  title="PDF Viewer"
                />
              ) : (
                <div className="text-center space-y-6 glass p-20 rounded-[3rem]">
                  <div className="bg-indigo-600/10 p-10 rounded-full inline-block mb-4">
                    <File className="w-20 h-20 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-black">{previewFile.original_name}</h3>
                  <p className="text-[var(--text-muted)]">Preview not available for this file type.</p>
                  <a
                    href={`/download/${previewFile.id}`}
                    className="inline-block px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20"
                  >
                    Download File
                  </a>
                </div>
              )}

              <div className="mt-8 text-center bg-black/40 px-6 py-2 rounded-full backdrop-blur-md">
                <p className="text-sm font-bold text-white/50">{previewFile.original_name}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">{formatSize(previewFile.size)} • {previewFile.mimetype}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navbar */}
        <nav className="md:hidden fixed bottom-0 w-full bottom-nav-blur border-t border-slate-900/50 flex justify-around items-center p-6 z-50 rounded-t-[2.5rem] shadow-2xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <button onClick={() => setActiveTab('home')} className={`p-4 rounded-2xl transition-all ${activeTab === 'home' ? 'text-indigo-400 bg-indigo-600/10' : 'text-[var(--text-muted)]'}`}><Home className="w-7 h-7" /></button>

          <button onClick={() => setActiveTab('upload')} className="relative -top-10 p-6 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-600/40 text-white active:scale-95 transition-transform"><Plus className="w-9 h-9" /></button>

          <button onClick={() => setActiveTab('files')} className={`p-4 rounded-2xl transition-all ${activeTab === 'files' ? 'text-indigo-400 bg-indigo-600/10' : 'text-[var(--text-muted)]'}`}><List className="w-7 h-7" /></button>

          <button onClick={() => setActiveTab('settings')} className={`p-4 rounded-2xl transition-all ${activeTab === 'settings' ? 'text-indigo-400 bg-indigo-600/10' : 'text-[var(--text-muted)]'}`}><Settings className="w-7 h-7" /></button>
        </nav>
      </div>

    </div>
  );
}

export default App;
