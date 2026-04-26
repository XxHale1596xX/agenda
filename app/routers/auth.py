import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from jose import JWTError
from pydantic import BaseModel, field_validator

from app.database import get_db
from app.models import Usuario, Agendamento
from app.schemas import UsuarioOut, AgendamentoOut, UsuarioUpdate, _validar_cpf
from app.core.security import hash_password, verify_password, create_student_token, decode_student_token

logger = logging.getLogger("audit")
router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer()


# ── Schemas internos do auth ──────────────────────────────────────────────────

class LoginRequest(BaseModel):
    cpf: str
    senha: str

    @field_validator("cpf")
    @classmethod
    def normalizar_cpf(cls, v: str) -> str:
        return _validar_cpf(v)


class RegistroRequest(BaseModel):
    nome: str
    cpf: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    senha: str

    @field_validator("cpf")
    @classmethod
    def normalizar_cpf(cls, v: str) -> str:
        return _validar_cpf(v)

    @field_validator("senha")
    @classmethod
    def validar_senha(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("A senha deve ter no mínimo 6 caracteres.")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut


class MeUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    senha_atual: Optional[str] = None
    nova_senha: Optional[str] = None


# ── Dependency ────────────────────────────────────────────────────────────────

def get_current_student(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> Usuario:
    try:
        user_id = decode_student_token(credentials.credentials)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido ou expirado.")
    user = db.query(Usuario).filter(Usuario.id == user_id, Usuario.ativo == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado ou desativado.")
    return user


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.cpf == payload.cpf).first()
    if not user or not user.senha_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="CPF ou senha incorretos.")
    if not verify_password(payload.senha, user.senha_hash):
        logger.warning("AUDIT login falhou — cpf=%s", payload.cpf[:3] + "***")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="CPF ou senha incorretos.")
    if not user.ativo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Conta desativada. Fale com a autoescola.")
    logger.info("AUDIT login aluno id=%s", user.id)
    return {"access_token": create_student_token(user.id), "usuario": user}


@router.post("/registro", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def registro(payload: RegistroRequest, db: Session = Depends(get_db)):
    existing = db.query(Usuario).filter(Usuario.cpf == payload.cpf).first()

    if existing:
        # CPF já cadastrado pelo admin — aluno está ativando a conta
        if existing.senha_hash:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="CPF já possui conta ativa. Faça login.",
            )
        existing.senha_hash = hash_password(payload.senha)
        if payload.email:
            existing.email = payload.email
        if payload.telefone:
            existing.telefone = payload.telefone
        db.commit()
        db.refresh(existing)
        logger.info("AUDIT aluno ativou conta id=%s", existing.id)
        return {"access_token": create_student_token(existing.id), "usuario": existing}

    # CPF novo — cria conta direto
    user = Usuario(
        nome=payload.nome,
        cpf=payload.cpf,
        email=payload.email,
        telefone=payload.telefone,
        senha_hash=hash_password(payload.senha),
        ativo=True,
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="CPF já cadastrado.")
    logger.info("AUDIT novo aluno registrado id=%s", user.id)
    return {"access_token": create_student_token(user.id), "usuario": user}


@router.get("/me", response_model=UsuarioOut)
def me(current: Usuario = Depends(get_current_student)):
    return current


@router.put("/me", response_model=UsuarioOut)
def update_me(
    payload: MeUpdate,
    current: Usuario = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    if payload.nome:
        current.nome = payload.nome
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


@router.get("/me/agendamentos", response_model=list[AgendamentoOut])
def meus_agendamentos(
    current: Usuario = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    return (
        db.query(Agendamento)
        .filter(Agendamento.aluno.ilike(f"%{current.nome}%"))
        .order_by(Agendamento.data_aula.desc(), Agendamento.hora_aula.desc())
        .all()
    )
