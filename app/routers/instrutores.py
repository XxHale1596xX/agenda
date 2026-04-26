from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Instrutor
from app.schemas import InstrutorCreate, InstrutorOut, InstrutorUpdate
from app.dependencies import require_admin

router = APIRouter(prefix="/instrutores", tags=["instrutores"])


@router.get("/", response_model=list[InstrutorOut])
def listar_instrutores(
    busca: Optional[str] = None,
    ativo: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Instrutor)
    if busca:
        query = query.filter(Instrutor.nome.ilike(f"%{busca}%"))
    if ativo is not None:
        query = query.filter(Instrutor.ativo == ativo)
    return query.order_by(Instrutor.nome).all()


@router.get("/{instrutor_id}", response_model=InstrutorOut)
def buscar_instrutor(instrutor_id: int, db: Session = Depends(get_db)):
    inst = db.query(Instrutor).filter(Instrutor.id == instrutor_id).first()
    if not inst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instrutor não encontrado.")
    return inst


@router.post("/", response_model=InstrutorOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def criar_instrutor(payload: InstrutorCreate, db: Session = Depends(get_db)):
    inst = Instrutor(**payload.model_dump())
    db.add(inst)
    try:
        db.commit()
        db.refresh(inst)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="CPF já cadastrado.")
    return inst


@router.put("/{instrutor_id}", response_model=InstrutorOut,
            dependencies=[Depends(require_admin)])
def atualizar_instrutor(instrutor_id: int, payload: InstrutorUpdate, db: Session = Depends(get_db)):
    inst = db.query(Instrutor).filter(Instrutor.id == instrutor_id).first()
    if not inst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instrutor não encontrado.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(inst, field, value)
    db.commit()
    db.refresh(inst)
    return inst


@router.delete("/{instrutor_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def remover_instrutor(instrutor_id: int, db: Session = Depends(get_db)):
    inst = db.query(Instrutor).filter(Instrutor.id == instrutor_id).first()
    if not inst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instrutor não encontrado.")
    db.delete(inst)
    db.commit()
