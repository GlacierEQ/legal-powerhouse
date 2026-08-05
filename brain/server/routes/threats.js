import express from 'express';
const router = express.Router();

// Get threat level
router.get('/', async (req, res) => {
  try {
    const { threatMonitor } = req.app.locals;
    const threats = await threatMonitor.getThreatLevel();
    res.json({ threats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Detect threat
router.post('/detect', async (req, res) => {
  try {
    const { threatMonitor } = req.app.locals;
    const threat = await threatMonitor.detectThreat(req.body);
    res.json({ success: true, threat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent threats
router.get('/recent', async (req, res) => {
  try {
    const { threatMonitor } = req.app.locals;
    const threats = await threatMonitor.getRecentThreats(parseInt(req.query.hours) || 24);
    res.json({ threats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alerts
router.get('/alerts', async (req, res) => {
  try {
    const { threatMonitor } = req.app.locals;
    const alerts = await threatMonitor.getUnacknowledgedAlerts();
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge alert
router.post('/alerts/:id/acknowledge', async (req, res) => {
  try {
    const { threatMonitor } = req.app.locals;
    const alert = await threatMonitor.acknowledgeAlert(req.params.id);
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
