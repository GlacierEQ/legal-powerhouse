"""
Context Compression API Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from brain.memory.context_compression import (
    add_context, get_context, search_context, 
    export_state, import_state
)

router = APIRouter(prefix="/context", tags=["context"])

class AddContextRequest(BaseModel):
    content: str
    importance: int = 5
    tags: Optional[List[str]] = None

class SearchRequest(BaseModel):
    query: str

@router.post("/add")
async def add_context_endpoint(request: AddContextRequest):
    """Add new context chunk."""
    result = add_context(request.content, request.importance, request.tags)
    return result

@router.get("/get")
async def get_context_endpoint(include_summaries: bool = True):
    """Get compressed context."""
    context = get_context(include_summaries)
    return {'context': context}

@router.post("/search")
async def search_context_endpoint(request: SearchRequest):
    """Search context."""
    results = search_context(request.query)
    return {'results': results, 'count': len(results)}

@router.get("/export")
async def export_state_endpoint():
    """Export context state."""
    state = export_state()
    return state

@router.post("/import")
async def import_state_endpoint(state: dict):
    """Import context state."""
    import_state(state)
    return {'status': 'imported'}
