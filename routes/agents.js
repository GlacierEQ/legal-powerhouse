/**
 * Agent API Routes
 * Endpoints for interacting with advanced agents
 */

const express = require('express');
const router = express.Router();
const { AgentOrchestrator } = require('../brain/agents/agent-framework');

const orchestrator = new AgentOrchestrator();

// ==================== STATUS ====================

// Get all agents status
router.get('/status', (req, res) => {
  const status = orchestrator.getAgentStatus();
  res.json({
    agents: status,
    total: Object.keys(status).length,
    timestamp: new Date().toISOString()
  });
});

// Get available agents
router.get('/list', (req, res) => {
  const agents = orchestrator.getAvailableAgents();
  res.json({ agents, count: agents.length });
});

// Get agents by category
router.get('/category/:category', (req, res) => {
  const agents = orchestrator.getAgentsByCategory(req.params.category);
  res.json({ category: req.params.category, agents });
});

// ==================== EXECUTE ====================

// Execute task on specific agent
router.post('/execute/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { task } = req.body;
    
    const result = await orchestrator.executeTask(agentId, task);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute tasks in parallel
router.post('/execute-parallel', async (req, res) => {
  try {
    const { tasks } = req.body;
    const results = await orchestrator.executeParallel(tasks);
    res.json({ results, count: results.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SPECIFIC AGENTS ====================

// Forensic Analyst
router.post('/forensic/hash', async (req, res) => {
  try {
    const result = await orchestrator.executeTask('forensic-analyst', {
      action: 'hash',
      filePath: req.body.filePath
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/forensic/authenticate', async (req, res) => {
  try {
    const result = await orchestrator.executeTask('forensic-analyst', {
      action: 'authenticate',
      filePath: req.body.filePath
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Timeline Reconstruction
router.post('/timeline/build', async (req, res) => {
  try {
    const result = await orchestrator.executeTask('timeline-reconstruction', {
      action: 'build',
      events: req.body.events
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/timeline/gaps', async (req, res) => {
  try {
    const result = await orchestrator.executeTask('timeline-reconstruction', {
      action: 'analyze-gaps',
      events: req.body.events
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pattern Detector
router.post('/pattern/bias', async (req, res) => {
  try {
    const result = await orchestrator.executeTask('pattern-detector', {
      action: 'detect-bias',
      data: req.body
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/pattern/violations', async (req, res) => {
  try {
    const result = await orchestrator.executeTask('pattern-detector', {
      action: 'find-violations',
      data: req.body
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Damages Calculator
router.post('/damages/calculate', async (req, res) => {
  try {
    const result = await orchestrator.executeTask('damages-calculator', {
      action: 'total',
      data: req.body
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Brief Generator
router.post('/brief/draft', async (req, res) => {
  try {
    const result = await orchestrator.executeTask('brief-generator', {
      action: 'draft',
      template: req.body.template,
      data: req.body.data
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deadline Tracker
router.post('/deadline/add', async (req, res) => {
  try {
    const result = await orchestrator.executeTask('deadline-tracker', {
      action: 'add',
      deadline: req.body
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/deadline/check', async (req, res) => {
  try {
    const result = await orchestrator.executeTask('deadline-tracker', {
      action: 'check'
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/deadline/upcoming', async (req, res) => {
  try {
    const result = await orchestrator.executeTask('deadline-tracker', {
      action: 'upcoming'
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
