import logging
from datetime import date as Date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from jose import JWTError
from pydantic import BaseModel, field_validator

from app.database import get_db
from app.models import Instrutor, Agendamento, DisponibilidadeInstrutor
from app.schemas import (
    InstrutorOut, AgendamentoOut,
    DisponibilidadeInstrutorCreate, DisponibilidadeInstrutorOut, DisponibilidadeBatchCreate,
    _validar_cpf,
)
from app.core.security import hash_password, verify_password, create_instructor_token, decode_instructor_token

logger = logging.getLogger("audit")
router = APIRouter(prefix="/instrutor", tags=["instrutor-portal"])
bearer = HTTPBearer()


# ── Schemas internos ──────────────────────────────────────────────────────────

class InstructorLoginRequest(BaseModel):
    cpf: str
    senha: str

    @field_validator("cpf")
    @classmethod
    def normalizar(cls, v: str) -> str:
        return _validar_cpf(v)


class InstructorRegistroRequest(BaseModel):
    cpf: str
    senha: str

    @field_validator("cpf")
    @classmethod
    def normalizar(cls, v: str) -> str:
        return _validar_cpf(v)

    @field_validator("senha")
    @classmethod
    def validar_senha(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Senha deve ter no mínimo 6 caracteres.")
        return v


class InstructorTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    instrutor: InstrutorOut


class InstructorMeUpdate(BaseModel):
    email: Optional[str] = None
    telefone: Optional[str] = None
    senha_atual: Optional[str] = None
    nova_senha: Optional[str] = None


# ── Dependency ────────────────────────────────────────────────────────────────

def get_current_instructor(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> Instrutor:
    try:
        inst_id = decode_instructor_token(credentials.credentials)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido ou expirado.")
    inst = db.query(Instrutor).filter(Instrutor.id == inst_id, Instrutor.ativo == True).first()
    if not inst:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Instrutor não encontrado ou desativado.")
    return inst


# ── Auth ──────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=InstructorTokenResponse)
def login(payload: InstructorLoginRequest, db: Session = Depends(get_db)):
    inst = db.query(Instrutor).filter(Instrutor.cpf == payload.cpf).first()
    if not inst or not inst.senha_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="CPF ou senha incorretos.")
    if not verify_password(payload.senha, inst.senha_hash):
        logger.warning("AUDIT instrutor login falhou cpf=%s", payload.cpf[:3] + "***")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="CPF ou senha incorretos.")
    if not inst.ativo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Conta desativada.")
    logger.info("AUDIT instrutor login id=%s", inst.id)
    return {"access_token": create_instructor_token(inst.id), "instrutor": inst}


@router.post("/registro", response_model=InstructorTokenResponse, status_code=status.HTTP_201_CREATED)
def registro(payload: InstructorRegistroRequest, db: Session = Depends(get_db)):
    inst = db.query(Instrutor).filter(Instrutor.cpf == payload.cpf).first()
    if not inst:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CPF não encontrado. Solicite ao administrador que cadastre você primeiro.",
        )
    if inst.senha_hash:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Conta já ativa. Faça login.")
    if not inst.ativo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Conta desativada.")
    inst.senha_hash = hash_password(payload.senha)
    db.commit()
    db.refresh(inst)
    logger.info("AUDIT instrutor ativou conta id=%s", inst.id)
    return {"access_token": create_instructor_token(inst.id), "instrutor": inst}


# ── Perfil ────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=InstrutorOut)
def me(current: Instrutor = Depends(get_current_instructor)):
    return current


@router.put("/me", response_model=InstrutorOut)
def update_me(
    payload: InstructorMeUpdate,
    current: Instrutor = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    if payload.email is not None:
        current.email = payload.email or None
    if payload.telefone is not None:
        current.telefone = payload.telefone or None
    if payload.nova_senha:
        if not payload.senha_atual or not verify_password(payload.senha_atual, current.senha_hash or ""):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Senha atual incorreta.")
        if len(payload.nova_senha) < 6:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nova senha deve ter no mínimo 6 caracteres.")
        current.senha_hash = hash_password(payload.nova_senha)
    db.commit()
    db.refresh(current)
    return current


# ── Agenda (aulas) ────────────────────────────────────────────────────────────

@router.get("/me/agenda", response_model=list[AgendamentoOut])
def minha_agenda(
    current: Instrutor = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    return (
        db.query(Agendamento)
        .filter(Agendamento.instrutor.ilike(f"%{current.nome}%"))
        .order_by(Agendamento.data_aula, Agendamento.hora_aula)
        .all()
    )


# ── Disponibilidade ───────────────────────────────────────────────────────────

@router.get("/me/disponibilidade", response_model=list[DisponibilidadeInstrutorOut])
def minha_disponibilidade(
    data_inicio: Optional[Date] = None,
    data_fim: Optional[Date] = None,
    current: Instrutor = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    q = db.query(DisponibilidadeInstrutor).filter(DisponibilidadeInstrutor.instrutor_id == current.id)
    if data_inicio:
        q = q.filter(DisponibilidadeInstrutor.data >= data_inicio)
    if data_fim:
        q = q.filter(DisponibilidadeInstrutor.data <= data_fim)
    return q.order_by(DisponibilidadeInstrutor.data, DisponibilidadeInstrutor.hora).all()


@router.post("/me/disponibilidade/batch", response_model=list[DisponibilidadeInstrutorOut],
             status_code=status.HTTP_201_CREATED)
def marcar_disponibilidade_batch(
    payload: DisponibilidadeBatchCreate,
    current: Instrutor = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    criados = []
    for slot in payload.slots:
        existing = db.query(DisponibilidadeInstrutor).filter(
            DisponibilidadeInstrutor.instrutor_id == current.id,
            DisponibilidadeInstrutor.data == slot.data,
            DisponibilidadeInstrutor.hora == slot.hora,
        ).first()
        if existing:
            continue
        d = DisponibilidadeInstrutor(instrutor_id=current.id, data=slot.data, hora=slot.hora)
        db.add(d)
        criados.append(d)
    db.commit()
    for d in criados:
        db.refresh(d)
    return criados


@router.post("/me/disponibilidade", response_model=DisponibilidadeInstrutorOut,
             status_code=status.HTTP_201_CREATED)
def marcar_slot(
    payload: DisponibilidadeInstrutorCreate,
    current: Instrutor = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    existing = db.query(DisponibilidadeInstrutor).filter(
        DisponibilidadeInstrutor.instrutor_id == current.id,
        DisponibilidadeInstrutor.data == payload.data,
        DisponibilidadeInstrutor.hora == payload.hora,
    ).first()
    if existing:
        return existing
    d = DisponibilidadeInstrutor(instrutor_id=current.id, data=payload.data, hora=payload.hora)
    db.add(d)
    try:
        db.commit()
        db.refresh(d)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slot já marcado.")
    return d


@router.delete("/me/disponibilidade/{disp_id}", status_code=status.HTTP_204_NO_CONTENT)
def desmarcar_slot(
    disp_id: int,
    current: Instrutor = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    d = db.query(DisponibilidadeInstrutor).filter(
        DisponibilidadeInstrutor.id == disp_id,
        DisponibilidadeInstrutor.instrutor_id == current.id,
    ).first()
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot não encontrado.")
    db.delete(d)
    db.commit()
