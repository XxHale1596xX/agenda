from datetime import datetime
from sqlalchemy import Column, Integer, String, Date, Time, DateTime, UniqueConstraint, func, Boolean, Float
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


class Bloqueio(Base):
    __tablename__ = "bloqueios"

    id = Column(Integer, primary_key=True, index=True)
    data = Column(Date, nullable=False, index=True)
    hora = Column(Time, nullable=True)   # NULL = dia inteiro bloqueado
    motivo = Column(String(255), nullable=True)
    criado_em = Column(DateTime, nullable=False, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("data", "hora", name="uq_bloqueio_data_hora"),
    )


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    cpf = Column(String(11), nullable=False, unique=True, index=True)   # apenas dígitos
    email = Column(String(120), nullable=True)
    telefone = Column(String(20), nullable=True)
    ativo = Column(Boolean, nullable=False, default=True)
    senha_hash = Column(String(128), nullable=True)   # None = conta não ativada pelo aluno
    criado_em = Column(DateTime, nullable=False, server_default=func.now())


class Instrutor(Base):
    __tablename__ = "instrutores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    cpf = Column(String(11), nullable=False, unique=True, index=True)
    email = Column(String(120), nullable=True)
    telefone = Column(String(20), nullable=True)
    categorias = Column(String(10), nullable=False, default="B")
    ativo = Column(Boolean, nullable=False, default=True)
    senha_hash = Column(String(128), nullable=True)
    criado_em = Column(DateTime, nullable=False, server_default=func.now())


class DisponibilidadeInstrutor(Base):
    __tablename__ = "disponibilidade_instrutor"

    id = Column(Integer, primary_key=True, index=True)
    instrutor_id = Column(Integer, nullable=False, index=True)
    data = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    criado_em = Column(DateTime, nullable=False, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("instrutor_id", "data", "hora", name="uq_disp_inst_data_hora"),
    )


class Veiculo(Base):
    __tablename__ = "veiculos"

    id = Column(Integer, primary_key=True, index=True)
    placa = Column(String(8), nullable=False, unique=True, index=True)
    modelo = Column(String(80), nullable=False)
    marca = Column(String(50), nullable=False)
    ano = Column(Integer, nullable=True)
    categoria = Column(String(1), nullable=False, default="B")
    ativo = Column(Boolean, nullable=False, default=True)
    km_atual = Column(Integer, nullable=False, default=0)
    criado_em = Column(DateTime, nullable=False, server_default=func.now())
