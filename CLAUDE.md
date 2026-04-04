# Agenda API — Contexto para Claude

## O que é esse projeto

API de agendamento de aulas para autoescola. Python + FastAPI + SQLite.
Repositório original: `github.com/XxHale1596xX/agenda`

## Estado atual (2026-04-04)

- Branch de trabalho: `agrlex-infra`
- A `main` original estava incompleta (sem o diretório `app/`)
- Todo o código foi criado do zero na branch `agrlex-infra`

## Estrutura

```
agenda/
├── app/
│   ├── main.py              # FastAPI app, health, criação automática do DB
│   ├── database.py          # SQLAlchemy engine + sessão (usa DATABASE_URL env)
│   ├── models.py            # Tabela agendamentos (constraint única instrutor+data+hora)
│   ├── schemas.py           # Pydantic schemas
│   └── routers/
│       └── agendamentos.py  # CRUD completo (POST, GET, PUT, DELETE)
├── .github/workflows/
│   └── deploy.yml           # Build + push para ghcr.io no push em main
├── Dockerfile               # python:3.12-slim
├── docker-compose.yml       # Dev local com hot-reload + volume persistente
└── requirements.txt         # fastapi, uvicorn, sqlalchemy, pydantic
```

## Como rodar local

```bash
docker compose up --build
# http://localhost:8000
# http://localhost:8000/docs
```

Ou sem Docker:
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## CI/CD

- **Registry:** GitHub Container Registry (`ghcr.io`) — sem secrets externos
- **Trigger:** push em `main` com mudanças em `app/`, `Dockerfile` ou `requirements.txt`
- **Imagem:** `ghcr.io/xxhale1596xx/agenda-api:<sha>-<run>`
- **Token:** usa `GITHUB_TOKEN` automático, nenhum secret precisa ser criado

## Endpoints

| Método | Path | Descrição |
|---|---|---|
| GET | `/` | Status |
| GET | `/health` | Health check |
| POST | `/agendamentos` | Criar agendamento |
| GET | `/agendamentos` | Listar (filtros: `instrutor`, `data_aula`) |
| GET | `/agendamentos/{id}` | Buscar por id |
| PUT | `/agendamentos/{id}` | Atualizar |
| DELETE | `/agendamentos/{id}` | Remover |

## Regra de negócio

Não permite dois agendamentos para o mesmo instrutor na mesma data e horário (HTTP 409).

## Banco de dados

SQLite por padrão. Caminho configurável via `DATABASE_URL`:
```
DATABASE_URL=sqlite:///./data/autoescola.db  # padrão
DATABASE_URL=postgresql://user:pass@host/db  # para produção
```
O schema é criado automaticamente no primeiro start (`create_all`).

## Próximos passos sugeridos

- [ ] Migrar de SQLite para PostgreSQL para produção
- [ ] Adicionar autenticação (JWT)
- [ ] Testes automatizados (pytest + httpx)
- [ ] Abrir PR da branch `agrlex-infra` → `main`
- [ ] Configurar deploy (K8s manifests, se for rodar na infra agrlex)

## Infra agrlex (contexto)

Esse projeto **não roda na infra agrlex** por enquanto — é standalone.
A infra agrlex usa K3s + ArgoCD + Traefik + Azure Container Registry.
Se futuramente for integrar, os manifests K8s seguem o padrão de
`k8s/autoescola/` no repo `legaltech-infra`.
