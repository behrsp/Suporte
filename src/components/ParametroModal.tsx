import React, { useState, useEffect } from 'react';
import { Parametro, TipoParametro } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface ParametroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { nome: string; tipo: TipoParametro; descricao: string }) => Promise<void>;
  initialData?: Parametro | null;
}

const TIPOS: TipoParametro[] = ['Lógico', 'Caractere', 'Número', 'Data'];

export const ParametroModal: React.FC<ParametroModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoParametro>('Caractere');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome);
      setTipo(initialData.tipo);
      setDescricao(initialData.descricao || '');
    } else {
      setNome('');
      setTipo('Caractere');
      setDescricao('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Por favor, informe o nome do parâmetro.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        nome: nome.trim(),
        tipo,
        descricao: descricao.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar parâmetro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-slate-900 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto my-2.5" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-white">
            {initialData ? 'Alterar Parâmetro' : 'Novo Parâmetro'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nome do Parâmetro *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: MV_TIMEOUT_REQ, CONFIG_MODO_DEBUG"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Identificador único da variável ou constante no sistema.
            </p>
          </div>

          {/* Tipo (Lógico, Caractere, Número ou Data) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tipo do Parâmetro *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIPOS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                    tipo === t
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Descrição (o que este parâmetro faz)
            </label>
            <textarea
              rows={4}
              placeholder="Descreva a finalidade técnica ou operacional deste parâmetro, valores permitidos e impacto..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
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
              <span>{isSubmitting ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Cadastrar Parâmetro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
