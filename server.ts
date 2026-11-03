import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser with 20mb limit for image uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Database connection
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_Fn0lgvZMb3XJ@ep-lingering-mountain-b6zhlsfh-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const { Pool } = pg;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

let dbConnected = false;
let dbError: string | null = null;

// Initialize tables in Neon DB
async function initDatabase() {
  try {
    const client = await pool.connect();
    try {
      console.log('Connecting to Neon PostgreSQL database...');

      // 1. Parameters table
      await client.query(`
        CREATE TABLE IF NOT EXISTS nexus_parametros (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          tipo VARCHAR(50) NOT NULL,
          descricao TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 2. Knowledge base table
      await client.query(`
        CREATE TABLE IF NOT EXISTS nexus_conhecimento (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          foto TEXT,
          descricao TEXT,
          solucao TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 3. Tables catalog table
      await client.query(`
        CREATE TABLE IF NOT EXISTS nexus_tabelas (
          id SERIAL PRIMARY KEY,
          alias VARCHAR(100) NOT NULL,
          nome VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Check if parameters has data, if not seed realistic initial samples
      const paramCountRes = await client.query('SELECT COUNT(*) FROM nexus_parametros');
      if (parseInt(paramCountRes.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO nexus_parametros (nome, tipo, descricao) VALUES
          ('MV_AMBDESC', 'Caractere', 'Descrição do ambiente de execução do sistema (Produção / Homologação).'),
          ('MV_NOTIFLOG', 'Lógico', 'Habilita ou desabilita o disparo de notificações de log no painel.'),
          ('MV_TIMEOUT_REQ', 'Número', 'Tempo limite em segundos para requisições externas antes de abortar conexão.'),
          ('MV_DTFECHAM', 'Data', 'Data limite de fechamento contábil e apuração periódica de saldos.');
        `);
      }

      // Check if knowledge base has data, if not seed initial sample
      const knowCountRes = await client.query('SELECT COUNT(*) FROM nexus_conhecimento');
      if (parseInt(knowCountRes.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO nexus_conhecimento (nome, foto, descricao, solucao) VALUES
          ('Configuração de Pooler SSL Neon', '', 'Erro de handshake e timeout em conexões com poolers de banco na nuvem.', 'Certifique-se de usar sslmode=require na connection string e ajuste o timeout de conexão do client para 10000ms. Verifique se o pool está configurado para reutilizar conexões inativas com keepAlive.'),
          ('Otimização de Índices por Alias de Tabela', '', 'Lentidão em relatórios de consulta cruzada entre cadastros mestres e movimentos.', 'Crie índices compostos cobrindo o campo de alias e a chave de busca principal (ex: CREATE INDEX idx_alias_cod ON tabela(alias, codigo)). Realize um EXPLAIN ANALYZE para conferir o plano.');
        `);
      }

      // Check if tables has data, if not seed initial sample
      const tabCountRes = await client.query('SELECT COUNT(*) FROM nexus_tabelas');
      if (parseInt(tabCountRes.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO nexus_tabelas (alias, nome) VALUES
          ('SA1', 'Cadastro Geral de Clientes e Fornecedores'),
          ('SB1', 'Descrição e Especificação de Produtos'),
          ('SC5', 'Cabeçalho de Pedidos de Venda'),
          ('SE1', 'Contas a Receber e Títulos Financeiros');
        `);
      }

      dbConnected = true;
      dbError = null;
      console.log('Neon PostgreSQL initialized successfully!');
    } finally {
      client.release();
    }
  } catch (err: any) {
    dbConnected = false;
    dbError = err.message || 'Erro ao conectar ao Neon DB';
    console.error('Database connection error:', err);
  }
}

initDatabase();

// In-memory fallback in case of temporary database outage
const memoryFallback = {
  parametros: [
    {
      id: 1,
      nome: 'MV_AMBDESC',
      tipo: 'Caractere',
      descricao: 'Descrição do ambiente de execução do sistema.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      nome: 'MV_NOTIFLOG',
      tipo: 'Lógico',
      descricao: 'Habilita ou desabilita notificações no painel.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  conhecimento: [
    {
      id: 1,
      nome: 'Configuração de Pooler SSL Neon',
      foto: '',
      descricao: 'Dúvidas frequentes de conexão com o banco.',
      solucao: 'Configure sslmode=require e timeout adequado.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  tabelas: [
    {
      id: 1,
      alias: 'SA1',
      nome: 'Cadastro de Clientes',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

// Health & DB status
app.get('/api/health', async (_req, res) => {
  let isLive = false;
  let latency = 0;
  let stats = { parametros: 0, conhecimento: 0, tabelas: 0 };

  const start = Date.now();
  try {
    const result = await pool.query('SELECT 1 as live');
    latency = Date.now() - start;
    isLive = result.rows[0]?.live === 1;

    const [p, k, t] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM nexus_parametros'),
      pool.query('SELECT COUNT(*) FROM nexus_conhecimento'),
      pool.query('SELECT COUNT(*) FROM nexus_tabelas'),
    ]);

    stats = {
      parametros: parseInt(p.rows[0].count, 10),
      conhecimento: parseInt(k.rows[0].count, 10),
      tabelas: parseInt(t.rows[0].count, 10),
    };
    dbConnected = true;
    dbError = null;
  } catch (err: any) {
    dbConnected = false;
    dbError = err.message;
    stats = {
      parametros: memoryFallback.parametros.length,
      conhecimento: memoryFallback.conhecimento.length,
      tabelas: memoryFallback.tabelas.length,
    };
  }

  res.json({
    status: isLive ? 'connected' : 'fallback',
    connected: isLive,
    dbProvider: 'Neon PostgreSQL',
    latencyMs: latency,
    error: dbError,
    stats,
  });
});

// ==========================================
// 1. PARAMETROS CRUD
// ==========================================

// GET /api/parametros
app.get('/api/parametros', async (req, res) => {
  const { q, tipo } = req.query;
  try {
    let query = 'SELECT * FROM nexus_parametros WHERE 1=1';
    const params: any[] = [];

    if (q && typeof q === 'string' && q.trim()) {
      params.push(`%${q.trim()}%`);
      query += ` AND (nome ILIKE $${params.length} OR descricao ILIKE $${params.length})`;
    }

    if (tipo && typeof tipo === 'string' && tipo.trim() && tipo !== 'Todos') {
      params.push(tipo.trim());
      query += ` AND tipo = $${params.length}`;
    }

    query += ' ORDER BY id DESC';

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err: any) {
    console.warn('Fallback to memory for parametros:', err.message);
    let items = [...memoryFallback.parametros];
    if (q && typeof q === 'string') {
      const lower = q.toLowerCase();
      items = items.filter(
        (i) => i.nome.toLowerCase().includes(lower) || i.descricao.toLowerCase().includes(lower)
      );
    }
    if (tipo && typeof tipo === 'string' && tipo !== 'Todos') {
      items = items.filter((i) => i.tipo === tipo);
    }
    return res.json(items);
  }
});

// POST /api/parametros
app.post('/api/parametros', async (req, res) => {
  const { nome, tipo, descricao } = req.body;

  if (!nome || !tipo) {
    return res.status(400).json({ error: 'Nome e Tipo são obrigatórios.' });
  }

  const validTypes = ['Lógico', 'Caractere', 'Número', 'Data'];
  if (!validTypes.includes(tipo)) {
    return res.status(400).json({ error: `Tipo inválido. Deve ser um de: ${validTypes.join(', ')}` });
  }

  try {
    const result = await pool.query(
      `INSERT INTO nexus_parametros (nome, tipo, descricao, updated_at) 
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [nome.trim(), tipo, descricao ? descricao.trim() : '']
    );
    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating parametro:', err);
    // memory fallback
    const newItem = {
      id: Date.now(),
      nome: nome.trim(),
      tipo,
      descricao: descricao ? descricao.trim() : '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryFallback.parametros.unshift(newItem);
    return res.status(201).json(newItem);
  }
});

// PUT /api/parametros/:id
app.put('/api/parametros/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, descricao } = req.body;

  if (!nome || !tipo) {
    return res.status(400).json({ error: 'Nome e Tipo são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `UPDATE nexus_parametros 
       SET nome = $1, tipo = $2, descricao = $3, updated_at = NOW() 
       WHERE id = $4 RETURNING *`,
      [nome.trim(), tipo, descricao ? descricao.trim() : '', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parâmetro não encontrado.' });
    }
    return res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error updating parametro:', err);
    const index = memoryFallback.parametros.findIndex((p) => p.id === Number(id));
    if (index !== -1) {
      memoryFallback.parametros[index] = {
        ...memoryFallback.parametros[index],
        nome: nome.trim(),
        tipo,
        descricao: descricao ? descricao.trim() : '',
        updated_at: new Date().toISOString(),
      };
      return res.json(memoryFallback.parametros[index]);
    }
    return res.status(500).json({ error: 'Erro ao atualizar parâmetro.' });
  }
});

// DELETE /api/parametros/:id
app.delete('/api/parametros/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM nexus_parametros WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parâmetro não encontrado.' });
    }
    return res.json({ success: true, id: Number(id) });
  } catch (err: any) {
    console.error('Error deleting parametro:', err);
    memoryFallback.parametros = memoryFallback.parametros.filter((p) => p.id !== Number(id));
    return res.json({ success: true, id: Number(id) });
  }
});

// ==========================================
// 2. BANCO DE CONHECIMENTO CRUD
// ==========================================

// GET /api/conhecimento
app.get('/api/conhecimento', async (req, res) => {
  const { q } = req.query;
  try {
    let query = 'SELECT * FROM nexus_conhecimento WHERE 1=1';
    const params: any[] = [];

    if (q && typeof q === 'string' && q.trim()) {
      params.push(`%${q.trim()}%`);
      query += ` AND (nome ILIKE $${params.length} OR descricao ILIKE $${params.length} OR solucao ILIKE $${params.length})`;
    }

    query += ' ORDER BY id DESC';

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err: any) {
    console.warn('Fallback to memory for conhecimento:', err.message);
    let items = [...memoryFallback.conhecimento];
    if (q && typeof q === 'string') {
      const lower = q.toLowerCase();
      items = items.filter(
        (i) =>
          i.nome.toLowerCase().includes(lower) ||
          i.descricao.toLowerCase().includes(lower) ||
          i.solucao.toLowerCase().includes(lower)
      );
    }
    return res.json(items);
  }
});

// POST /api/conhecimento
app.post('/api/conhecimento', async (req, res) => {
  const { nome, foto, descricao, solucao } = req.body;

  if (!nome || !solucao) {
    return res.status(400).json({ error: 'Nome e Solução são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO nexus_conhecimento (nome, foto, descricao, solucao, updated_at) 
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [nome.trim(), foto || '', descricao ? descricao.trim() : '', solucao.trim()]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating conhecimento:', err);
    const newItem = {
      id: Date.now(),
      nome: nome.trim(),
      foto: foto || '',
      descricao: descricao ? descricao.trim() : '',
      solucao: solucao.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryFallback.conhecimento.unshift(newItem);
    return res.status(201).json(newItem);
  }
});

// PUT /api/conhecimento/:id
app.put('/api/conhecimento/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, foto, descricao, solucao } = req.body;

  if (!nome || !solucao) {
    return res.status(400).json({ error: 'Nome e Solução são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `UPDATE nexus_conhecimento 
       SET nome = $1, foto = $2, descricao = $3, solucao = $4, updated_at = NOW() 
       WHERE id = $5 RETURNING *`,
      [nome.trim(), foto || '', descricao ? descricao.trim() : '', solucao.trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro de conhecimento não encontrado.' });
    }
    return res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error updating conhecimento:', err);
    const index = memoryFallback.conhecimento.findIndex((c) => c.id === Number(id));
    if (index !== -1) {
      memoryFallback.conhecimento[index] = {
        ...memoryFallback.conhecimento[index],
        nome: nome.trim(),
        foto: foto !== undefined ? foto : memoryFallback.conhecimento[index].foto,
        descricao: descricao ? descricao.trim() : '',
        solucao: solucao.trim(),
        updated_at: new Date().toISOString(),
      };
      return res.json(memoryFallback.conhecimento[index]);
    }
    return res.status(500).json({ error: 'Erro ao atualizar conhecimento.' });
  }
});

// DELETE /api/conhecimento/:id
app.delete('/api/conhecimento/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM nexus_conhecimento WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro de conhecimento não encontrado.' });
    }
    return res.json({ success: true, id: Number(id) });
  } catch (err: any) {
    console.error('Error deleting conhecimento:', err);
    memoryFallback.conhecimento = memoryFallback.conhecimento.filter((c) => c.id !== Number(id));
    return res.json({ success: true, id: Number(id) });
  }
});

// ==========================================
// 3. CADASTRO DE TABELAS CRUD
// ==========================================

// GET /api/tabelas
app.get('/api/tabelas', async (req, res) => {
  const { q } = req.query;
  try {
    let query = 'SELECT * FROM nexus_tabelas WHERE 1=1';
    const params: any[] = [];

    if (q && typeof q === 'string' && q.trim()) {
      params.push(`%${q.trim()}%`);
      query += ` AND (alias ILIKE $${params.length} OR nome ILIKE $${params.length})`;
    }

    query += ' ORDER BY id DESC';

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err: any) {
    console.warn('Fallback to memory for tabelas:', err.message);
    let items = [...memoryFallback.tabelas];
    if (q && typeof q === 'string') {
      const lower = q.toLowerCase();
      items = items.filter(
        (i) => i.alias.toLowerCase().includes(lower) || i.nome.toLowerCase().includes(lower)
      );
    }
    return res.json(items);
  }
});

// POST /api/tabelas
app.post('/api/tabelas', async (req, res) => {
  const { alias, nome } = req.body;

  if (!alias || !nome) {
    return res.status(400).json({ error: 'Alias e Nome da tabela são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO nexus_tabelas (alias, nome, updated_at) 
       VALUES ($1, $2, NOW()) RETURNING *`,
      [alias.trim().toUpperCase(), nome.trim()]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating tabela:', err);
    const newItem = {
      id: Date.now(),
      alias: alias.trim().toUpperCase(),
      nome: nome.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryFallback.tabelas.unshift(newItem);
    return res.status(201).json(newItem);
  }
});

// PUT /api/tabelas/:id
app.put('/api/tabelas/:id', async (req, res) => {
  const { id } = req.params;
  const { alias, nome } = req.body;

  if (!alias || !nome) {
    return res.status(400).json({ error: 'Alias e Nome são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `UPDATE nexus_tabelas 
       SET alias = $1, nome = $2, updated_at = NOW() 
       WHERE id = $3 RETURNING *`,
      [alias.trim().toUpperCase(), nome.trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tabela não encontrada.' });
    }
    return res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error updating tabela:', err);
    const index = memoryFallback.tabelas.findIndex((t) => t.id === Number(id));
    if (index !== -1) {
      memoryFallback.tabelas[index] = {
        ...memoryFallback.tabelas[index],
        alias: alias.trim().toUpperCase(),
        nome: nome.trim(),
        updated_at: new Date().toISOString(),
      };
      return res.json(memoryFallback.tabelas[index]);
    }
    return res.status(500).json({ error: 'Erro ao atualizar tabela.' });
  }
});

// DELETE /api/tabelas/:id
app.delete('/api/tabelas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM nexus_tabelas WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tabela não encontrada.' });
    }
    return res.json({ success: true, id: Number(id) });
  } catch (err: any) {
    console.error('Error deleting tabela:', err);
    memoryFallback.tabelas = memoryFallback.tabelas.filter((t) => t.id !== Number(id));
    return res.json({ success: true, id: Number(id) });
  }
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus DevHub server listening on port ${PORT}`);
  });
}

startServer();
