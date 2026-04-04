from datetime import date, time
from pydantic import BaseModel, ConfigDict


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
