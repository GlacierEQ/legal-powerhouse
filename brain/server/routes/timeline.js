import express from 'express';
const router = express.Router();

// Get timeline
router.get('/', async (req, res) => {
  try {
    const { timelineTracker } = req.app.locals;
    const timeline = await timelineTracker.getTimeline(req.query);
    res.json({ timeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add event
router.post('/events', async (req, res) => {
  try {
    const { timelineTracker } = req.app.locals;
    const event = await timelineTracker.addEvent(req.body);
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming deadlines
router.get('/deadlines', async (req, res) => {
  try {
    const { timelineTracker } = req.app.locals;
    const deadlines = await timelineTracker.getUpcomingDeadlines(parseInt(req.query.days) || 30);
    res.json({ deadlines });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get custody countdown
router.get('/custody-countdown', async (req, res) => {
  try {
    const { timelineTracker } = req.app.locals;
    const countdown = await timelineTracker.getCustodyCountdown();
    res.json({ countdown });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get flip cascade status
router.get('/flip-cascade', async (req, res) => {
  try {
    const { timelineTracker } = req.app.locals;
    const cascade = await timelineTracker.getFlipCascadeStatus();
    res.json({ cascade });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get motion status
router.get('/motions', async (req, res) => {
  try {
    const { timelineTracker } = req.app.locals;
    const motions = await timelineTracker.getMotionStatus();
    res.json({ motions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get timeline stats
router.get('/stats', async (req, res) => {
  try {
    const { timelineTracker } = req.app.locals;
    const stats = await timelineTracker.getTimelineStats();
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
