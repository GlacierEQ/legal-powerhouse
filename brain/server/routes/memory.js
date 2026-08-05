import express from 'express';
const router = express.Router();

// Store memory
router.post('/', async (req, res) => {
  try {
    const { memoryEngine } = req.app.locals;
    const memory = await memoryEngine.store(req.body);
    res.json({ success: true, memory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search memories
router.post('/search', async (req, res) => {
  try {
    const { memoryEngine } = req.app.locals;
    const { query, categories, tags, limit } = req.body;
    const results = await memoryEngine.search(query, { categories, tags, limit });
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get context
router.post('/context', async (req, res) => {
  try {
    const { memoryEngine } = req.app.locals;
    const { query } = req.body;
    const context = await memoryEngine.getContext(query);
    res.json({ context });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const { memoryEngine } = req.app.locals;
    const stats = await memoryEngine.getStats();
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
