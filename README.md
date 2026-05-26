# 📘 Documentação do Sistema — Controle de Hotel

> Guia simplificado para fácil entendimento do sistema. Aqui você vai entender **o que é cada arquivo**, **para que serve** e **como o sistema funciona como um todo**, mesmo que não seja programador.

---

## 🧠 Entendendo a Ideia Geral

Imagine um hotel que precisa de um sistema digital para:
- 🔐 **Controlar quem pode acessar o sistema** (login e cadastro)
- 🛏️ **Gerenciar seus quartos** (listar, adicionar, editar, remover)
- 📋 **Gerenciar as reservas dos hóspedes** (listar, adicionar, editar, remover)
- 👤 **Gerenciar as contas dos usuários** (exclusivo para o Administrador)

É exatamente isso que este sistema faz!

---

## 🗂️ Estrutura de Pastas e Arquivos

```
controle-hotel/
│
├── 📄 index.html          → Página inicial do sistema
├── 📄 login.html          → Tela de login
├── 📄 cadastro.html       → Tela de cadastro de novos usuários
├── 📄 crud.html           → Painel de gerenciamento de RESERVAS
├── 📄 quartos.html        → Painel de gerenciamento de QUARTOS
├── 📄 reservas.html       → Formulário antigo de reserva (via servidor)
│
├── 🎨 style.css           → Arquivo de estilo visual (cores, fontes, layout)
│
├── ⚙️  server.js          → O "cérebro" do sistema (servidor backend)
├── 🗄️  mockDb.js          → Banco de dados local simulado
├── 📦 db.json             → Arquivo onde os dados ficam salvos
│
├── 📦 package.json        → Lista de dependências do projeto (Node.js)
│
└── 📁 views/              → Telas geradas pelo servidor
    ├── 📄 usuarios.ejs        → Lista de usuários (só para admin)
    └── 📄 editar-usuario.ejs  → Formulário para editar um usuário
```

---

## 📄 Explicação de Cada Arquivo

### 🏠 `index.html` — Página Inicial
É a **primeira tela** que o usuário vê ao abrir o sistema.  
Ela tem dois botões:
- **Login** → leva para a tela de entrar no sistema
- **Cadastrar** → leva para a tela de criar uma nova conta

---

### 🔐 `login.html` — Tela de Login
Aqui o usuário digita seu **usuário/e-mail e senha** para entrar no sistema.

**Conta especial de Administrador:**
| Campo | Valor |
|---|---|
| Usuário | `admin` |
| Senha | `123` |

- Se a conta for a do **admin**, o sistema libera o menu de gerenciamento de usuários.
- Se for um **usuário comum**, ele entra apenas no painel de reservas.
- Abaixo do botão "Entrar", existe um link **"Cadastre-se"** para quem ainda não tem conta.

---

### 📝 `cadastro.html` — Tela de Cadastro
Formulário para criar uma **nova conta** no sistema.  
O usuário preenche: **Nome, E-mail e Senha**.  
Ao clicar em "Cadastrar", aparece uma mensagem de confirmação **sem sair da página**, e o formulário é limpo automaticamente para um novo cadastro se precisar.

---

### 📋 `crud.html` — Painel de Reservas
É o **painel principal** para gerenciar as reservas do hotel.  
- Mostra uma **tabela** com todas as reservas cadastradas.
- Tem um botão para **adicionar nova reserva** (abre um formulário em uma janela popup).
- Cada reserva pode ser **editada** ou **excluída**.
- Se o usuário logado for o **Administrador**, aparece automaticamente o menu **"Usuários"** no topo.
- Os dados ficam salvos **no navegador** (chamado de `localStorage`).

---

### 🛏️ `quartos.html` — Painel de Quartos
Funciona igual ao painel de Reservas, mas para gerenciar os **quartos do hotel**.
- Mostra uma tabela com os quartos.
- Permite **adicionar, editar e excluir** quartos.
- Os dados ficam salvos **no navegador** (localStorage).

---

### 🎨 `style.css` — Estilo Visual
Define a **aparência visual** de algumas páginas do sistema (cores, tamanhos, fontes). É como o "figurino" das telas. As telas do painel usam estilos próprios dentro delas mesmas.

---

### ⚙️ `server.js` — O Servidor (Cérebro do Sistema)
Este é o arquivo mais importante do projeto. Ele é o **servidor** — fica em execução no computador e responde a todas as ações do usuário nas telas.

Pense nele como um **funcionário de balcão** que recebe os pedidos e vai até o banco de dados buscar ou salvar as informações.

