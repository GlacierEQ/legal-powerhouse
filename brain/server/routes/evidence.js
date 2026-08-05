import express from 'express';
const router = express.Router();

// Store evidence
router.post('/', async (req, res) => {
  try {
    const { memoryEngine } = req.app.locals;
    const evidence = await memoryEngine.store({
      ...req.body,
      category: 'EVIDENCE',
      tags: [...(req.body.tags || []), '#EVIDENCE']
    });
    res.json({ success: true, evidence });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search evidence
router.post('/search', async (req, res) => {
  try {
    const { memoryEngine } = req.app.locals;
    const { query, tags, limit } = req.body;
    const results = await memoryEngine.search(query, {
      categories: ['EVIDENCE'],
      tags,
      limit
    });
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get evidence by ID
router.get('/:id', async (req, res) => {
  try {
    const { memoryEngine } = req.app.locals;
    const results = await memoryEngine.search(req.params.id, { limit: 1 });
    res.json({ evidence: results[0] || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get smoking guns
router.get('/smoking-guns/all', async (req, res) => {
  try {
    const { memoryEngine } = req.app.locals;
    const results = await memoryEngine.search('', {
      categories: ['EVIDENCE'],
      tags: ['#SMOKING-GUN'],
      limit: 50
    });
    res.json({ smokingGuns: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
