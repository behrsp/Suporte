import React from 'react';
import { TabType, HealthStatus } from '../types';
import { Sliders, BookOpen, Database, BarChart3, Plus, RefreshCw, Cpu } from 'lucide-react';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenCreateModal: () => void;
  health: HealthStatus | null;
  onRefreshHealth: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateModal,
  health,
  onRefreshHealth,
  isRefreshing,
}) => {
  const getActionLabel = () => {
    switch (currentTab) {
      case 'parametros':
        return '+ Novo Parâmetro';
      case 'conhecimento':
        return '+ Novo Conhecimento';
      case 'tabelas':
        return '+ Nova Tabela';
      default:
        return '+ Novo Registro';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap block">
                Nexus DevHub
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Neon PostgreSQL</span>
                {health?.latencyMs !== undefined && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{health.latencyMs}ms</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => onSelectTab('parametros')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'parametros'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Parâmetros</span>
            </button>

            <button
              onClick={() => onSelectTab('conhecimento')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'conhecimento'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Banco de Conhecimento</span>
            </button>

            <button
              onClick={() => onSelectTab('tabelas')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'tabelas'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Cadastro de Tabelas</span>
            </button>

            <button
              onClick={() => onSelectTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'overview'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Visão Geral</span>
            </button>
          </nav>

          {/* Actions Zone */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRefreshHealth}
              disabled={isRefreshing}
              title="Recarregar status do banco de dados"
              aria-label="Recarregar status"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {currentTab !== 'overview' && (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-lg hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-md shadow-cyan-500/10 active:scale-[0.98] whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{getActionLabel()}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
