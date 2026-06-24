import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.staticfiles import StaticFiles
from starlette.types import Scope

from app.models import ErrorBody
from app.routers import admin, public, slots, bookings

server_url = os.getenv("RENDER_EXTERNAL_URL", "http://localhost:3000")
app = FastAPI(
    title="Calendar Booking API",
    version="1.0.0",
    servers=[{"url": server_url, "description": "Render" if "RENDER_EXTERNAL_URL" in os.environ else "Local development"}],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorBody(code=str(exc.status_code), message=str(exc.detail)).model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=ErrorBody(
            code="VALIDATION_ERROR",
            message="Request validation failed",
            details=[str(e) for e in exc.errors()],
        ).model_dump(),
    )

@app.get("/health")
def health():
    return {"status": "ok"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(public.router)
app.include_router(slots.router)
app.include_router(bookings.router)

class CachedStaticFiles(StaticFiles):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.cache_max_age = 60 * 60 * 24 * 365  # 1 year for hashed assets

    async def get_response(self, path: str, scope: Scope):
        response = await super().get_response(path, scope)
        if response.status_code == 200:
            if any(ext in path for ext in ('.js', '.css', '.png', '.jpg', '.svg', '.ico', '.woff2')):
                response.headers['Cache-Control'] = f'public, max-age={self.cache_max_age}, immutable'
            else:
                response.headers['Cache-Control'] = 'no-cache'
        return response

frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", CachedStaticFiles(directory=str(frontend_dist), html=True), name="frontend")
