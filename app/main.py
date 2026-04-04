import os
from fastapi import FastAPI
from app.database import engine
from app import models
from app.routers import agendamentos

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Agenda — Autoescola",
    description="API de agendamento de aulas para autoescola.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


@app.get("/", tags=["health"])
def root():
    return {"message": "Agenda API", "docs": "/docs"}


app.include_router(agendamentos.router)