Ele é responsável por:

| Ação | O que faz |
|---|---|
| `POST /cadastrar` | Recebe os dados do formulário e salva um novo usuário no banco |
| `POST /login` | Verifica se o e-mail e senha estão corretos e libera o acesso |
| `GET /logout` | Encerra a sessão de admin com segurança |
| `POST /reservar` | Salva uma nova reserva no banco de dados |
| `GET /usuarios` | Mostra a lista de todos os usuários (só para admin) |
| `GET /editar-usuario/:id` | Abre o formulário de edição de um usuário específico |
| `POST /editar-usuario/:id` | Salva as alterações feitas em um usuário |
| `GET /excluir/:id` | Remove um usuário do banco de dados |

> 🔒 **Segurança:** As rotas de usuários (listar, editar, excluir) são **protegidas**. Se alguém tentar acessar sem ser admin, recebe uma tela de "Acesso Negado".

---

### 🗄️ `mockDb.js` — Banco de Dados Local Simulado
Como o sistema não tem acesso ao banco de dados real (que fica na internet), criamos um **banco de dados falso** que funciona igual ao original.

Pense nele como um **caderno que imita o comportamento de um cofre de dados profissional**.

Ele:
- Entende comandos de banco de dados (salvar, buscar, deletar, atualizar)
- Salva tudo automaticamente no arquivo `db.json`
- Mantém os dados mesmo quando o servidor é reiniciado

---

### 📦 `db.json` — O Arquivo com os Dados
Este é o arquivo que guarda **todos os dados do sistema** em formato de texto organizado.

Exemplo do que ele contém:
```json
{
  "usuarios": [
    { "id": 1, "nome": "João", "email": "joao@email.com", "senha": "123" }
  ],
  "reservas": [
    { "id": 1, "cliente": "Maria", "hotel": "Grand Palace", "entrada": "2026-06-01", "saida": "2026-06-05", "valor": 800, "status": "Confirmada" }
  ]
}
```

> ⚠️ **Atenção:** Este arquivo não deve ser editado manualmente. O sistema cuida dele automaticamente.

---

### 📁 `views/` — Telas Geradas pelo Servidor

#### `usuarios.ejs` — Lista de Usuários
Tela que exibe a **tabela completa de usuários** cadastrados. Só é acessível pelo Administrador. Permite **editar** ou **excluir** cada usuário com um clique.

#### `editar-usuario.ejs` — Editar Usuário
Formulário que aparece quando o Admin clica em "Editar" em algum usuário. Vem com os dados já preenchidos automaticamente, basta alterar o que deseja e clicar em "Salvar".

---

## 🔄 Fluxo Completo do Sistema

```
Usuário abre o sistema
        ↓
  [ index.html ]
  "Tela inicial com 2 botões"
        ↓
  ┌─────────────────────┐
  │                     │
[Login]            [Cadastrar]
  │                     │
  ↓                     ↓
[login.html]      [cadastro.html]
  │               "Cria conta nova,
  │                alerta de sucesso,
  │                fica na mesma página"
  ↓
Servidor verifica e-mail/senha
  │
  ├── É admin? (admin/123)
  │     ↓
  │   [crud.html] com menu "Usuários" visível
  │        ↓
  │   [/usuarios] → Lista de usuários
  │        ├── Editar → [/editar-usuario/:id]
  │        └── Excluir → [/excluir/:id]
  │
  └── É usuário comum?
        ↓
      [crud.html] sem menu "Usuários"
           ↓
      Gerencia Reservas e Quartos
```

---

## 🚀 Como Iniciar o Sistema

1. Abra o terminal na pasta `controle-hotel`
2. Execute o comando:
   ```
   node server.js
   ```
3. Abra o navegador e acesse:
   ```
   http://localhost:3000
   ```

---

## 🌐 Como Hospedar na Internet (Render)

1. Suba o projeto para o **GitHub**
2. Crie uma conta no [render.com](https://render.com)
3. Crie um **Web Service** e conecte ao seu repositório do GitHub
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Clique em Deploy! ✅

> ⚠️ No plano gratuito do Render, os dados do `db.json` podem ser apagados quando o servidor reinicia. O login `admin/123` **sempre funcionará**, pois está no código do servidor.

---

## 🔑 Credenciais de Acesso

| Tipo | Usuário | Senha | Pode acessar |
|---|---|---|---|
| Administrador | `admin` | `123` | Tudo, incluindo gerenciar usuários |
| Usuário comum | E-mail cadastrado | Senha cadastrada | Reservas e Quartos |
