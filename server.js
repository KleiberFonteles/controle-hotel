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

/* MIDDLEWARE PARA VERIFICAR SE É ADMINISTRADOR */
function verificarAdmin(req, res, next) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = {};
  cookieHeader.split(';').forEach(c => {
    const parts = c.split('=');
    if (parts.length === 2) {
      cookies[parts[0].trim()] = parts[1].trim();
    }
  });

  if (cookies.isAdmin === 'true') {
    next();
  } else {
    res.status(403).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h2>Acesso Negado 🛑</h2>
        <p>Apenas o administrador do hotel tem permissão para visualizar, editar ou excluir contas.</p>
        <br>
        <a href="/login.html" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ir para o Login</a>
      </div>
    `);
  }
}

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
    res.setHeader('Set-Cookie', 'isAdmin=true; Path=/; HttpOnly');
    return res.json({ success: true, redirect: '/crud.html', isAdmin: true });
  }

  const sql = "SELECT * FROM usuarios WHERE email = ?";

  conexao.query(sql, [email], (erro, resultado) => {
    if (erro) {
      console.log(erro);
      return res.status(500).json({ success: false, message: "Erro no servidor" });
    }

    if (resultado.length > 0) {
      if (resultado[0].senha === senha) {
        res.setHeader('Set-Cookie', 'isAdmin=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
        res.json({ success: true, redirect: '/crud.html', isAdmin: false });
      } else {
        res.json({ success: false, message: "Senha incorreta!" });
      }
    } else {
      res.json({ success: false, message: "Usuário não encontrado!" });
    }
  });
});

/* LOGOUT */
app.get('/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'isAdmin=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
  res.redirect('/login.html');
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

/* LISTAR USUÁRIOS (PROTEGIDO) */
app.get('/usuarios', verificarAdmin, (req, res) => {
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

/* FORMULÁRIO DE EDIÇÃO DE USUÁRIO (PROTEGIDO) */
app.get('/editar-usuario/:id', verificarAdmin, (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM usuarios WHERE id = ?";
  conexao.query(sql, [id], (erro, resultado) => {
    if (erro || resultado.length === 0) {
      res.send("Usuário não encontrado");
    } else {
      res.render('editar-usuario', {
        usuario: resultado[0]
      });
    }
  });
});

/* SALVAR EDIÇÃO DE USUÁRIO (PROTEGIDO) */
app.post('/editar-usuario/:id', verificarAdmin, (req, res) => {
  const id = req.params.id;
  const nome = req.body.nome.trim();
  const email = req.body.email.trim().toLowerCase();
  const senha = req.body.senha.trim();

  const sql = "UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?";
  conexao.query(sql, [nome, email, senha, id], (erro) => {
    if (erro) {
      console.log(erro);
      res.send("Erro ao editar usuário");
    } else {
      res.redirect('/usuarios');
    }
  });
});

/* EXCLUIR USUÁRIO (PROTEGIDO) */
app.get('/excluir/:id', verificarAdmin, (req, res) => {
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