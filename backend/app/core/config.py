"""Application settings, loaded from environment + ``.env``.

We use ``pydantic-settings`` so every config value is type-checked at startup.
Settings are constructed once via :func:`get_settings` and cached, so calls
from anywhere in the app are cheap.
"""

from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "OpenHRCore"
    app_env: str = "development"
    debug: bool = False
    log_level: str = "INFO"
    api_v1_prefix: str = "/api/v1"

    host: str = "0.0.0.0"
    port: int = 8000

    # ``NoDecode`` stops pydantic-settings from JSON-decoding the env var.
    # Without it, ``BACKEND_CORS_ORIGINS=a,b`` raises JSONDecodeError before
    # our validator can split on commas.
    backend_cors_origins: Annotated[list[str], NoDecode] = Field(default_factory=list)

    database_url: str

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
