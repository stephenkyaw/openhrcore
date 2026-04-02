"""Abstract base class for AI provider integrations."""

from __future__ import annotations

from abc import ABC, abstractmethod

from src.modules.ai.schemas.screening import ScreeningInput, ScreeningOutput


class AIEngine(ABC):
    """Contract that every AI provider adapter must implement."""

    @abstractmethod
    async def screen_cv(self, screening_input: ScreeningInput) -> ScreeningOutput:
        """Run CV screening against job requirements and return structured results."""
