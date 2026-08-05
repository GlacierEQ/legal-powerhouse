/**
 * CaseBrain API Routes
 * Unified memory system endpoints
 */

const express = require('express');
const router = express.Router();
const { UnifiedOrchestrator } = require('../brain/memory/unified-brain');

const orchestrator = new UnifiedOrchestrator();

// Get full system status
router.get('/status', async (req, res) => {
  try {
    const status = await orchestrator.getStatus();
    res.json(status);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Store a memory
router.post('/memory', async (req, res) => {
  try {
    const { content, type, tags, metadata } = req.body;
    const memory = await orchestrator.brain.storeMemory({ content, type, tags, metadata });
    res.json({ success: true, memory });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Search memories
router.get('/memory/search', async (req, res) => {
  try {
    const { q, type, tags, limit, min_importance } = req.query;
    const memories = await orchestrator.brain.searchMemories(q, {
      type,
      tags: tags ? tags.split(',') : undefined,
      limit: parseInt(limit) || 10,
      minImportance: parseInt(min_importance) || 0
    });
    res.json({ memories, count: memories.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get timeline
router.get('/timeline', async (req, res) => {
  try {
    const timeline = await orchestrator.brain.timeline.getTimeline();
    res.json({ timeline, count: timeline.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add timeline event
router.post('/timeline', async (req, res) => {
  try {
    const event = await orchestrator.brain.timeline.addEvent(req.body);
    res.json({ success: true, event });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get days to events
router.get('/timeline/days', async (req, res) => {
  try {
    const days = await orchestrator.brain.timeline.getDaysToEvents();
    res.json({ events: days });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get flip cascade
router.get('/timeline/cascade', async (req, res) => {
  try {
    const cascade = await orchestrator.brain.timeline.getFlipCascade();
    res.json(cascade);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get active threats
router.get('/threats', async (req, res) => {
  try {
    const threats = await orchestrator.brain.threats.getActiveThreats();
    res.json({ threats, count: threats.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Log a threat
router.post('/threats', async (req, res) => {
  try {
    const threat = await orchestrator.brain.threats.logThreat(req.body);
    res.json({ success: true, threat });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Analyze judge patterns
router.get('/threats/judges', async (req, res) => {
  try {
    const patterns = await orchestrator.brain.threats.analyzeJudgePatterns();
    res.json({ patterns });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = await orchestrator.brain.decisions.getRecommendations();
    res.json({ recommendations, count: recommendations.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Process JEFS email
router.post('/process/jefs', async (req, res) => {
  try {
    const recommendations = await orchestrator.processJEFSEmail(req.body);
    res.json({ success: true, recommendations });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Process court filing
router.post('/process/filing', async (req, res) => {
  try {
    await orchestrator.processFiling(req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Export brain state
router.get('/export', async (req, res) => {
  try {
    const state = await orchestrator.exportState();
    res.json(state);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Memory statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await orchestrator.brain.getStats();
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
