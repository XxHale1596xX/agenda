# API de Agendamento - Autoescola

API em Python para agendar aulas com:
- nome do aluno
- nome do instrutor
- data da aula
- horário da aula

Usa **FastAPI** + **SQLite** para persistência dos dados.

## Requisitos
- Python 3.10 a 3.13 (recomendado: 3.12)

## Instalação
```bash
python -m pip install -r requirements.txt
```

No Windows, se o comando `python` nao funcionar, use o launcher `py`:

```powershell
py -m pip install -r requirements.txt
```

Opcional (recomendado): criar ambiente virtual no Windows:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Executar
```bash
uvicorn app.main:app --reload
```

## Executar com Docker
```bash
docker compose up --build
```

Para rodar em segundo plano:
```bash
docker compose up --build -d
```

Para parar os containers:
```bash
docker compose down
```

A API ficará disponível em:
- `http://127.0.0.1:8000`
- Documentação Swagger: `http://127.0.0.1:8000/docs`

## Endpoints
- `GET /` - status da API
- `POST /agendamentos` - criar agendamento
- `GET /agendamentos` - listar agendamentos (filtros opcionais: `instrutor`, `data_aula`)
- `GET /agendamentos/{id}` - buscar por id
- `PUT /agendamentos/{id}` - atualizar
- `DELETE /agendamentos/{id}` - remover

## Testar no Postman
Base URL:
- `http://127.0.0.1:8000`

### 1) Status da API
- Metodo: `GET`
- URL: `http://127.0.0.1:8000/`

### 2) Criar agendamento
- Metodo: `POST`
- URL: `http://127.0.0.1:8000/agendamentos`
- Header: `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "aluno": "Carlos Silva",
  "instrutor": "Joao Mendes",
  "data_aula": "2026-04-05",
  "hora_aula": "14:30:00"
}
```

### 3) Listar agendamentos
- Metodo: `GET`
- URL: `http://127.0.0.1:8000/agendamentos`

### 4) Listar com filtros
- Metodo: `GET`
- URL: `http://127.0.0.1:8000/agendamentos?instrutor=Joao%20Mendes&data_aula=2026-04-05`

### 5) Buscar por id
- Metodo: `GET`
- URL: `http://127.0.0.1:8000/agendamentos/1`

### 6) Atualizar por id
- Metodo: `PUT`
- URL: `http://127.0.0.1:8000/agendamentos/1`
- Header: `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "aluno": "Carlos Silva",
  "instrutor": "Joao Mendes",
  "data_aula": "2026-04-05",
  "hora_aula": "15:00:00"
}
```

### 7) Remover por id
- Metodo: `DELETE`
- URL: `http://127.0.0.1:8000/agendamentos/1`

## Exemplo de criação
`POST /agendamentos`

```json
{
  "aluno": "Carlos Silva",
  "instrutor": "João Mendes",
  "data_aula": "2026-04-05",
  "hora_aula": "14:30:00"
}
```

## Regra de negócio
Não permite dois agendamentos para o mesmo instrutor na mesma data e horário.
