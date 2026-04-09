import os
import hmac
import logging
from passlib.context import CryptContext
from fastapi import Header, HTTPException, status

logger = logging.getLogger("audit")

_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ADMIN_TOKEN_HASH: bcrypt hash da senha de admin (gerado com _pwd_ctx.hash("senha"))
# ADMIN_TOKEN:      senha em texto puro — aceita por conveniência no dev, mas
#                   ADMIN_TOKEN_HASH tem precedência se definido
_TOKEN_HASH = os.getenv("ADMIN_TOKEN_HASH", "")
_TOKEN_PLAIN = os.getenv("ADMIN_TOKEN", "")


def _verify_token(candidate: str) -> bool:
    """Verifica o token usando hash bcrypt (produção) ou comparação segura (dev)."""
    if _TOKEN_HASH:
        # Produção: compara contra o hash bcrypt — resistente a timing attack por design
        return _pwd_ctx.verify(candidate, _TOKEN_HASH)
    if _TOKEN_PLAIN:
        # Dev: comparação timing-safe sem bcrypt
        return hmac.compare_digest(candidate.encode(), _TOKEN_PLAIN.encode())
    return False


def require_admin(x_admin_token: str = Header(...)):
    if not _TOKEN_HASH and not _TOKEN_PLAIN:
        logger.warning("AUDIT tentativa de acesso admin sem ADMIN_TOKEN configurado")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Autenticação de admin não configurada.",
        )
    if not _verify_token(x_admin_token):
        logger.warning("AUDIT falha de autenticação admin — token inválido")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de admin inválido.",
        )
    logger.info("AUDIT acesso admin autenticado com sucesso")
