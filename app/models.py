from sqlalchemy import Column, Integer, String, Date, Time, UniqueConstraint, Index
from app.database import Base


class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    aluno = Column(String(120), nullable=False)
    instrutor = Column(String(120), nullable=False, index=True)
    data_aula = Column(Date, nullable=False, index=True)
    hora_aula = Column(Time, nullable=False)

    __table_args__ = (
        UniqueConstraint("instrutor", "data_aula", "hora_aula", name="uq_instrutor_data_hora"),
    )
