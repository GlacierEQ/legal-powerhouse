"""
Context Compression Engine
Distills old context while preserving recent verbatim.

Strategy:
- Recent (last N messages): Keep verbatim
- Older context: Compress into summaries
- Critical memories: Always preserved
"""

import json
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from pathlib import Path

@dataclass
class ContextChunk:
    id: str
    content: str
    timestamp: str
    token_count: int
    importance: int  # 1-10
    tags: List[str]
    compressed: bool = False
    summary: Optional[str] = None

class ContextCompressor:
    def __init__(self, max_recent: int = 10, max_tokens: int = 8000):
        self.max_recent = max_recent  # Keep last N messages verbatim
        self.max_tokens = max_tokens
        self.chunks: List[ContextChunk] = []
        self.compressed_archive: List[Dict] = []
    
    def add_context(self, content: str, importance: int = 5, tags: List[str] = None) -> ContextChunk:
        """Add new context chunk."""
        chunk = ContextChunk(
            id=self._generate_id(content),
            content=content,
            timestamp=datetime.now().isoformat(),
            token_count=self._estimate_tokens(content),
            importance=importance,
            tags=tags or []
        )
        self.chunks.append(chunk)
        
        # Auto-compress if over limit
        if self._total_tokens() > self.max_tokens:
            self.compress_old()
        
        return chunk
    
    def compress_old(self):
        """Compress old chunks, keep recent verbatim."""
        if len(self.chunks) <= self.max_recent:
            return
        
        # Split: recent (verbatim) + old (to compress)
        old_chunks = self.chunks[:-self.max_recent]
        recent_chunks = self.chunks[-self.max_recent:]
        
        # Compress old chunks
        for chunk in old_chunks:
            if not chunk.compressed:
                chunk.summary = self._summarize(chunk.content)
                chunk.compressed = True
                self.compressed_archive.append({
                    'id': chunk.id,
                    'original': chunk.content[:200] + '...',
                    'summary': chunk.summary,
                    'timestamp': chunk.timestamp,
                    'importance': chunk.importance,
                    'tags': chunk.tags
                })
        
        # Keep only recent + compressed summaries in active context
        compressed_summaries = [c.summary for c in old_chunks if c.summary]
        self.chunks = recent_chunks
    
    def get_context(self, include_summaries: bool = True) -> str:
        """Get current context - recent verbatim + optional compressed summaries."""
        parts = []
        
        # Add compressed summaries if requested
        if include_summaries and self.compressed_archive:
            parts.append("=== COMPRESSED CONTEXT ===")
            for archive in self.compressed_archive[-5:]:  # Last 5 summaries
                parts.append(f"[{archive['timestamp']}] {archive['summary']}")
            parts.append("==========================")
        
        # Add recent context verbatim
        parts.append("=== RECENT CONTEXT (VERBATIM) ===")
        for chunk in self.chunks:
            parts.append(f"[{chunk.timestamp}] {chunk.content}")
        
        return "\n".join(parts)
    
    def search(self, query: str) -> List[ContextChunk]:
        """Search across all chunks."""
        results = []
        query_lower = query.lower()
        
        for chunk in self.chunks:
            if query_lower in chunk.content.lower():
                results.append(chunk)
        
        for archive in self.compressed_archive:
            if query_lower in archive.get('summary', '').lower():
                results.append(ContextChunk(
                    id=archive['id'],
                    content=archive['summary'],
                    timestamp=archive['timestamp'],
                    token_count=0,
                    importance=archive['importance'],
                    tags=archive['tags'],
                    compressed=True
                ))
        
        return sorted(results, key=lambda x: x.importance, reverse=True)
    
    def _generate_id(self, content: str) -> str:
        return hashlib.sha256(content.encode()).hexdigest()[:12]
    
    def _estimate_tokens(self, text: str) -> int:
        return len(text.split()) * 1.3  # Rough estimate
    
    def _total_tokens(self) -> int:
        return sum(c.token_count for c in self.chunks)
    
    def _summarize(self, content: str) -> str:
        """Simple extractive summarization."""
        sentences = content.split('. ')
        if len(sentences) <= 2:
            return content
        
        # Keep first sentence + most important
        important = sorted(sentences, key=len, reverse=True)[:2]
        return '. '.join(important[:2]) + '.'
    
    def export_state(self) -> Dict:
        """Export compressor state for persistence."""
        return {
            'chunks': [asdict(c) for c in self.chunks],
            'archive': self.compressed_archive,
            'config': {
                'max_recent': self.max_recent,
                'max_tokens': self.max_tokens
            }
        }
    
    def import_state(self, state: Dict):
        """Import compressor state."""
        self.chunks = [ContextChunk(**c) for c in state.get('chunks', [])]
        self.compressed_archive = state.get('archive', [])
        config = state.get('config', {})
        self.max_recent = config.get('max_recent', self.max_recent)
        self.max_tokens = config.get('max_tokens', self.max_tokens)

# Global instance
context_engine = ContextCompressor()

def add_context(content: str, importance: int = 5, tags: List[str] = None) -> Dict:
    """Add context to the engine."""
    chunk = context_engine.add_context(content, importance, tags)
    return {'id': chunk.id, 'status': 'added'}

def get_context(include_summaries: bool = True) -> str:
    """Get compressed context."""
    return context_engine.get_context(include_summaries)

def search_context(query: str) -> List[Dict]:
    """Search context."""
    results = context_engine.search(query)
    return [{'id': r.id, 'content': r.content, 'importance': r.importance} for r in results]

def export_state() -> Dict:
    """Export state for persistence."""
    return context_engine.export_state()

def import_state(state: Dict):
    """Import state."""
    context_engine.import_state(state)
