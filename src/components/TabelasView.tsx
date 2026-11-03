import React, { useState } from 'react';
import { Tabela } from '../types';
import { Search, Plus, Edit2, Trash2, Copy, Check, Database, Table } from 'lucide-react';

interface TabelasViewProps {
  tabelas: Tabela[];
  isLoading: boolean;
  onEdit: (tabela: Tabela) => void;
  onDelete: (tabela: Tabela) => void;
  onCreateNew: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TabelasView: React.FC<TabelasViewProps> = ({
  tabelas,
  isLoading,
  onEdit,
  onDelete,
  onCreateNew,
  searchQuery,
  onSearchChange,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyAlias = (id: number, alias: string) => {
    navigator.clipboard.writeText(alias);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-5">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Cadastro de Tabelas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Dicionário de dados, mapeamento de aliases e nomenclaturas das tabelas do sistema.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-lg hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-md shadow-cyan-500/10 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tabela</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Alias (ex: SA1, SB1) ou Nome da tabela..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-16 bg-slate-900/40 border border-slate-800/60 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : tabelas.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <Table className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">Nenhuma tabela cadastrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? 'Nenhuma tabela encontrada para o termo pesquisado.'
              : 'Cadastre aliases e nomes das tabelas do banco de dados para consulta rápida.'}
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Tabela</span>
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card List (md:hidden) */}
          <div className="space-y-3 md:hidden">
            {tabelas.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700 flex items-center justify-between gap-3 shadow-md"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400 text-sm tracking-wider px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {item.alias}
                    </span>
                    <button
                      onClick={() => handleCopyAlias(item.id, item.alias)}
                      title="Copiar Alias"
                      className="text-slate-500 hover:text-slate-300 p-1"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <h3 className="text-sm font-medium text-white mt-1.5 leading-snug">
                    {item.nome}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>ID #{item.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(item)}
                    title="Editar tabela"
                    aria-label="Editar tabela"
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    title="Excluir tabela"
                    aria-label="Excluir tabela"
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-44">Alias</th>
                  <th className="py-3.5 px-4">Nome da Tabela</th>
                  <th className="py-3.5 px-4 w-40">Identificador</th>
                  <th className="py-3.5 px-4 w-28 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {tabelas.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400 tracking-wider px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800">
                          {item.alias}
                        </span>
                        <button
                          onClick={() => handleCopyAlias(item.id, item.alias)}
                          title="Copiar alias"
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 p-0.5 transition-opacity"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-middle font-medium text-slate-100">
                      {item.nome}
                    </td>
                    <td className="py-3.5 px-4 align-middle text-xs text-slate-400 font-mono tabular-nums">
                      Tabela #{item.id}
                    </td>
                    <td className="py-3.5 px-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(item)}
                          title="Editar tabela"
                          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-md hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          title="Excluir tabela"
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
