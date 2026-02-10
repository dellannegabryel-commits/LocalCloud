import { useState, useEffect } from 'react';
import {
  Upload, HardDrive, List, LayoutGrid, Search, Trash2,
  Download, FileText, Image as ImageIcon, File, X, Plus, Home, Settings
} from 'lucide-react';
import api from './api/axios';
import './index.css';

function App() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

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
      setActiveTab('files'); // Switch to files tab after upload
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
    if (mimetype === 'application/pdf' || mimetype.includes('text')) return <FileText className="w-5 h-5 text-blue-400" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const filteredFiles = files.filter(f =>
    f.original_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-200 flex flex-col md:flex-row overflow-hidden font-sans">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-slate-900/50 p-8 flex-col gap-10 bg-slate-950/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-600/20">
            <HardDrive className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">LocalDrive</h1>
        </div>

        <nav className="flex flex-col gap-3">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'files', icon: List, label: 'Files' },
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
            <div className="bg-gradient-to-r from-indigo-600 to-purple-500 w-[15%] h-full rounded-full"></div>
          </div>
          <p className="text-sm font-medium text-slate-300">1.2 GB <span className="text-slate-600 ml-1">of 10 GB</span></p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-5 bg-slate-950/80 backdrop-blur-lg border-b border-slate-900 fixed top-0 w-full z-40">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <HardDrive className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">LocalDrive</span>
        </div>
        <button
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            if (isSearchOpen) setSearchQuery('');
          }}
          className="p-2 hover:bg-slate-900 rounded-full transition-colors active:scale-95"
        >
          {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full md:relative">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pt-20 pb-24 md:py-12 md:px-12 px-5 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-10">

            {/* Mobile Search Bar Expansion */}
            {isSearchOpen && (
              <div className="md:hidden animate-in slide-in-from-top duration-300">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your files..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* View Selection Logic */}
            {activeTab === 'home' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="hidden md:block">
                  <h2 className="text-4xl font-extrabold mb-2 tracking-tight">Your Space</h2>
                  <p className="text-slate-500 text-lg">Centralize and manage your digital life with ease.</p>
                </div>

                {/* Upload Zone */}
                <div
                  className={`relative group border-2 border-dashed rounded-[2.5rem] p-10 md:p-20 transition-all duration-500 flex flex-col items-center justify-center gap-6 ${dragActive ? 'border-indigo-500 bg-indigo-500/5 rotate-1 scale-[1.02]' : 'border-slate-800/60 hover:border-slate-700 bg-slate-900/30'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleUpload(file);
                  }}
                >
                  <div className="bg-indigo-600/15 p-8 rounded-3xl group-hover:scale-110 transition-transform duration-500 group-hover:bg-indigo-600/20">
                    <Upload className="w-12 h-12 md:w-16 md:h-16 text-indigo-500" />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-2xl font-bold md:text-3xl">Upload Files</p>
                    <p className="text-slate-500 text-sm md:text-base max-w-[240px] md:max-w-sm mx-auto leading-relaxed">
                      Drag and drop your files here or tap the button to select from your device.
                    </p>
                  </div>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleUpload(e.target.files[0])}
                  />

                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-950/90 rounded-[2.5rem] flex items-center justify-center backdrop-blur-md z-10 animate-in fade-in duration-300">
                      <div className="flex flex-col items-center gap-5">
                        <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-2xl shadow-indigo-500/20"></div>
                        <p className="text-indigo-400 font-bold tracking-widest text-lg animate-pulse uppercase">Uploading</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(activeTab === 'files' || activeTab === 'home') && (
              <section className="space-y-6 pb-12 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold flex items-center gap-4">
                    {activeTab === 'home' ? 'Recent Files' : 'All Files'}
                    <span className="bg-slate-900 text-slate-500 px-3 py-1 rounded-xl text-xs font-mono border border-slate-800/50">
                      {searchQuery ? filteredFiles.length : files.length} TOTAL
                    </span>
                  </h3>
                  <div className="hidden md:block relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Quick search"
                      className="bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48 focus:w-64 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  {(searchQuery ? filteredFiles : files.slice(0, activeTab === 'home' ? 5 : undefined)).map((file) => (
                    <div key={file.id} className="glass p-5 rounded-[2.5rem] flex items-center justify-between group hover:bg-slate-900/60 transition-all border border-transparent hover:border-slate-800/50">
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="bg-slate-900 p-4 rounded-[1.25rem] shrink-0 shadow-inner">
                          {getFileIcon(file.mimetype)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-200 truncate pr-4 text-lg">{file.original_name}</p>
                          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                            {formatSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <a
                          href={`http://localhost:3001/download/${file.id}`}
                          className="p-3.5 bg-slate-900/50 hover:bg-indigo-600/20 rounded-2xl text-slate-400 hover:text-indigo-400 transition-all active:scale-90"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-3.5 bg-slate-900/50 hover:bg-red-500/10 rounded-2xl text-slate-400 hover:text-red-500 transition-all active:scale-90"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {files.length === 0 && (
                    <div className="text-center py-24 bg-slate-900/10 rounded-[3rem] border-2 border-slate-900/50 border-dashed flex flex-col items-center gap-5">
                      <div className="p-6 bg-slate-900 rounded-full shadow-inner">
                        <File className="w-12 h-12 text-slate-800" />
                      </div>
                      <p className="text-slate-600 font-medium text-lg">Your storage is empty.</p>
                      <button onClick={() => setActiveTab('home')} className="text-indigo-500 font-bold hover:underline">Upload your first file</button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'settings' && (
              <div className="animate-in fade-in slide-in-from-right-5 duration-500 py-10">
                <h3 className="text-3xl font-bold mb-8">Settings</h3>
                <div className="glass p-8 rounded-[2.5rem] space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl">
                    <span className="font-medium">Dark Mode (Default)</span>
                    <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm">More settings coming soon to your local cloud.</p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 w-full bottom-nav-blur border-t border-slate-900/50 flex justify-around items-center p-4 z-50 pb-8">
          <button
            onClick={() => setActiveTab('home')}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'home' ? 'text-indigo-400' : 'text-slate-600'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className="group relative -top-6 p-5 bg-indigo-600 rounded-[1.75rem] shadow-2xl shadow-indigo-600/40 text-white transition-all active:scale-95"
          >
            <Plus className="w-8 h-8" />
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'files' ? 'text-indigo-400' : 'text-slate-600'}`}
          >
            <List className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Files</span>
          </button>
        </nav>
      </div>

    </div>
  );
}

export default App;
