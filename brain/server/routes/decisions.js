import express from 'express';
const router = express.Router();

// Analyze situation
router.post('/analyze', async (req, res) => {
  try {
    const { decisionEngine } = req.app.locals;
    const analysis = await decisionEngine.analyzeSituation(req.body);
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { decisionEngine } = req.app.locals;
    const { query } = req.body;
    const recommendations = await decisionEngine.getRecommendations(query);
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending decisions
router.get('/pending', async (req, res) => {
  try {
    const { decisionEngine } = req.app.locals;
    const decisions = await decisionEngine.getPendingDecisions();
    res.json({ decisions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log decision
router.post('/:id/decide', async (req, res) => {
  try {
    const { decisionEngine } = req.app.locals;
    const { decision, outcome } = req.body;
    const record = await decisionEngine.logDecision(req.params.id, decision, outcome);
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get decision history
router.get('/history', async (req, res) => {
  try {
    const { decisionEngine } = req.app.locals;
    const history = await decisionEngine.getDecisionHistory();
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const { decisionEngine } = req.app.locals;
    const stats = await decisionEngine.getStats();
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
