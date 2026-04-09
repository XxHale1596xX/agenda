import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Usuario
from app.schemas import UsuarioCreate, UsuarioOut, UsuarioOutMasked, UsuarioUpdate

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/", response_model=list[UsuarioOutMasked])
def listar_usuarios(
    busca: Optional[str] = None,
    ativo: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """Listagem pública — CPF e e-mail retornam mascarados."""
    q = db.query(Usuario)
    if busca:
        termo = f"%{busca}%"
        q = q.filter(Usuario.nome.ilike(termo) | Usuario.cpf.ilike(termo))
    if ativo is not None:
        q = q.filter(Usuario.ativo == ativo)
    return [UsuarioOutMasked.from_orm_masked(u) for u in q.order_by(Usuario.nome).all()]


@router.post("/", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def criar_usuario(payload: UsuarioCreate, db: Session = Depends(get_db)):
    usuario = Usuario(**payload.model_dump())
    db.add(usuario)
    try:
        db.commit()
        db.refresh(usuario)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="CPF já cadastrado.")
    return usuario


@router.get("/{usuario_id}", response_model=UsuarioOut)
def buscar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """Detalhe completo — use para pré-preencher formulário de edição."""
    u = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
    return u


@router.get("/cpf/{cpf}", response_model=UsuarioOut)
def buscar_por_cpf(cpf: str, db: Session = Depends(get_db)):
    digits = re.sub(r"\D", "", cpf)
    u = db.query(Usuario).filter(Usuario.cpf == digits).first()
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
    return u


@router.put("/{usuario_id}", response_model=UsuarioOut)
def atualizar_usuario(usuario_id: int, payload: UsuarioUpdate, db: Session = Depends(get_db)):
    u = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(u, field, value)
    db.commit()
    db.refresh(u)
    return u


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_usuario(usuario_id: int, db: Session = Depends(get_db)):
    u = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not u:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
    db.delete(u)
    db.commit()
