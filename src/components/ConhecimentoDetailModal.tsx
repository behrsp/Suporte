import React, { useState } from 'react';
import { Conhecimento } from '../types';
import { X, Copy, Check, Edit2, Trash2 } from 'lucide-react';

interface ConhecimentoDetailModalProps {
  item: Conhecimento | null;
  onClose: () => void;
  onEdit: (item: Conhecimento) => void;
  onDelete: (item: Conhecimento) => void;
}

export const ConhecimentoDetailModal: React.FC<ConhecimentoDetailModalProps> = ({
  item,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.solucao);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {item.nome}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>Registro #{item.id}</span>
              {item.created_at && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Registrado em {new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Photo enlarged */}
          {item.foto && (
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-80 flex items-center justify-center">
              <img
                src={item.foto}
                alt={item.nome}
                className="max-h-80 w-auto object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Description */}
          {item.descricao && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Descrição do Problema / Contexto
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                {item.descricao}
              </p>
            </div>
          )}

          {/* Solution */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Solução Técnica / Passo a Passo
              </h4>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Solução Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Solução</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
              {item.solucao}
            </pre>
          </div>
        </div>

        {/* Footer with edit/delete buttons */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(item);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
