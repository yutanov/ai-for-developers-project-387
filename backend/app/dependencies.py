from typing import Optional

from app.storage import InMemoryStorage

_storage: Optional[InMemoryStorage] = None


def get_storage() -> InMemoryStorage:
    global _storage
    if _storage is None:
        _storage = InMemoryStorage()
    return _storage
