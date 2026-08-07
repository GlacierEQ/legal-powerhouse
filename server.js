/**
 * Legal Powerhouse — governed legal-engineering surface.
 *
 * Runtime rule: this service may expose architecture and checked-in registries,
 * but it must not manufacture or hard-code live legal facts. Case posture,
 * filings, evidence counts, deadlines, and readiness require a verified source
 * projection before they may be returned as current truth.
 */

const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const brainRoutes = require('./routes/brain');
const contextRoutes = require('./routes/context');
const agentRoutes = require('./routes/agents');
const agents = require('./shared/config/agents.json');
const documents = require('./shared/config/documents.json');

app.use('/api/brain', brainRoutes);
app.use('/api', contextRoutes);
app.use('/api/agents', agentRoutes);

const truthBoundary = {
  status: 'source_required',
  verified: false,
  message:
    'Live legal posture is not embedded in this public runtime. Read from the governed case/evidence projection before asserting current facts.',
  canonical_sources: [
    'GlacierEQ/SUPERLUMINAL_CASE_MATRIX',
    'GlacierEQ/CASE-1FDV-23-0001009',
    'APEX Legal War Room / verified docket and evidence databases'
  ]
};

app.get('/api/status', (_req, res) => {
  res.json({
    name: 'Legal Powerhouse',
    version: '1.0.0',
    role: 'legal-engineering orchestration surface',
    runtime: 'active',
    legal_truth: truthBoundary,
    components: {
      monolith: { status: 'mapped', description: 'Library mapping and ecosystem navigation' },
      casebrain: { status: 'external_authority', description: 'Evidence-first legal truth layer' },
      document_engineering: { status: 'registry_available', description: 'Templates and controlled drafting capabilities' }
    },
    uptime_seconds: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/agents', (_req, res) => res.json(agents));

app.get('/api/agents/:tier', (req, res) => {
  const tier = req.params.tier;
  const values = agents.agents ? Object.values(agents.agents) : [];
  res.json({ agents: values.filter((agent) => agent.tier === tier), tier });
});

app.get('/api/pistons', (_req, res) => res.json(agents.pistons || []));
app.get('/api/documents', (_req, res) => res.json(documents));

app.get('/api/documents/:category', (req, res) => {
  const category = documents.categories && documents.categories[req.params.category];
  if (!category) return res.status(404).json({ error: 'Category not found' });
  return res.json({ ...category, category: req.params.category });
});

app.get('/api/repositories', (_req, res) => {
  res.json(documents.repositories || []);
});

app.get('/api/monolith/spine', (_req, res) => {
  res.json({
    status: 'mapped',
    authority: 'GlacierEQ/monolith',
    legal_counterpart: 'GlacierEQ/legal-powerhouse',
    legal_truth_authority: 'GlacierEQ/SUPERLUMINAL_CASE_MATRIX',
    note: 'Repository counts and case posture must be loaded from current canonical projections.'
  });
});

app.get('/api/evidence', (_req, res) => {
  res.status(503).json({
    error: 'verified_projection_required',
    ...truthBoundary
  });
});

app.get('/api/timeline', (_req, res) => {
  res.status(503).json({
    error: 'verified_projection_required',
    ...truthBoundary
  });
});

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'welcome',
    service: 'Legal Powerhouse',
    legal_truth: truthBoundary
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (message.type === 'agents') {
        ws.send(JSON.stringify({ type: 'agents', data: agents.agents || {} }));
        return;
      }
      if (message.type === 'documents') {
        ws.send(JSON.stringify({ type: 'documents', data: documents.categories || {} }));
        return;
      }
      ws.send(JSON.stringify({
        type: 'status',
        data: { runtime: 'active', legal_truth: truthBoundary }
      }));
    } catch (_error) {
      ws.send(JSON.stringify({ type: 'error', message: 'invalid_request' }));
    }
  });
});

const PORT = Number(process.env.PORT || 3000);
server.listen(PORT, () => {
  console.log(`Legal Powerhouse listening on http://localhost:${PORT}`);
});

module.exports = { app, server, truthBoundary };
