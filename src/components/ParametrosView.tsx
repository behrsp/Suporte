import React, { useState } from 'react';
import { Parametro, TipoParametro } from '../types';
import { Search, Plus, Edit2, Trash2, Copy, Check, Filter, SlidersHorizontal } from 'lucide-react';

interface ParametrosViewProps {
  parametros: Parametro[];
  isLoading: boolean;
  onEdit: (param: Parametro) => void;
  onDelete: (param: Parametro) => void;
  onCreateNew: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTipo: string;
  onTipoChange: (tipo: string) => void;
}

const TIPOS: (TipoParametro | 'Todos')[] = ['Todos', 'Lógico', 'Caractere', 'Número', 'Data'];

export const ParametrosView: React.FC<ParametrosViewProps> = ({
  parametros,
  isLoading,
  onEdit,
  onDelete,
  onCreateNew,
  searchQuery,
  onSearchChange,
  selectedTipo,
  onTipoChange,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyName = (id: number, name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getTipoColor = (tipo: TipoParametro) => {
    switch (tipo) {
      case 'Lógico':
        return 'text-amber-400';
      case 'Caractere':
        return 'text-cyan-400';
      case 'Número':
        return 'text-emerald-400';
      case 'Data':
        return 'text-purple-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header section with search and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Cadastro de Parâmetros
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Gerencie constantes de sistema, regras de negócio e flags de ambiente.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-lg hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-md shadow-cyan-500/10 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Parâmetro</span>
        </button>
      </div>

      {/* Search Bar & Type Filter */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou descrição do parâmetro..."
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

        {/* Segmented type filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Tipo:</span>
          </span>
          {TIPOS.map((tipo) => (
            <button
              key={tipo}
              onClick={() => onTipoChange(tipo)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedTipo === tipo
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-20 bg-slate-900/40 border border-slate-800/60 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : parametros.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">Nenhum parâmetro encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || selectedTipo !== 'Todos'
              ? 'Tente ajustar os filtros ou a palavra-chave da sua pesquisa.'
              : 'Cadastre o primeiro parâmetro do sistema para começar.'}
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Parâmetro</span>
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card List (md:hidden) */}
          <div className="space-y-3 md:hidden">
            {parametros.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 transition-all hover:border-slate-700 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-cyan-400 text-sm tracking-wide">
                        {item.nome}
                      </span>
                      <button
                        onClick={() => handleCopyName(item.id, item.nome)}
                        title="Copiar nome do parâmetro"
                        className="text-slate-500 hover:text-slate-300 p-1"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    {/* Unboxed metadata adhering to zero-pill rule */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className={`font-medium ${getTipoColor(item.tipo)}`}>
                        {item.tipo}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">ID #{item.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      title="Editar"
                      aria-label="Editar parâmetro"
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      title="Excluir"
                      aria-label="Excluir parâmetro"
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/50">
                  {item.descricao || 'Sem descrição cadastrada.'}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-48">Nome</th>
                  <th className="py-3.5 px-4 w-32">Tipo</th>
                  <th className="py-3.5 px-4">Descrição do que faz</th>
                  <th className="py-3.5 px-4 w-28 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {parametros.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-cyan-400 tracking-wide">
                          {item.nome}
                        </span>
                        <button
                          onClick={() => handleCopyName(item.id, item.nome)}
                          title="Copiar nome"
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
                    <td className="py-3.5 px-4 align-top">
                      <span className={`font-medium text-xs ${getTipoColor(item.tipo)}`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 align-top text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {item.descricao || (
                        <span className="text-slate-500 italic">Sem descrição</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(item)}
                          title="Editar parâmetro"
                          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-md hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          title="Excluir parâmetro"
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
