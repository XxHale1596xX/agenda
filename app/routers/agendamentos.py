from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Agendamento
from app.schemas import AgendamentoCreate, AgendamentoOut, AgendamentoUpdate

router = APIRouter(prefix="/agendamentos", tags=["agendamentos"])


@router.post("/", response_model=AgendamentoOut, status_code=status.HTTP_201_CREATED)
def criar_agendamento(payload: AgendamentoCreate, db: Session = Depends(get_db)):
    agendamento = Agendamento(**payload.model_dump())
    db.add(agendamento)
    try:
        db.commit()
        db.refresh(agendamento)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Instrutor já possui agendamento nessa data e horário.",
        )
    return agendamento


@router.get("/", response_model=list[AgendamentoOut])
def listar_agendamentos(
    instrutor: Optional[str] = None,
    data_aula: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Agendamento)
    if instrutor:
        query = query.filter(Agendamento.instrutor == instrutor)
    if data_aula:
        query = query.filter(Agendamento.data_aula == data_aula)
    return query.order_by(Agendamento.data_aula, Agendamento.hora_aula).all()


@router.get("/{agendamento_id}", response_model=AgendamentoOut)
def buscar_agendamento(agendamento_id: int, db: Session = Depends(get_db)):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    if not agendamento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agendamento não encontrado.")
    return agendamento


@router.put("/{agendamento_id}", response_model=AgendamentoOut)
def atualizar_agendamento(
    agendamento_id: int, payload: AgendamentoUpdate, db: Session = Depends(get_db)
):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    if not agendamento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agendamento não encontrado.")
    for field, value in payload.model_dump().items():
        setattr(agendamento, field, value)
    try:
        db.commit()
        db.refresh(agendamento)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Instrutor já possui agendamento nessa data e horário.",
        )
    return agendamento


@router.delete("/{agendamento_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_agendamento(agendamento_id: int, db: Session = Depends(get_db)):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    if not agendamento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agendamento não encontrado.")
    db.delete(agendamento)
    db.commit()
