import React, { useState, useEffect } from 'react';
import { Tabela } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface TabelaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { alias: string; nome: string }) => Promise<void>;
  initialData?: Tabela | null;
}

export const TabelaModal: React.FC<TabelaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [alias, setAlias] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setAlias(initialData.alias);
      setNome(initialData.nome);
    } else {
      setAlias('');
      setNome('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim()) {
      setError('Por favor, informe o Alias da tabela (ex: SA1, SB1, USR_LOGS).');
      return;
    }
    if (!nome.trim()) {
      setError('Por favor, informe o nome descritivo da tabela.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        alias: alias.trim().toUpperCase(),
        nome: nome.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar tabela');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto my-2.5" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-white">
            {initialData ? 'Alterar Tabela' : 'Nova Tabela'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Alias */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Alias da Tabela *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: SA1, SB1, TAB_CLIENTES"
              value={alias}
              onChange={(e) => setAlias(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 uppercase"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Abreviação ou identificador padrão no dicionário do banco.
            </p>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nome Descritivo da Tabela *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Cadastro Geral de Clientes e Fornecedores"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-5 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/10 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Cadastrar Tabela'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
