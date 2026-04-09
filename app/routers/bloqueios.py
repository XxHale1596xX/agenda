from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.dependencies import require_admin
from app.models import Bloqueio
from app.schemas import BloqueioCreate, BloqueioOut

router = APIRouter(prefix="/bloqueios", tags=["bloqueios"])


@router.get("/", response_model=list[BloqueioOut])
def listar_bloqueios(data: Optional[date] = None, db: Session = Depends(get_db)):
    q = db.query(Bloqueio)
    if data:
        q = q.filter(Bloqueio.data == data)
    return q.order_by(Bloqueio.data, Bloqueio.hora).all()


@router.post("/", response_model=BloqueioOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def criar_bloqueio(payload: BloqueioCreate, db: Session = Depends(get_db)):
    # Unicidade manual para hora=NULL (MySQL permite múltiplos NULLs em unique index)
    if payload.hora is None:
        existe = db.query(Bloqueio).filter(
            Bloqueio.data == payload.data, Bloqueio.hora.is_(None)
        ).first()
        if existe:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                detail="Dia inteiro já está bloqueado.")

    bloqueio = Bloqueio(**payload.model_dump())
    db.add(bloqueio)
    try:
        db.commit()
        db.refresh(bloqueio)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Esse horário já está bloqueado.")
    return bloqueio


@router.delete("/{bloqueio_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def remover_bloqueio(bloqueio_id: int, db: Session = Depends(get_db)):
    bloqueio = db.query(Bloqueio).filter(Bloqueio.id == bloqueio_id).first()
    if not bloqueio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Bloqueio não encontrado.")
    db.delete(bloqueio)
    db.commit()


@router.get("/validar-admin", dependencies=[Depends(require_admin)])
def validar_admin():
    """Endpoint usado pelo frontend para verificar se o token de admin é válido."""
    return {"ok": True}
