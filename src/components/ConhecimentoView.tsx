import React, { useState } from 'react';
import { Conhecimento } from '../types';
import { Search, Plus, Edit2, Trash2, Copy, Check, ExternalLink, ImageIcon, BookOpen } from 'lucide-react';

interface ConhecimentoViewProps {
  itens: Conhecimento[];
  isLoading: boolean;
  onEdit: (item: Conhecimento) => void;
  onDelete: (item: Conhecimento) => void;
  onCreateNew: () => void;
  onViewDetails: (item: Conhecimento) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const ConhecimentoView: React.FC<ConhecimentoViewProps> = ({
  itens,
  isLoading,
  onEdit,
  onDelete,
  onCreateNew,
  onViewDetails,
  searchQuery,
  onSearchChange,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopySolution = (e: React.MouseEvent, id: number, solucao: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(solucao);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-5">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Banco de Conhecimento
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Base de dados de soluções técnicas, procedimentos, troubleshooting e fotos ilustrativas.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-lg hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-md shadow-cyan-500/10 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Conhecimento</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, problema, descrição ou solução técnica..."
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

      {/* List / Grid of Knowledge Items */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-48 bg-slate-900/40 border border-slate-800/60 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : itens.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">Nenhum registro encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? 'Nenhum resultado corresponde à sua busca.'
              : 'Registre procedimentos, soluções de erros com foto e instruções.'}
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Conhecimento</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {itens.map((item) => (
            <div
              key={item.id}
              onClick={() => onViewDetails(item)}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 hover:border-slate-700 transition-all flex flex-col justify-between cursor-pointer group shadow-lg"
            >
              <div className="space-y-3">
                {/* Header row with Title and actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                      {item.nome}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>Artigo #{item.id}</span>
                      {item.foto && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 text-cyan-400">
                            <ImageIcon className="w-3 h-3" />
                            <span>Com foto</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEdit(item)}
                      title="Editar registro"
                      aria-label="Editar registro de conhecimento"
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      title="Excluir registro"
                      aria-label="Excluir registro de conhecimento"
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Photo thumbnail if present */}
                {item.foto && (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={item.foto}
                      alt={item.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[11px] text-slate-300 flex items-center gap-1 font-medium">
                        <ExternalLink className="w-3 h-3" /> Toque para ampliar imagem
                      </span>
                    </div>
                  </div>
                )}

                {/* Description */}
                {item.descricao && (
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.descricao}
                  </p>
                )}

                {/* Solution Box Preview */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                    <span>Solução / Resolução:</span>
                    <button
                      onClick={(e) => handleCopySolution(e, item.id, item.solucao)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/60 transition-colors"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-3 font-mono text-[11px] leading-relaxed whitespace-pre-line">
                    {item.solucao}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="group-hover:text-cyan-400 transition-colors">
                  Visualizar detalhes &rarr;
                </span>
                <span>Toque para expandir</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
