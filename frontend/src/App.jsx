import React, { useState, useEffect } from 'react';
import TabBar from './components/layout/TabBar';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Explorer from './pages/Explorer';
import SearchPage from './pages/Search';
import SettingsPage from './pages/Settings';
import { getFiles, uploadFile, searchFiles, deleteFile } from './api/apiClient';
import './styles/theme.css';
import { X, Upload, CheckCircle2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query if needed globally

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      // Handle network errors or other issues, e.g., display a message
      if (error.response) {
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  const toggleUpload = () => {
    if (uploading) return;
    setShowUpload(!showUpload);
    if (showUpload) { // If closing the modal, reset upload state
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0); // Reset progress
    try {
      await uploadFile(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
      
      // Success feedback
      setTimeout(() => {
        setUploading(false);
        setShowUpload(false);
        setProgress(0);
        fetchFiles(); // Refresh file list
      }, 2000); // Keep success message visible for 2 seconds
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
      alert('Erro no upload. Verifique o console para detalhes ou tente novamente.');
    }
  };

  // Function to refresh file list from any child component that needs it
  const refreshFileList = () => {
    fetchFiles();
  };

  return (
    <div className="min-h-screen bg-background text-white overflow-x-hidden font-sans selection:bg-primary-blue/30">
      
      {/* Sidebar for Desktop */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onUploadClick={toggleUpload} 
      />

      {/* Main Content Area */}
      <main className="md:ml-64 transition-all duration-300 relative min-h-screen">
        <div className="max-w-5xl mx-auto pb-20 md:pb-10">
          {activeTab === 'home' && <Home files={files} onRefresh={refreshFileList} />}
          {activeTab === 'explorer' && <Explorer files={files} onRefresh={refreshFileList} />}
          {activeTab === 'search' && <SearchPage onRefresh={refreshFileList} />} {/* Render SearchPage */}
          {activeTab === 'settings' && <SettingsPage setActiveTab={setActiveTab} />} {/* Render SettingsPage and pass setActiveTab */}
          
          {/* Placeholder for other potential tabs if needed */}
          {!(['home', 'explorer', 'search', 'settings'].includes(activeTab)) && (
            <div className="flex items-center justify-center min-h-screen p-6 text-center">
              <p className="text-slate-500 font-medium italic">Em breve...</p>
            </div>
          )}
        </div>
      </main>

      {/* TabBar for Mobile */}
      <TabBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onUploadClick={toggleUpload} 
      />

      {/* Upload Modal (Responsive Drawer) */}
      {showUpload && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={toggleUpload} />
          
          <div className="relative w-full max-w-lg bg-surface border border-border rounded-[2rem] p-8 animate-slide-up md:animate-none shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="md:hidden w-12 h-1 bg-border/50 rounded-full mx-auto mb-8" />
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold tracking-tight">Novo Arquivo</h3>
              <button 
                disabled={uploading}
                onClick={toggleUpload} 
                className="p-2.5 bg-black rounded-full border border-border text-slate-400 active:scale-90 transition-all hover:text-white disabled:opacity-30"
              >
                <X size={20} />
              </button>
            </div>

            {!uploading ? (
              <div className="space-y-4">
                <label className="border-2 border-dashed border-border/50 bg-black/40 rounded-[1.5rem] p-12 flex flex-col items-center justify-center gap-5 hover:border-primary-blue/50 transition-all group cursor-pointer">
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                  <div className="p-4 bg-primary-blue/10 rounded-full text-primary-blue group-hover:bg-primary-blue/20">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg mb-1 text-white">Selecionar do Dispositivo</p>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Suporta qualquer tipo de arquivo</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="py-6">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-primary-blue mb-1">
                      <div className="w-2 h-2 bg-primary-blue rounded-full animate-pulse" />
                      <p className="font-bold">Sincronizando...</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-primary-blue">{progress}%</span>
                </div>
                
                <div className="h-2.5 w-full bg-black rounded-full overflow-hidden border border-border/30">
                  <div 
                    className="h-full bg-primary-blue shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            {progress === 100 && !uploading && (
              <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400">
                <CheckCircle2 size={20} className="text-emerald-400" />
                <p className="text-sm font-bold">Upload concluído com sucesso!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
