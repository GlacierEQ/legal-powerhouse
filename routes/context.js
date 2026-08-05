/**
 * Context Compression API Routes (Node.js)
 */

const express = require('express');
const router = express.Router();

// In-memory context storage
let contextChunks = [];
let compressedArchive = [];

// Simple summarization
function summarize(content) {
  const sentences = content.split('. ');
  if (sentences.length <= 2) return content;
  return sentences.slice(0, 2).join('. ') + '.';
}

// Generate ID
function generateId(content) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
}

// POST /context/add
router.post('/context/add', (req, res) => {
  const { content, importance = 5, tags = [] } = req.body;
  
  const chunk = {
    id: generateId(content),
    content,
    timestamp: new Date().toISOString(),
    tokenCount: content.split(' ').length * 1.3,
    importance,
    tags,
    compressed: false,
    summary: null
  };
  
  contextChunks.push(chunk);
  
  // Auto-compress if over limit
  if (contextChunks.length > 10) {
    const old = contextChunks.slice(0, -10);
    old.forEach(c => {
      if (!c.compressed) {
        c.summary = summarize(c.content);
        c.compressed = true;
        compressedArchive.push({
          id: c.id,
          summary: c.summary,
          timestamp: c.timestamp,
          importance: c.importance,
          tags: c.tags
        });
      }
    });
    contextChunks = contextChunks.slice(-10);
  }
  
  res.json({ id: chunk.id, status: 'added' });
});

// GET /context/get
router.get('/context/get', (req, res) => {
  const includeSummaries = req.query.include_summaries !== 'false';
  
  let output = [];
  
  if (includeSummaries && compressedArchive.length > 0) {
    output.push('=== COMPRESSED CONTEXT ===');
    compressedArchive.slice(-5).forEach(a => {
      output.push(`[${a.timestamp}] ${a.summary}`);
    });
    output.push('==========================');
  }
  
  output.push('=== RECENT CONTEXT (VERBATIM) ===');
  contextChunks.forEach(c => {
    output.push(`[${c.timestamp}] ${c.content}`);
  });
  
  res.json({ context: output.join('\n') });
});

// POST /context/search
router.post('/context/search', (req, res) => {
  const { query } = req.body;
  const queryLower = query.toLowerCase();
  
  const results = [
    ...contextChunks.filter(c => c.content.toLowerCase().includes(queryLower)),
    ...compressedArchive.filter(a => (a.summary || '').toLowerCase().includes(queryLower))
  ];
  
  res.json({ results, count: results.length });
});

// GET /context/export
router.get('/context/export', (req, res) => {
  res.json({ chunks: contextChunks, archive: compressedArchive });
});

// POST /context/import
router.post('/context/import', (req, res) => {
  const { chunks, archive } = req.body;
  if (chunks) contextChunks = chunks;
  if (archive) compressedArchive = archive;
  res.json({ status: 'imported' });
});

module.exports = router;
