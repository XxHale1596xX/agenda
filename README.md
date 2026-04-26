# AutoEscola dos Brothers — Sistema de Gestão

SaaS completo para autoescola com painel administrativo, portal do instrutor e portal do aluno.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | FastAPI + SQLAlchemy + MySQL 8 |
| Auth | JWT (alunos/instrutores) + Admin Token bcrypt |
| Frontend | React 18 + TypeScript + Tailwind CSS + TanStack Query |
| Calendário | React Big Calendar |
| Deploy | Docker Compose |

## Perfis de acesso

| Perfil | URL | Autenticação |
|--------|-----|-------------|
| Público | `/` | — |
| Aluno | `/portal` | CPF + senha (JWT) |
| Instrutor | `/portal-instrutor` | CPF + senha (JWT) |
| Admin | `/admin` | `ADMIN_TOKEN` (env) |

## Rodar localmente

### Com Docker (recomendado)

```bash
cp .env.example .env
# Edite .env com suas configurações
docker compose up --build -d
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |
| Docs Swagger | http://localhost:8000/docs |

### Sem Docker

```bash
# Backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (outro terminal)
cd frontend
npm install
npm run dev
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL do MySQL (`mysql+pymysql://user:pass@host/db`) |
| `ADMIN_TOKEN` | Senha do admin em texto puro (dev) |
| `ADMIN_TOKEN_HASH` | Hash bcrypt da senha (produção — tem precedência) |
| `JWT_SECRET` | Chave secreta JWT — gere com `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| `ALLOWED_ORIGINS` | Origins CORS separados por vírgula |
| `LOG_LEVEL` | Nível de log (`INFO`, `DEBUG`, etc.) |

> **Produção:** use `ADMIN_TOKEN_HASH` em vez de `ADMIN_TOKEN`.  
> Gere com: `python3 -c "from passlib.context import CryptContext; print(CryptContext(['bcrypt']).hash('sua-senha'))"`

## Módulos implementados

- [x] Agendamentos (CRUD completo)
- [x] Alunos com CPF validado (CRUD + portal próprio)
- [x] Instrutores por categorias A–E (CRUD + portal + disponibilidade)
- [x] Veículos com KM e categoria (CRUD)
- [x] Bloqueios de disponibilidade (dia inteiro ou slot específico)
- [x] Calendário interativo semanal (React Big Calendar)
- [x] Dashboard com KPIs em tempo real
- [x] Landing page pública
- [ ] Financeiro / pagamentos
- [ ] Módulo pedagógico (videoaulas, simulados)
- [ ] Comunicação (e-mail, WhatsApp)
- [ ] Relatórios e exportação

## API — Endpoints principais

### Públicos
| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |
| GET | `/agendamentos/` | Listar agendamentos |
| GET | `/disponibilidade/{data}` | Slots disponíveis por dia |
| GET | `/instrutores/` | Listar instrutores |
| GET | `/veiculos/` | Listar veículos |

### Aluno (JWT Bearer)
| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/auth/registro` | Criar conta / ativar conta existente |
| POST | `/auth/login` | Login → retorna JWT |
| GET | `/auth/me` | Meu perfil |
| PUT | `/auth/me` | Atualizar perfil / trocar senha |
| GET | `/auth/me/agendamentos` | Minhas aulas |

### Instrutor (JWT Bearer)
| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/instrutor/registro` | Ativar conta (CPF cadastrado pelo admin) |
| POST | `/instrutor/login` | Login → retorna JWT |
| GET | `/instrutor/me` | Meu perfil |
| PUT | `/instrutor/me` | Atualizar perfil / trocar senha |
| GET | `/instrutor/me/agenda` | Minhas aulas |
| GET | `/instrutor/me/disponibilidade` | Ver minha disponibilidade |
| POST | `/instrutor/me/disponibilidade` | Marcar um slot disponível |
| POST | `/instrutor/me/disponibilidade/batch` | Marcar vários slots de uma vez |
| DELETE | `/instrutor/me/disponibilidade/{id}` | Desmarcar slot |

### Admin (`X-Admin-Token` header)
| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/agendamentos/` | Criar agendamento |
| PUT/DELETE | `/agendamentos/{id}` | Editar / remover |
| POST | `/bloqueios/` | Criar bloqueio |
| DELETE | `/bloqueios/{id}` | Remover bloqueio |
| POST | `/instrutores/` | Cadastrar instrutor |
| POST | `/veiculos/` | Cadastrar veículo |
| GET | `/usuarios/` | Listar alunos (dados mascarados) |
| GET | `/usuarios/{id}` | Detalhes completos do aluno |

## Fluxo de uso

### Onboarding do instrutor
1. Admin cadastra o instrutor em `/admin → Instrutores`
2. Instrutor acessa `/entrar-instrutor` e faz "Primeiro acesso" com seu CPF
3. Define uma senha e acessa o portal
4. Marca disponibilidade na grade semanal em "Minha Agenda"

### Onboarding do aluno
1. Admin cadastra o aluno em `/admin → Alunos` (ou aluno se cadastra em `/cadastro`)
2. Aluno acessa `/entrar` com CPF + senha
3. Visualiza suas aulas agendadas no portal

### Agendamento
1. Admin acessa `/admin → Calendário` ou `/admin → Agendamentos`
2. Clica em um slot disponível no calendário
3. Preenche aluno + instrutor + confirma

## Migrações manuais de banco

O SQLAlchemy cria tabelas novas automaticamente, mas **não adiciona colunas** em tabelas existentes. Ao adicionar campos novos ao modelo, rode:

```sql
-- Exemplos de ALTER já executados neste projeto
ALTER TABLE usuarios    ADD COLUMN senha_hash VARCHAR(128) NULL AFTER ativo;
ALTER TABLE instrutores ADD COLUMN senha_hash VARCHAR(128) NULL AFTER ativo;
-- A tabela disponibilidade_instrutor foi criada automaticamente no primeiro start
```

> Para produção recomenda-se usar **Alembic** para gerenciar migrações.

## Segurança

- Senhas sempre armazenadas como hash bcrypt
- Admin token com `hmac.compare_digest` (dev) ou bcrypt (produção)
- JWT com expiração de 7 dias e claim `type` (student / instructor)
- CORS restrito a origins definidos em `ALLOWED_ORIGINS`
- Security headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`
- Audit log de todas as requisições (sem PII no log)
- CPF e e-mail mascarados na listagem pública de alunos

## Estrutura do projeto

```
agenda/
├── app/
│   ├── core/
│   │   └── security.py        # JWT + bcrypt utils
│   ├── routers/
│   │   ├── agendamentos.py
│   │   ├── auth.py            # Portal aluno
│   │   ├── auth_instrutor.py  # Portal instrutor
│   │   ├── bloqueios.py
│   │   ├── disponibilidade.py
│   │   ├── instrutores.py
│   │   ├── usuarios.py
│   │   └── veiculos.py
│   ├── database.py
│   ├── dependencies.py        # require_admin
│   ├── main.py
│   ├── models.py
│   └── schemas.py
├── frontend/
│   └── src/
│       ├── api/               # Clientes HTTP por recurso
│       ├── components/        # UI reutilizável + páginas admin
│       ├── context/           # StudentAuth + InstructorAuth
│       ├── hooks/             # TanStack Query hooks
│       ├── pages/
│       │   ├── portal/        # Portal do aluno
│       │   └── portal-instrutor/ # Portal do instrutor
│       └── types/             # TypeScript interfaces
├── docker-compose.yml
├── .env.example
└── requirements.txt
```
