const express = require('express');
const mysql = require('./mockDb');
const app = express();
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const conexao = mysql.createPool({
  host: 'mainline.proxy.rlwy.net',
  port: 21152,
  user: 'root',
  password: 'GPMVLRjqNdViDWofgOedAEZgBkPSkvBn',
  database: 'railway'
});
conexao.getConnection((erro, connection) => {
  if (erro) {
    console.log("Erro no banco:", erro);
  } else {
    console.log("Banco conectado");
    connection.release();
  }
});
/* TABELA USUÁRIOS */
conexao.query(`
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100),
  senha VARCHAR(100)
)
`);

/* TABELA RESERVAS */

conexao.query(`
CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente VARCHAR(100),
  hotel VARCHAR(100),
  entrada DATE,
  saida DATE,
  valor DECIMAL(10,2),
  status VARCHAR(50)
)
`);

/* CADASTRO */
app.post('/cadastrar', (req, res) => {
  const nome = req.body.nome.trim();
  const email = req.body.email.trim().toLowerCase();
  const senha = req.body.senha.trim();

  const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";

  conexao.query(sql, [nome, email, senha], (erro) => {
    if (erro) {
      console.log(erro);
      res.send("Erro ao cadastrar");
    } else {
      res.send("Usuário cadastrado com sucesso!");
    }
  });
});

/* LOGIN */
app.post('/login', (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const senha = req.body.senha.trim();

  // Permite login com admin padrão
  if (email === 'admin' && senha === '123') {
    return res.json({ success: true, redirect: '/crud.html' });
  }

  const sql = "SELECT * FROM usuarios WHERE email = ?";

  conexao.query(sql, [email], (erro, resultado) => {
    if (erro) {
      console.log(erro);
      return res.status(500).json({ success: false, message: "Erro no servidor" });
    }

    if (resultado.length > 0) {
      if (resultado[0].senha === senha) {
        res.json({ success: true, redirect: '/crud.html' });
      } else {
        res.json({ success: false, message: "Senha incorreta!" });
      }
    } else {
      res.json({ success: false, message: "Usuário não encontrado!" });
    }
  });
});

/* CADASTRAR RESERVA */
app.post('/reservar', (req, res) => {
  const { cliente, hotel, entrada, saida, valor, status } = req.body;

  const sql = `
    INSERT INTO reservas (cliente, hotel, entrada, saida, valor, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  conexao.query(sql, [cliente, hotel, entrada, saida, valor, status], (erro) => {
    if (erro) {
      console.log(erro);
      res.send("Erro ao salvar reserva");
    } else {
      res.send("Reserva cadastrada com sucesso!");
    }
  });
});

/* LISTAR USUÁRIOS */

app.get('/usuarios', (req, res) => {

  const sql = "SELECT * FROM usuarios";

  conexao.query(sql, (erro, resultado) => {

    if (erro) {
      console.log(erro);
      res.send("Erro ao buscar usuários");
    } else {
      res.render('usuarios', {
        usuarios: resultado
      });
    }

  });

});

/* EXCLUIR USUÁRIO */

app.get('/excluir/:id', (req, res) => {

  const id = req.params.id;

  const sql = "DELETE FROM usuarios WHERE id = ?";

  conexao.query(sql, [id], (erro) => {

    if (erro) {
      console.log(erro);
      res.send("Erro ao excluir");
    } else {
      res.redirect('/usuarios');
    }

  });

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});