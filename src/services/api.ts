import { Parametro, Conhecimento, Tabela, HealthStatus } from '../types';

export const api = {
  // Health & DB info
  async getHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Falha ao checar saúde do sistema');
      return await res.json();
    } catch (e: any) {
      return {
        status: 'fallback',
        connected: false,
        dbProvider: 'Neon PostgreSQL (Offline)',
        latencyMs: 0,
        error: e.message,
      };
    }
  },

  // Parâmetros
  async getParametros(query?: string, tipo?: string): Promise<Parametro[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (tipo && tipo !== 'Todos') params.append('tipo', tipo);

    const res = await fetch(`/api/parametros?${params.toString()}`);
    if (!res.ok) throw new Error('Erro ao listar parâmetros');
    return await res.json();
  },

  async createParametro(data: Omit<Parametro, 'id' | 'created_at' | 'updated_at'>): Promise<Parametro> {
    const res = await fetch('/api/parametros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao criar parâmetro');
    }
    return await res.json();
  },

  async updateParametro(id: number, data: Partial<Parametro>): Promise<Parametro> {
    const res = await fetch(`/api/parametros/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao atualizar parâmetro');
    }
    return await res.json();
  },

  async deleteParametro(id: number): Promise<void> {
    const res = await fetch(`/api/parametros/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao excluir parâmetro');
    }
  },

  // Conhecimento
  async getConhecimento(query?: string): Promise<Conhecimento[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);

    const res = await fetch(`/api/conhecimento?${params.toString()}`);
    if (!res.ok) throw new Error('Erro ao listar itens do banco de conhecimento');
    return await res.json();
  },

  async createConhecimento(data: Omit<Conhecimento, 'id' | 'created_at' | 'updated_at'>): Promise<Conhecimento> {
    const res = await fetch('/api/conhecimento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao criar registro de conhecimento');
    }
    return await res.json();
  },

  async updateConhecimento(id: number, data: Partial<Conhecimento>): Promise<Conhecimento> {
    const res = await fetch(`/api/conhecimento/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao atualizar registro de conhecimento');
    }
    return await res.json();
  },

  async deleteConhecimento(id: number): Promise<void> {
    const res = await fetch(`/api/conhecimento/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao excluir registro de conhecimento');
    }
  },

  // Tabelas
  async getTabelas(query?: string): Promise<Tabela[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);

    const res = await fetch(`/api/tabelas?${params.toString()}`);
    if (!res.ok) throw new Error('Erro ao listar tabelas');
    return await res.json();
  },

  async createTabela(data: Omit<Tabela, 'id' | 'created_at' | 'updated_at'>): Promise<Tabela> {
    const res = await fetch('/api/tabelas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao criar tabela');
    }
    return await res.json();
  },

  async updateTabela(id: number, data: Partial<Tabela>): Promise<Tabela> {
    const res = await fetch(`/api/tabelas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao atualizar tabela');
    }
    return await res.json();
  },

  async deleteTabela(id: number): Promise<void> {
    const res = await fetch(`/api/tabelas/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao excluir tabela');
    }
  },
};
