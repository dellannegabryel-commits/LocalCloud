import React from 'react';

const StorageCard = ({ used, total }) => {
  const percentage = Math.round((used / total) * 100);
  
  return (
    <div className="bg-surface rounded-2xl p-6 border border-border shadow-xl mb-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-slate-500 text-[10px] font-bold mb-1 uppercase tracking-widest">Armazenamento</p>
          <h2 className="text-2xl font-bold text-white">
            {used} GB <span className="text-slate-500 text-sm font-medium">/ {total} GB</span>
          </h2>
        </div>
        <span className="text-primary-blue font-bold text-lg">{percentage}%</span>
      </div>
      
      <div className="h-2.5 w-full bg-black rounded-full border border-border/50 overflow-hidden">
        <div 
          className="h-full bg-primary-blue rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className="mt-4 text-[11px] text-slate-500 font-medium">
        Seu servidor LocalDrive está operando normalmente.
      </p>
    </div>
  );
};

export default StorageCard;
