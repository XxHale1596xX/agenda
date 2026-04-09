from datetime import date, time, datetime
import re
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


def _validar_cpf(cpf: str) -> str:
    """Remove máscara, valida dígitos verificadores e retorna só os 11 dígitos."""
    digits = re.sub(r"\D", "", cpf)
    if len(digits) != 11:
        raise ValueError("CPF deve conter 11 dígitos.")
    if len(set(digits)) == 1:
        raise ValueError("CPF inválido (todos os dígitos iguais).")

    def _calc(d: str, weights: range) -> int:
        total = sum(int(c) * w for c, w in zip(d, weights))
        rest = total % 11
        return 0 if rest < 2 else 11 - rest

    if _calc(digits, range(10, 1, -1)) != int(digits[9]):
        raise ValueError("CPF inválido.")
    if _calc(digits, range(11, 1, -1)) != int(digits[10]):
        raise ValueError("CPF inválido.")
    return digits


# ── Agendamentos ─────────────────────────────────────────────────────────────

class AgendamentoBase(BaseModel):
    aluno: str
    instrutor: str
    data_aula: date
    hora_aula: time


class AgendamentoCreate(AgendamentoBase):
    pass


class AgendamentoUpdate(AgendamentoBase):
    pass


class AgendamentoOut(AgendamentoBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ── Bloqueios ─────────────────────────────────────────────────────────────────

class BloqueioCreate(BaseModel):
    data: date
    hora: Optional[time] = None   # None = dia inteiro
    motivo: Optional[str] = None


class BloqueioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    data: date
    hora: Optional[time]
    motivo: Optional[str]
    criado_em: datetime


# ── Usuários ─────────────────────────────────────────────────────────────────

class UsuarioBase(BaseModel):
    nome: str
    cpf: str
    email: Optional[str] = None
    telefone: Optional[str] = None

    @field_validator("cpf")
    @classmethod
    def validar_cpf(cls, v: str) -> str:
        return _validar_cpf(v)


class UsuarioCreate(UsuarioBase):
    pass


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    ativo: Optional[bool] = None


class UsuarioOut(UsuarioBase):
    """Resposta completa — usada em endpoints de detalhe (GET /{id}) e edição."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    ativo: bool
    criado_em: datetime


class UsuarioOutMasked(BaseModel):
    """Resposta para listagem — CPF e e-mail mascarados para proteger dados sensíveis."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    cpf_mascarado: str     # "***.***.247-**"
    email_mascarado: Optional[str]
    telefone: Optional[str]
    ativo: bool
    criado_em: datetime

    @classmethod
    def from_orm_masked(cls, u) -> "UsuarioOutMasked":
        cpf = u.cpf  # 11 dígitos
        cpf_mask = f"***.***. {cpf[6:9]}-**" if len(cpf) == 11 else "***"
        # Formato: ***.XXX.XXX-** — expõe só o bloco do meio
        cpf_mask = f"***.***.{cpf[6:9]}-**"

        email_mask = None
        if u.email:
            local, _, domain = u.email.partition("@")
            visible = local[0] if local else "*"
            email_mask = f"{visible}{'*' * min(len(local) - 1, 4)}@{domain}"

        return cls(
            id=u.id,
            nome=u.nome,
            cpf_mascarado=cpf_mask,
            email_mascarado=email_mask,
            telefone=u.telefone,
            ativo=u.ativo,
            criado_em=u.criado_em,
        )


# ── Disponibilidade ───────────────────────────────────────────────────────────

class SlotStatus(BaseModel):
    hora: str          # "08:00"
    status: str        # "disponivel" | "ocupado" | "bloqueado"
    bloqueio_id: Optional[int]
    agendamentos: list[AgendamentoOut]


class DisponibilidadeDia(BaseModel):
    data: date
    dia_bloqueado: bool
    slots: list[SlotStatus]
