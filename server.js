/**
 * LEGAL POWERHOUSE - Unified Entry Point
 * 
 * Combines:
 * - Colossus Gateway (Keymaster + Gatekeeper)
 * - Fiat Justitia (Legal document engineering)
 * - Tower of Babel (Technology floors)
 * - Monolith (Library mapping)
 */

const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');

// Load environment variables (no hardcoded secrets)
// Use .env.local or system environment variables
require('dotenv').config({ path: '.env.local' });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Brain routes
const brainRoutes = require('./routes/brain');
app.use('/api/brain', brainRoutes);

// Context compression routes
const contextRoutes = require('./routes/context');
app.use('/api', contextRoutes);

// Agent routes
const agentRoutes = require('./routes/agents');
app.use('/api/agents', agentRoutes);

// ==================== COLOSSUS GATEWAY ROUTES ====================

// System status
app.get('/api/status', (req, res) => {
  res.json({
    name: 'Legal Powerhouse',
    version: '1.0.0',
    tagline: 'The relentless pursuit of truth',
    case: '1FDV-23-0001009',
    components: {
      colossus: { status: 'active', description: 'Keymaster + Gatekeeper' },
      fiat_justitia: { status: 'active', description: 'Legal document engineering' },
      tower_of_babel: { status: 'active', description: 'Technology floors' },
      monolith: { status: 'active', description: 'Library mapping' },
      casebrain: { status: 'active', description: 'Unified memory system' }
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ==================== KEYMASTER ROUTES ====================

const agents = require('./shared/config/agents.json');
const documents = require('./shared/config/documents.json');

app.get('/api/agents', (req, res) => {
  res.json(agents);
});

app.get('/api/agents/:tier', (req, res) => {
  const tier = req.params.tier;
  const filtered = Object.values(agents.agents).filter(a => a.tier === tier);
  res.json({ agents: filtered, tier, count: filtered.length });
});

app.get('/api/pistons', (req, res) => {
  res.json(agents.pistons);
});

// ==================== FIAT JUSTITIA ROUTES ====================

app.get('/api/documents', (req, res) => {
  res.json(documents);
});

app.get('/api/documents/:category', (req, res) => {
  const category = req.params.category;
  const docs = documents.categories[category];
  if (!docs) return res.status(404).json({ error: 'Category not found' });
  res.json({ category, ...docs });
});

app.get('/api/repositories', (req, res) => {
  res.json(documents.repositories);
});

// ==================== MONOLITH ROUTES ====================

app.get('/api/monolith/spine', (req, res) => {
  res.json({
    case_id: '1FDV-23-0001009',
    case_name: 'Kekoa Barton - Hawaii Family Court',
    status: 'active',
    layers: {
      legal_data: { repos: 10, status: 'indexed' },
      context_memory: { repos: 6, status: 'indexed' },
      work_product: { repos: 6, status: 'indexed' },
      legal_tech: { repos: 16, status: 'indexed' }
    },
    total_repos: 71
  });
});

// ==================== EVIDENCE ROUTES ====================

app.get('/api/evidence', (req, res) => {
  res.json({
    case_id: '1FDV-23-0001009',
    evidence_types: [
      { type: 'documentary', count: 27, status: 'ready' },
      { type: 'audio', count: 4, status: 'pending_transcription' },
      { type: 'digital', count: 12, status: 'authenticated' },
      { type: 'expert', count: 3, status: 'retained' }
    ],
    total_exhibits: 46,
    filing_readiness: '87%'
  });
});

// ==================== MASTER CASEBUILDER & ACTORS ROUTES ====================

const fs = require('fs');

function getCasebuilderData() {
  const casebuilderPath = path.join(__dirname, 'brain', 'CASE_1FDV-23-0001009_COMPLETE_CASEBUILDER.json');
  if (fs.existsSync(casebuilderPath)) {
    try {
      return JSON.parse(fs.readFileSync(casebuilderPath, 'utf8'));
    } catch (e) {
      console.error('Error reading casebuilder JSON:', e);
    }
  }
  return null;
}

app.get('/api/v1/casebuilder', (req, res) => {
  const data = getCasebuilderData();
  if (data) return res.json(data);
  res.status(404).json({ error: 'Casebuilder data not found' });
});

app.get('/api/v1/actors', (req, res) => {
  const data = getCasebuilderData();
  if (data && data.actor_matrix) {
    return res.json({ case_id: data.case_id, total: data.total_actors, actors: data.actor_matrix });
  }
  res.status(404).json({ error: 'Actor matrix not found' });
});

app.get('/api/v1/timeline', (req, res) => {
  const data = getCasebuilderData();
  if (data && data.master_timeline) {
    return res.json({ case_id: data.case_id, total: data.total_timeline_events, timeline: data.master_timeline });
  }
  res.json({
    case_id: '1FDV-23-0001009',
    key_dates: [
      { date: '2023-05-31', event: 'Original Ex Parte TRO Issued' },
      { date: '2023-06-30', event: 'Original TRO Lapsed by Operation of Law' },
      { date: '2024-10-03', event: 'HPD Report WEBU350142 (3 versions)' },
      { date: '2024-10-07', event: 'CSEA 13-Hour Notice Mailed (9:57 PM)' },
      { date: '2024-10-08', event: '$3,500/Month Support Order Issued' },
      { date: '2026-08-07', event: 'Federal RICO Complaint Certified' }
    ],
    status: 'active_litigation'
  });
});

app.get('/api/v1/violations', (req, res) => {
  const data = getCasebuilderData();
  if (data && data.violations_matrix) {
    return res.json({ case_id: data.case_id, total: data.total_statutory_violations, violations: data.violations_matrix });
  }
  res.status(404).json({ error: 'Violations matrix not found' });
});

// ==================== WEBSOCKET ====================

wss.on('connection', (ws) => {
  console.log('Client connected to Legal Powerhouse');
  
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to Legal Powerhouse',
    tagline: 'The relentless pursuit of truth',
    services: ['colossus', 'fiat-justitia', 'tower-of-babel', 'monolith']
  }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      
      switch (msg.type) {
        case 'status':
          ws.send(JSON.stringify({
            type: 'status',
            data: {
              case: '1FDV-23-0001009',
              status: 'active',
              readiness: '87%'
            }
          }));
          break;
        case 'agents':
          ws.send(JSON.stringify({
            type: 'agents',
            data: agents.agents
          }));
          break;
        case 'documents':
          ws.send(JSON.stringify({
            type: 'documents',
            data: documents.categories
          }));
          break;
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', message: e.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// ==================== START ====================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║           LEGAL POWERHOUSE v1.0.0                        ║
║           "The relentless pursuit of truth"              ║
║                                                          ║
║  Case: 1FDV-23-0001009                                   ║
║  Matter: Kekoa Barton - Hawaii Family Court              ║
║                                                          ║
║  Components:                                             ║
║    • Colossus Gateway (Keymaster + Gatekeeper)           ║
║    • Fiat Justitia (Legal document engineering)          ║
║    • Tower of Babel (Technology floors)                  ║
║    • Monolith (Library mapping)                          ║
║                                                          ║
║  HTTP:  http://localhost:${PORT}                           ║
║  WS:    ws://localhost:${PORT}/ws                          ║
║                                                          ║
║  Fiat justitia ruat caelum.                              ║
╚══════════════════════════════════════════════════════════╝
  `);
});

module.exports = { app, server };
