"""Factory for creating the configured AI engine instance."""

from __future__ import annotations

from src.config import get_settings
from src.modules.ai.engine.base import AIEngine


def get_ai_engine() -> AIEngine:
    """Return an AI engine based on application settings.

    Raises ``ValueError`` if the configured provider is unsupported or the API
    key is missing.
    """
    settings = get_settings()

    if not settings.AI_API_KEY:
        msg = "AI_API_KEY is not configured — cannot create AI engine"
        raise ValueError(msg)

    provider = settings.AI_PROVIDER.lower()

    if provider == "openai":
        from src.modules.ai.engine.openai_engine import OpenAIEngine

        return OpenAIEngine(api_key=settings.AI_API_KEY, model=settings.AI_MODEL)

    msg = f"Unsupported AI provider: {provider!r}. Supported: openai"
    raise ValueError(msg)
