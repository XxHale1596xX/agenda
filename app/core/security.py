import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext

JWT_SECRET    = os.getenv("JWT_SECRET", "dev-secret-troque-em-producao")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7

_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd_ctx.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_ctx.verify(plain, hashed)


def _create_token(subject_id: int, token_type: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": str(subject_id), "type": token_type, "exp": expire},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def _decode_token(token: str, expected_type: str) -> int:
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    if payload.get("type") != expected_type:
        raise JWTError("Token inválido.")
    return int(payload["sub"])


def create_student_token(user_id: int) -> str:
    return _create_token(user_id, "student")


def decode_student_token(token: str) -> int:
    return _decode_token(token, "student")


def create_instructor_token(instrutor_id: int) -> str:
    return _create_token(instrutor_id, "instructor")


def decode_instructor_token(token: str) -> int:
    return _decode_token(token, "instructor")
