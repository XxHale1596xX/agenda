import os
import logging
import logging.config
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.database import engine
from app import models
from app.routers import agendamentos, bloqueios, disponibilidade, usuarios, instrutores, veiculos, auth, auth_instrutor

# ── Logging ───────────────────────────────────────────────────────────────────
_LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

logging.config.dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {"format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "default"},
    },
    "loggers": {
        # Audit log separado — nunca loga PII
        "audit": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
    "root": {"handlers": ["console"], "level": _LOG_LEVEL},
})

logger = logging.getLogger(__name__)
audit = logging.getLogger("audit")

# ── CORS ──────────────────────────────────────────────────────────────────────
_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw.split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=engine)
    logger.info("Banco de dados inicializado.")
    yield


app = FastAPI(
    title="Agenda — Autoescola",
    description="API de agendamento de aulas para autoescola.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-Admin-Token"],
)

# ── Security headers ──────────────────────────────────────────────────────────
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "0"
    return response

# ── Audit log de requisições ──────────────────────────────────────────────────
@app.middleware("http")
async def audit_log(request: Request, call_next):
    response: Response = await call_next(request)
    # Loga método, path e status — sem body, sem query params que possam conter PII
    audit.info("method=%s path=%s status=%s", request.method, request.url.path, response.status_code)
    return response

# ── Error handlers — sem expor stack traces ───────────────────────────────────
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Erros de validação Pydantic: retorna mensagens mas não o valor enviado
    errors = [{"campo": e["loc"][-1], "mensagem": e["msg"]} for e in exc.errors()]
    return JSONResponse(status_code=422, content={"detail": errors})

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Nunca expõe stack trace — loga internamente e retorna mensagem genérica
    logger.exception("Erro interno não tratado: %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Erro interno do servidor."})

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

@app.get("/", tags=["health"])
def root():
    return {"message": "Agenda API", "docs": "/docs"}

app.include_router(agendamentos.router)
app.include_router(bloqueios.router)
app.include_router(disponibilidade.router)
app.include_router(usuarios.router)
app.include_router(instrutores.router)
app.include_router(veiculos.router)
app.include_router(auth.router)
app.include_router(auth_instrutor.router)
