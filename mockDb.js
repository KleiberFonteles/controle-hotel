const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// Inicializa o arquivo do banco se não existir
function initDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ usuarios: [], reservas: [] }, null, 2), 'utf-8');
  } else {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      let modified = false;
      if (!data.usuarios) {
        data.usuarios = [];
        modified = true;
      }
      if (!data.reservas) {
        data.reservas = [];
        modified = true;
      }
      if (modified) {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      }
    } catch (e) {
      fs.writeFileSync(DB_PATH, JSON.stringify({ usuarios: [], reservas: [] }, null, 2), 'utf-8');
    }
  }
}

// Lê os dados do arquivo
function readDb() {
  initDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

// Salva os dados no arquivo
function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Processador de consultas SQL mockadas
function processQuery(sql, params, callback) {
  // Normaliza o SQL para facilitar a identificação
  const cleanSql = sql.replace(/\s+/g, ' ').trim().toLowerCase();

  try {
    const data = readDb();

    // 1. CREATE TABLE
    if (cleanSql.startsWith('create table')) {
      // Tabelas já garantidas por initDb()
      if (callback) callback(null, { message: "Tabela verificada/criada" });
      return;
    }

    // 2. INSERT INTO usuarios (nome, email, senha)
    if (cleanSql.includes('insert into usuarios')) {
      const [nome, email, senha] = params;
      const id = data.usuarios.reduce((max, u) => Math.max(max, u.id || 0), 0) + 1;
      const novoUsuario = { id, nome, email, senha };
      data.usuarios.push(novoUsuario);
      writeDb(data);
      if (callback) callback(null, { insertId: id });
      return;
    }

    // 3. SELECT * FROM usuarios WHERE email = ?
    if (cleanSql.includes('select * from usuarios where email = ?') || cleanSql.includes('select * from usuarios where email=?')) {
      const emailBusca = params[0].trim().toLowerCase();
      const resultados = data.usuarios.filter(u => u.email && u.email.trim().toLowerCase() === emailBusca);
      if (callback) callback(null, resultados);
      return;
    }

    // 4. SELECT * FROM usuarios
    if (cleanSql.includes('select * from usuarios')) {
      if (callback) callback(null, data.usuarios);
      return;
    }

    // 5. DELETE FROM usuarios WHERE id = ?
    if (cleanSql.includes('delete from usuarios where id = ?') || cleanSql.includes('delete from usuarios where id=?')) {
      const idDeletar = Number(params[0]);
      const totalAntes = data.usuarios.length;
      data.usuarios = data.usuarios.filter(u => Number(u.id) !== idDeletar);
      writeDb(data);
      if (callback) callback(null, { affectedRows: totalAntes - data.usuarios.length });
      return;
    }

    // 6. INSERT INTO reservas (cliente, hotel, entrada, saida, valor, status)
    if (cleanSql.includes('insert into reservas')) {
      const [cliente, hotel, entrada, saida, valor, status] = params;
      const id = data.reservas.reduce((max, r) => Math.max(max, r.id || 0), 0) + 1;
      const novaReserva = {
        id,
        cliente,
        hotel,
        entrada,
        saida,
        valor: Number(valor),
        status
      };
      data.reservas.push(novaReserva);
      writeDb(data);
      if (callback) callback(null, { insertId: id });
      return;
    }

    // Fallback para queries não catalogadas
    console.warn(`[MockDB Warning] Query não tratada no Mock: "${sql}" com parâmetros:`, params);
    if (callback) callback(new Error(`Query mockada não implementada: ${sql}`));

  } catch (error) {
    console.error("[MockDB Error] Erro ao executar query mockada:", error);
    if (callback) callback(error);
  }
}

// Classe de Pool Mockada que simula o comportamento do mysql2
class MockPool {
  constructor(config) {
    this.config = config;
    initDb();
    console.log("[MockDB] Pool mockado conectado. Banco de dados persistido em db.json");
  }

  // Executa uma query diretamente no pool
  query(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    // Execução assíncrona deferida para simular delay natural do banco de dados
    process.nextTick(() => {
      processQuery(sql, params, callback);
    });
  }

  // Obtém uma conexão (para simular conexao.getConnection)
  getConnection(callback) {
    process.nextTick(() => {
      const conexaoMock = {
        query: (sql, params, cb) => {
          if (typeof params === 'function') {
            cb = params;
            params = [];
          }
          processQuery(sql, params, cb);
        },
        release: () => {
          // No-op: não há conexão real para liberar
        }
      };
      callback(null, conexaoMock);
    });
  }
}

module.exports = {
  createPool: (config) => new MockPool(config)
};
