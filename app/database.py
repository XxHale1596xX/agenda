import os
import time
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/autoescola.db")

_is_sqlite = DATABASE_URL.startswith("sqlite")

_connect_args = {"check_same_thread": False} if _is_sqlite else {
    "init_command": "SET time_zone='+00:00'"
}

_engine_kwargs = dict(connect_args=_connect_args, pool_pre_ping=True)


def _create_engine_with_retry(url: str, retries: int = 12, delay: int = 3):
    for attempt in range(1, retries + 1):
        try:
            eng = create_engine(url, **_engine_kwargs)
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Banco de dados conectado.")
            return eng
        except Exception as exc:
            logger.warning("Tentativa %d/%d falhou: %s", attempt, retries, exc)
            if attempt == retries:
                raise
            time.sleep(delay)


engine = _create_engine_with_retry(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
