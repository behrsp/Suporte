import React from 'react';
import { TabType } from '../types';
import { Sliders, BookOpen, Database, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  counts?: {
    parametros: number;
    conhecimento: number;
    tabelas: number;
  };
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, counts }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
        {/* Tab 1: Parâmetros */}
        <button
          onClick={() => onSelectTab('parametros')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'parametros' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Sliders className="w-5 h-5" />
            {counts && counts.parametros > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] font-mono tabular-nums px-1 bg-slate-800 text-slate-300 rounded-full">
                {counts.parametros}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 whitespace-nowrap">Parâmetros</span>
        </button>

        {/* Tab 2: Conhecimento */}
        <button
          onClick={() => onSelectTab('conhecimento')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'conhecimento' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-5 h-5" />
            {counts && counts.conhecimento > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] font-mono tabular-nums px-1 bg-slate-800 text-slate-300 rounded-full">
                {counts.conhecimento}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 whitespace-nowrap">Conhecimento</span>
        </button>

        {/* Tab 3: Tabelas */}
        <button
          onClick={() => onSelectTab('tabelas')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'tabelas' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Database className="w-5 h-5" />
            {counts && counts.tabelas > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] font-mono tabular-nums px-1 bg-slate-800 text-slate-300 rounded-full">
                {counts.tabelas}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 whitespace-nowrap">Tabelas</span>
        </button>

        {/* Tab 4: Visão Geral */}
        <button
          onClick={() => onSelectTab('overview')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'overview' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[11px] mt-1 whitespace-nowrap">Métricas</span>
        </button>
      </div>
    </nav>
  );
};
