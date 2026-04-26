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


# ── Instrutores ───────────────────────────────────────────────────────────────

class InstrutorBase(BaseModel):
    nome: str
    cpf: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    categorias: str = "B"

    @field_validator("cpf")
    @classmethod
    def validar_cpf(cls, v: str) -> str:
        return _validar_cpf(v)

    @field_validator("categorias")
    @classmethod
    def validar_categorias(cls, v: str) -> str:
        validas = set("ABCDE")
        partes = [c.strip().upper() for c in v.split(",") if c.strip()]
        if not partes or not all(p in validas for p in partes):
            raise ValueError("Categorias inválidas. Use A, B, C, D ou E separados por vírgula.")
        return ",".join(sorted(set(partes)))


class InstrutorCreate(InstrutorBase):
    pass


class InstrutorUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    categorias: Optional[str] = None
    ativo: Optional[bool] = None


class InstrutorOut(InstrutorBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ativo: bool
    criado_em: datetime


# ── Veículos ──────────────────────────────────────────────────────────────────

class VeiculoBase(BaseModel):
    placa: str
    modelo: str
    marca: str
    ano: Optional[int] = None
    categoria: str = "B"
    km_atual: int = 0

    @field_validator("placa")
    @classmethod
    def normalizar_placa(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("categoria")
    @classmethod
    def validar_categoria(cls, v: str) -> str:
        if v.upper() not in {"A", "B", "C", "D", "E"}:
            raise ValueError("Categoria deve ser A, B, C, D ou E.")
        return v.upper()


class VeiculoCreate(VeiculoBase):
    pass


class VeiculoUpdate(BaseModel):
    modelo: Optional[str] = None
    marca: Optional[str] = None
    ano: Optional[int] = None
    categoria: Optional[str] = None
    ativo: Optional[bool] = None
    km_atual: Optional[int] = None


class VeiculoOut(VeiculoBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ativo: bool
    criado_em: datetime


# ── Disponibilidade do Instrutor ─────────────────────────────────────────────

class DisponibilidadeInstrutorCreate(BaseModel):
    data: date
    hora: time


class DisponibilidadeInstrutorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    instrutor_id: int
    data: date
    hora: time


class DisponibilidadeBatchCreate(BaseModel):
    slots: list[DisponibilidadeInstrutorCreate]


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
