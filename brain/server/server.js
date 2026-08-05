import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes
import connectorRoutes from './routes/connectors.js';
import memoryRoutes from './routes/memory.js';
import timelineRoutes from './routes/timeline.js';
import threatRoutes from './routes/threats.js';
import decisionRoutes from './routes/decisions.js';
import evidenceRoutes from './routes/evidence.js';

// Import services
import { ConnectorHub } from './connectors/hub.js';
import { MemoryEngine } from './utils/memory.js';
import { TimelineTracker } from './utils/timeline.js';
import { ThreatMonitor } from './utils/threats.js';
import { DecisionEngine } from './utils/decisions.js';

// Create Express app
const app = express();
const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server, path: '/ws' });

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/static', express.static(join(__dirname, 'public')));

// Initialize services
const connectorHub = new ConnectorHub();
const memoryEngine = new MemoryEngine();
const timelineTracker = new TimelineTracker();
const threatMonitor = new ThreatMonitor();
const decisionEngine = new DecisionEngine();

// Make services available to routes
app.locals.connectorHub = connectorHub;
app.locals.memoryEngine = memoryEngine;
app.locals.timelineTracker = timelineTracker;
app.locals.threatMonitor = threatMonitor;
app.locals.decisionEngine = decisionEngine;

// Routes
app.use('/api/connectors', connectorRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/evidence', evidenceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      connectors: connectorHub.getStatus(),
      memory: memoryEngine.getStatus(),
      timeline: timelineTracker.getStatus(),
      threats: threatMonitor.getStatus(),
      decisions: decisionEngine.getStatus()
    }
  });
});

// Status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const status = {
      case: '1FDV-23-0001009',
      mission: 'BRING KEKOA HOME',
      timestamp: new Date().toISOString(),
      connectors: await connectorHub.getAllStatus(),
      memory: await memoryEngine.getStats(),
      timeline: await timelineTracker.getTimelineStats(),
      threats: await threatMonitor.getThreatLevel(),
      decisions: await decisionEngine.getPendingDecisions()
    };
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'dashboard.html'));
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const response = await handleWebSocketMessage(data);
      ws.send(JSON.stringify(response));
    } catch (error) {
      ws.send(JSON.stringify({ error: error.message }));
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// WebSocket message handler
async function handleWebSocketMessage(data) {
  const { type, payload } = data;
  
  switch (type) {
    case 'SUBSCRIBE_TIMELINE':
      return { type: 'TIMELINE_SUBSCRIBED', payload: await timelineTracker.getTimeline() };
    
    case 'SUBSCRIBE_THREATS':
      return { type: 'THREATS_SUBSCRIBED', payload: await threatMonitor.getThreatLevel() };
    
    case 'SUBSCRIBE_DECISIONS':
      return { type: 'DECISIONS_SUBSCRIBED', payload: await decisionEngine.getPendingDecisions() };
    
    case 'GET_CONTEXT':
      return { type: 'CONTEXT', payload: await memoryEngine.getContext(payload.query) };
    
    case 'STORE_MEMORY':
      await memoryEngine.store(payload);
      return { type: 'MEMORY_STORED', payload: { success: true } };
    
    default:
      return { type: 'ERROR', payload: { message: 'Unknown message type' } };
  }
}

// Broadcast to all connected clients
function broadcast(type, payload) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type, payload }));
    }
  });
}

// Make broadcast available
app.locals.broadcast = broadcast;

// Initialize connectors
async function initializeConnectors() {
  try {
    await connectorHub.initialize();
    console.log('Connectors initialized');
  } catch (error) {
    console.error('Connector initialization error:', error);
  }
}

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
  console.log(`CaseBrain Connector Hub running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`API: http://localhost:${PORT}/api/status`);
  console.log(`WebSocket: ws://localhost:${PORT}/ws`);
  
  await initializeConnectors();
});

export { app, server, wss, broadcast };
