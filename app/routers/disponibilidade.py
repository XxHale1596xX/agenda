from datetime import date, time
from typing import Optional
import calendar

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Agendamento, Bloqueio
from app.schemas import AgendamentoOut, DisponibilidadeDia, SlotStatus

router = APIRouter(prefix="/disponibilidade", tags=["disponibilidade"])

# Horários de funcionamento — altere aqui para mudar a grade
SLOTS: list[time] = [time(h, 0) for h in range(8, 18)]  # 08:00 – 17:00


def _build_dia(
    data_alvo: date,
    agendamentos: list[Agendamento],
    bloqueios: list[Bloqueio],
) -> DisponibilidadeDia:
    bloqueio_dia = next((b for b in bloqueios if b.hora is None), None)
    bloqueios_hora = {b.hora: b for b in bloqueios if b.hora is not None}
    ags_hora: dict[time, list[Agendamento]] = {}
    for ag in agendamentos:
        ags_hora.setdefault(ag.hora_aula, []).append(ag)

    slots = []
    for slot in SLOTS:
        hora_str = slot.strftime("%H:%M")
        if bloqueio_dia:
            status = "bloqueado"
            bloqueio_id = bloqueio_dia.id
        elif slot in bloqueios_hora:
            status = "bloqueado"
            bloqueio_id = bloqueios_hora[slot].id
        elif slot in ags_hora:
            status = "ocupado"
            bloqueio_id = None
        else:
            status = "disponivel"
            bloqueio_id = None

        slots.append(SlotStatus(
            hora=hora_str,
            status=status,
            bloqueio_id=bloqueio_id,
            agendamentos=[AgendamentoOut.model_validate(a) for a in ags_hora.get(slot, [])],
        ))

    return DisponibilidadeDia(
        data=data_alvo,
        dia_bloqueado=bloqueio_dia is not None,
        slots=slots,
    )


@router.get("/{data_str}", response_model=DisponibilidadeDia)
def disponibilidade_dia(
    data_str: str,
    instrutor: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """Retorna disponibilidade de slots para um dia específico (YYYY-MM-DD)."""
    data_alvo = date.fromisoformat(data_str)

    q_ags = db.query(Agendamento).filter(Agendamento.data_aula == data_alvo)
    if instrutor:
        q_ags = q_ags.filter(Agendamento.instrutor == instrutor)
    agendamentos = q_ags.all()

    bloqueios = db.query(Bloqueio).filter(Bloqueio.data == data_alvo).all()

    return _build_dia(data_alvo, agendamentos, bloqueios)


@router.get("/mes/{ano_mes}", response_model=dict[str, dict[str, str]])
def disponibilidade_mes(
    ano_mes: str,
    instrutor: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """
    Retorna status resumido por data+hora para um mês inteiro (YYYY-MM).
    Formato: { "2026-04-07": { "08:00": "disponivel", "09:00": "ocupado", ... }, ... }
    """
    ano, mes = int(ano_mes[:4]), int(ano_mes[5:7])
    primeiro = date(ano, mes, 1)
    ultimo = date(ano, mes, calendar.monthrange(ano, mes)[1])

    q_ags = db.query(Agendamento).filter(
        Agendamento.data_aula >= primeiro,
        Agendamento.data_aula <= ultimo,
    )
    if instrutor:
        q_ags = q_ags.filter(Agendamento.instrutor == instrutor)

    ags_por_data: dict[date, list[Agendamento]] = {}
    for ag in q_ags.all():
        ags_por_data.setdefault(ag.data_aula, []).append(ag)

    bloqs_por_data: dict[date, list[Bloqueio]] = {}
    for b in db.query(Bloqueio).filter(
        Bloqueio.data >= primeiro, Bloqueio.data <= ultimo
    ).all():
        bloqs_por_data.setdefault(b.data, []).append(b)

    result: dict[str, dict[str, str]] = {}
    current = primeiro
    from datetime import timedelta
    while current <= ultimo:
        dia = _build_dia(current, ags_por_data.get(current, []), bloqs_por_data.get(current, []))
        result[current.isoformat()] = {s.hora: s.status for s in dia.slots}
        current += timedelta(days=1)

    return result
