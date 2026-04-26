from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Veiculo
from app.schemas import VeiculoCreate, VeiculoOut, VeiculoUpdate
from app.dependencies import require_admin

router = APIRouter(prefix="/veiculos", tags=["veiculos"])


@router.get("/", response_model=list[VeiculoOut])
def listar_veiculos(
    busca: Optional[str] = None,
    ativo: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Veiculo)
    if busca:
        query = query.filter(
            Veiculo.modelo.ilike(f"%{busca}%") | Veiculo.placa.ilike(f"%{busca}%")
        )
    if ativo is not None:
        query = query.filter(Veiculo.ativo == ativo)
    return query.order_by(Veiculo.marca, Veiculo.modelo).all()


@router.get("/{veiculo_id}", response_model=VeiculoOut)
def buscar_veiculo(veiculo_id: int, db: Session = Depends(get_db)):
    v = db.query(Veiculo).filter(Veiculo.id == veiculo_id).first()
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado.")
    return v


@router.post("/", response_model=VeiculoOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def criar_veiculo(payload: VeiculoCreate, db: Session = Depends(get_db)):
    v = Veiculo(**payload.model_dump())
    db.add(v)
    try:
        db.commit()
        db.refresh(v)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Placa já cadastrada.")
    return v


@router.put("/{veiculo_id}", response_model=VeiculoOut,
            dependencies=[Depends(require_admin)])
def atualizar_veiculo(veiculo_id: int, payload: VeiculoUpdate, db: Session = Depends(get_db)):
    v = db.query(Veiculo).filter(Veiculo.id == veiculo_id).first()
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(v, field, value)
    db.commit()
    db.refresh(v)
    return v


@router.delete("/{veiculo_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def remover_veiculo(veiculo_id: int, db: Session = Depends(get_db)):
    v = db.query(Veiculo).filter(Veiculo.id == veiculo_id).first()
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado.")
    db.delete(v)
    db.commit()
