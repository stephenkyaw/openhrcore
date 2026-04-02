"""Application configuration loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration sourced from env vars / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "OpenHRCore"
    DEBUG: bool = False
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://openhrcore:openhrcore@localhost:5432/openhrcore"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Keycloak / Auth
    KEYCLOAK_URL: str = "http://localhost:8080"
    KEYCLOAK_REALM: str = "openhrcore"
    KEYCLOAK_CLIENT_ID: str = "openhrcore-api"

    # S3-compatible object storage
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "openhrcore"

    # AI integration
    AI_PROVIDER: str = "openai"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4o"

    # Local JWT signing (used when AUTH_DEV_MODE=true or built-in login)
    JWT_SECRET: str = "openhrcore-dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480

    # Dev mode — bypass Keycloak auth with a fake user
    AUTH_DEV_MODE: bool = False

    @property
    def keycloak_openid_config_url(self) -> str:
        return (
            f"{self.KEYCLOAK_URL}/realms/{self.KEYCLOAK_REALM}"
            "/.well-known/openid-configuration"
        )

    @property
    def keycloak_jwks_url(self) -> str:
        return (
            f"{self.KEYCLOAK_URL}/realms/{self.KEYCLOAK_REALM}/protocol/openid-connect/certs"
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton of the application settings."""
    return Settings()
