import React, { useState, useEffect, useRef } from 'react';
import { Conhecimento } from '../types';
import { X, Save, Upload, Trash2, Camera, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../utils/image';

interface ConhecimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { nome: string; foto?: string; descricao: string; solucao: string }) => Promise<void>;
  initialData?: Conhecimento | null;
}

export const ConhecimentoModal: React.FC<ConhecimentoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [solucao, setSolucao] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome);
      setFoto(initialData.foto || '');
      setDescricao(initialData.descricao || '');
      setSolucao(initialData.solucao);
    } else {
      setNome('');
      setFoto('');
      setDescricao('');
      setSolucao('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setError(null);
      const compressed = await compressImage(file);
      setFoto(compressed);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar imagem do dispositivo');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemovePhoto = () => {
    setFoto('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Por favor, informe o título/nome do conhecimento.');
      return;
    }
    if (!solucao.trim()) {
      setError('Por favor, informe a solução ou procedimento.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        nome: nome.trim(),
        foto: foto || '',
        descricao: descricao.trim(),
        solucao: solucao.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar registro de conhecimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-2xl bg-slate-900 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto my-2.5" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-white">
            {initialData ? 'Alterar Registro de Conhecimento' : 'Novo Registro de Conhecimento'}
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
              Nome / Título do Conhecimento *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Como resolver timeout em consultas do relatório financeiro"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Foto (Upload do dispositivo ou câmera) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Foto Ilustrativa (Upload do Dispositivo)
            </label>

            {foto ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-56">
                <img
                  src={foto}
                  alt="Pré-visualização do upload"
                  className="w-full h-48 object-contain bg-slate-950"
                />
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg shadow-md transition-colors flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Foto</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 text-center bg-slate-950/50">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400 mb-2">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Selecione uma imagem ou capture com a câmera
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                  JPG, PNG ou WebP compactados automaticamente
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {/* File input (Galleries & files) */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingImage}
                    className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>{isProcessingImage ? 'Processando...' : 'Escolher Arquivo'}</span>
                  </button>

                  {/* Camera direct input for mobile devices */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isProcessingImage}
                    className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Tirar Foto</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Descrição do Problema ou Contexto
            </label>
            <textarea
              rows={2}
              placeholder="Descreva a mensagem de erro recebida, cenário que reproduz ou sintomas..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
            />
          </div>

          {/* Solução (campo texto para descrever a solução) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Solução / Procedimento Passo a Passo *
            </label>
            <textarea
              rows={5}
              required
              placeholder="Descreva o passo a passo da solução técnica, comandos SQL, configuração ou script necessário..."
              value={solucao}
              onChange={(e) => setSolucao(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed font-mono text-xs sm:text-sm"
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
              disabled={isSubmitting || isProcessingImage}
              className="min-h-[44px] px-5 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/10 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Cadastrar Solução'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
