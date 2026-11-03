/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TabType, Parametro, Conhecimento, Tabela, HealthStatus, TipoParametro } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ParametrosView } from './components/ParametrosView';
import { ParametroModal } from './components/ParametroModal';
import { ConhecimentoView } from './components/ConhecimentoView';
import { ConhecimentoModal } from './components/ConhecimentoModal';
import { ConhecimentoDetailModal } from './components/ConhecimentoDetailModal';
import { TabelasView } from './components/TabelasView';
import { TabelaModal } from './components/TabelaModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { OverviewView } from './components/OverviewView';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('parametros');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data states
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [conhecimento, setConhecimento] = useState<Conhecimento[]>([]);
  const [tabelas, setTabelas] = useState<Tabela[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter states
  const [paramSearch, setParamSearch] = useState('');
  const [paramTipo, setParamTipo] = useState('Todos');
  const [knowSearch, setKnowSearch] = useState('');
  const [tabSearch, setTabSearch] = useState('');

  // Modals
  const [isParamModalOpen, setIsParamModalOpen] = useState(false);
  const [paramToEdit, setParamToEdit] = useState<Parametro | null>(null);

  const [isKnowModalOpen, setIsKnowModalOpen] = useState(false);
  const [knowToEdit, setKnowToEdit] = useState<Conhecimento | null>(null);
  const [knowDetailItem, setKnowDetailItem] = useState<Conhecimento | null>(null);

  const [isTabModalOpen, setIsTabModalOpen] = useState(false);
  const [tabToEdit, setTabToEdit] = useState<Tabela | null>(null);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: 'parametro' | 'conhecimento' | 'tabela';
    id: number;
    title: string;
    name: string;
  }>({
    isOpen: false,
    type: 'parametro',
    id: 0,
    title: '',
    name: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [h, p, k, t] = await Promise.all([
        api.getHealth(),
        api.getParametros(paramSearch, paramTipo),
        api.getConhecimento(knowSearch),
        api.getTabelas(tabSearch),
      ]);
      setHealth(h);
      setParametros(p);
      setConhecimento(k);
      setTabelas(t);
    } catch (err: any) {
      showToast('Falha ao sincronizar dados com o banco', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [paramSearch, paramTipo, knowSearch, tabSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefreshHealth = async () => {
    setIsRefreshing(true);
    try {
      const h = await api.getHealth();
      setHealth(h);
      await loadData();
      showToast('Dados sincronizados com o Neon DB!', 'success');
    } catch (e) {
      showToast('Erro ao atualizar status', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handlers for Parâmetros
  const handleOpenCreateParam = () => {
    setParamToEdit(null);
    setIsParamModalOpen(true);
  };

  const handleSaveParametro = async (data: { nome: string; tipo: TipoParametro; descricao: string }) => {
    if (paramToEdit) {
      const updated = await api.updateParametro(paramToEdit.id, data);
      setParametros((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast(`Parâmetro ${updated.nome} atualizado!`, 'success');
    } else {
      const created = await api.createParametro(data);
      setParametros((prev) => [created, ...prev]);
      showToast(`Parâmetro ${created.nome} cadastrado!`, 'success');
    }
    // Refresh health counter
    api.getHealth().then(setHealth);
  };

  const handleConfirmDeleteParam = (param: Parametro) => {
    setDeleteModalState({
      isOpen: true,
      type: 'parametro',
      id: param.id,
      title: 'Excluir Parâmetro',
      name: param.nome,
    });
  };

  // Handlers for Conhecimento
  const handleOpenCreateKnow = () => {
    setKnowToEdit(null);
    setIsKnowModalOpen(true);
  };

  const handleSaveConhecimento = async (data: {
    nome: string;
    foto?: string;
    descricao: string;
    solucao: string;
  }) => {
    if (knowToEdit) {
      const updated = await api.updateConhecimento(knowToEdit.id, data);
      setConhecimento((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
      if (knowDetailItem && knowDetailItem.id === updated.id) {
        setKnowDetailItem(updated);
      }
      showToast(`Conhecimento "${updated.nome}" atualizado!`, 'success');
    } else {
      const created = await api.createConhecimento(data);
      setConhecimento((prev) => [created, ...prev]);
      showToast(`Novo conhecimento adicionado!`, 'success');
    }
    api.getHealth().then(setHealth);
  };

  const handleConfirmDeleteKnow = (item: Conhecimento) => {
    setDeleteModalState({
      isOpen: true,
      type: 'conhecimento',
      id: item.id,
      title: 'Excluir Registro de Conhecimento',
      name: item.nome,
    });
  };

  // Handlers for Tabelas
  const handleOpenCreateTab = () => {
    setTabToEdit(null);
    setIsTabModalOpen(true);
  };

  const handleSaveTabela = async (data: { alias: string; nome: string }) => {
    if (tabToEdit) {
      const updated = await api.updateTabela(tabToEdit.id, data);
      setTabelas((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      showToast(`Tabela ${updated.alias} atualizada!`, 'success');
    } else {
      const created = await api.createTabela(data);
      setTabelas((prev) => [created, ...prev]);
      showToast(`Tabela ${created.alias} cadastrada!`, 'success');
    }
    api.getHealth().then(setHealth);
  };

  const handleConfirmDeleteTab = (tabela: Tabela) => {
    setDeleteModalState({
      isOpen: true,
      type: 'tabela',
      id: tabela.id,
      title: 'Excluir Tabela do Catálogo',
      name: `${tabela.alias} - ${tabela.nome}`,
    });
  };

  // Delete execution
  const executeDelete = async () => {
    try {
      setIsDeleting(true);
      if (deleteModalState.type === 'parametro') {
        await api.deleteParametro(deleteModalState.id);
        setParametros((prev) => prev.filter((p) => p.id !== deleteModalState.id));
        showToast('Parâmetro excluído com sucesso.', 'success');
      } else if (deleteModalState.type === 'conhecimento') {
        await api.deleteConhecimento(deleteModalState.id);
        setConhecimento((prev) => prev.filter((k) => k.id !== deleteModalState.id));
        showToast('Registro de conhecimento excluído com sucesso.', 'success');
      } else if (deleteModalState.type === 'tabela') {
        await api.deleteTabela(deleteModalState.id);
        setTabelas((prev) => prev.filter((t) => t.id !== deleteModalState.id));
        showToast('Tabela excluída com sucesso.', 'success');
      }
      setDeleteModalState((prev) => ({ ...prev, isOpen: false }));
      api.getHealth().then(setHealth);
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir registro', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Global action button in header
  const handleOpenGlobalCreateModal = () => {
    if (currentTab === 'parametros') {
      handleOpenCreateParam();
    } else if (currentTab === 'conhecimento') {
      handleOpenCreateKnow();
    } else if (currentTab === 'tabelas') {
      handleOpenCreateTab();
    }
  };

  const counts = {
    parametros: parametros.length,
    conhecimento: conhecimento.length,
    tabelas: tabelas.length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCreateModal={handleOpenGlobalCreateModal}
        health={health}
        onRefreshHealth={handleRefreshHealth}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-24 md:pb-12">
        {currentTab === 'parametros' && (
          <ParametrosView
            parametros={parametros}
            isLoading={isLoading}
            onEdit={(p) => {
              setParamToEdit(p);
              setIsParamModalOpen(true);
            }}
            onDelete={handleConfirmDeleteParam}
            onCreateNew={handleOpenCreateParam}
            searchQuery={paramSearch}
            onSearchChange={setParamSearch}
            selectedTipo={paramTipo}
            onTipoChange={setParamTipo}
          />
        )}

        {currentTab === 'conhecimento' && (
          <ConhecimentoView
            itens={conhecimento}
            isLoading={isLoading}
            onEdit={(k) => {
              setKnowToEdit(k);
              setIsKnowModalOpen(true);
            }}
            onDelete={handleConfirmDeleteKnow}
            onCreateNew={handleOpenCreateKnow}
            onViewDetails={(k) => setKnowDetailItem(k)}
            searchQuery={knowSearch}
            onSearchChange={setKnowSearch}
          />
        )}

        {currentTab === 'tabelas' && (
          <TabelasView
            tabelas={tabelas}
            isLoading={isLoading}
            onEdit={(t) => {
              setTabToEdit(t);
              setIsTabModalOpen(true);
            }}
            onDelete={handleConfirmDeleteTab}
            onCreateNew={handleOpenCreateTab}
            searchQuery={tabSearch}
            onSearchChange={setTabSearch}
          />
        )}

        {currentTab === 'overview' && (
          <OverviewView
            health={health}
            counts={counts}
            onSelectTab={setCurrentTab}
            parametros={parametros}
            conhecimento={conhecimento}
            tabelas={tabelas}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} counts={counts} />

      {/* Modals */}
      <ParametroModal
        isOpen={isParamModalOpen}
        onClose={() => setIsParamModalOpen(false)}
        onSave={handleSaveParametro}
        initialData={paramToEdit}
      />

      <ConhecimentoModal
        isOpen={isKnowModalOpen}
        onClose={() => setIsKnowModalOpen(false)}
        onSave={handleSaveConhecimento}
        initialData={knowToEdit}
      />

      <ConhecimentoDetailModal
        item={knowDetailItem}
        onClose={() => setKnowDetailItem(null)}
        onEdit={(k) => {
          setKnowDetailItem(null);
          setKnowToEdit(k);
          setIsKnowModalOpen(true);
        }}
        onDelete={(k) => {
          setKnowDetailItem(null);
          handleConfirmDeleteKnow(k);
        }}
      />

      <TabelaModal
        isOpen={isTabModalOpen}
        onClose={() => setIsTabModalOpen(false)}
        onSave={handleSaveTabela}
        initialData={tabToEdit}
      />

      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={executeDelete}
        title={deleteModalState.title}
        itemName={deleteModalState.name}
        isDeleting={isDeleting}
      />

      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-2xl border text-xs sm:text-sm font-medium transition-all animate-in slide-in-from-top-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/95 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
