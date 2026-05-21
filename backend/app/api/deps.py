from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db


async def db_session() -> AsyncGenerator[AsyncSession]:
    async for session in get_db():
        yield session


DbSession = Annotated[AsyncSession, Depends(db_session)]
