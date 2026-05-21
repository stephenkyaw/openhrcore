import time
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import get_logger, request_id_ctx

log = get_logger("app.request")


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Assign a request-id, log the access line, and attach the id to responses."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("x-request-id") or uuid4().hex
        token = request_id_ctx.set(request_id)
        start = time.perf_counter()
        try:
            response: Response = await call_next(request)
        except Exception:
            elapsed_ms = (time.perf_counter() - start) * 1000
            log.exception(
                "%s %s -> 500 in %.1fms", request.method, request.url.path, elapsed_ms
            )
            raise
        else:
            elapsed_ms = (time.perf_counter() - start) * 1000
            log.info(
                "%s %s -> %d in %.1fms",
                request.method,
                request.url.path,
                response.status_code,
                elapsed_ms,
            )
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            request_id_ctx.reset(token)
