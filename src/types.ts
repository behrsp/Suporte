export type TipoParametro = 'Lógico' | 'Caractere' | 'Número' | 'Data';

export interface Parametro {
  id: number;
  nome: string;
  tipo: TipoParametro;
  descricao: string;
  created_at?: string;
  updated_at?: string;
}

export interface Conhecimento {
  id: number;
  nome: string;
  foto?: string;
  descricao: string;
  solucao: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tabela {
  id: number;
  alias: string;
  nome: string;
  created_at?: string;
  updated_at?: string;
}

export interface HealthStatus {
  status: 'connected' | 'fallback';
  connected: boolean;
  dbProvider: string;
  latencyMs: number;
  error?: string | null;
  stats?: {
    parametros: number;
    conhecimento: number;
    tabelas: number;
  };
}

export type TabType = 'parametros' | 'conhecimento' | 'tabelas' | 'overview';
