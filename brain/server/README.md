# CaseBrain Connector Hub Server
## Unified Case Intelligence System for 1FDV-23-0001009

---

## QUICK START

```bash
# Install dependencies
cd /root/quantum_nexus/brain/server
npm install

# Start server
npm start

# Access dashboard
http://localhost:3001/dashboard
```

---

## ARCHITECTURE

```
CASEBRAIN CONNECTOR HUB
├── Express Server (Port 3001)
│   ├── REST API
│   ├── WebSocket (Real-time)
│   └── Dashboard
├── Connectors
│   ├── Notion (Case Brain)
│   ├── GitHub (Evidence)
│   ├── CourtListener (Legal)
│   ├── Mem0 (Memory)
│   ├── Pinecone (Vectors)
│   ├── Supabase (Database)
│   ├── Linear (Tasks)
│   └── Tasklet (Webhooks)
├── Services
│   ├── MemoryEngine
│   ├── TimelineTracker
│   ├── ThreatMonitor
│   └── DecisionEngine
└── Dashboard
    ├── Status Overview
    ├── Timeline View
    ├── Threat Assessment
    └── Motion Status
```

---

## API ENDPOINTS

### Connectors
- `GET /api/connectors` - List all connectors
- `GET /api/connectors/:name` - Get connector status
- `POST /api/connectors/:name/test` - Test connector
- `POST /api/connectors/:name/execute` - Execute operation

### Memory
- `POST /api/memory` - Store memory
- `POST /api/memory/search` - Search memories
- `POST /api/memory/context` - Get context
- `GET /api/memory/stats` - Get stats

### Timeline
- `GET /api/timeline` - Get timeline
- `POST /api/timeline/events` - Add event
- `GET /api/timeline/deadlines` - Get deadlines
- `GET /api/timeline/custody-countdown` - Get countdown
- `GET /api/timeline/flip-cascade` - Get flip status
- `GET /api/timeline/motions` - Get motion status

### Threats
- `GET /api/threats` - Get threat level
- `POST /api/threats/detect` - Detect threat
- `GET /api/threats/recent` - Get recent threats
- `GET /api/threats/alerts` - Get alerts

### Decisions
- `POST /api/decisions/analyze` - Analyze situation
- `POST /api/decisions/recommendations` - Get recommendations
- `GET /api/decisions/pending` - Get pending decisions

### Evidence
- `POST /api/evidence` - Store evidence
- `POST /api/evidence/search` - Search evidence
- `GET /api/evidence/smoking-guns/all` - Get smoking guns

---

## WEBSOCKET EVENTS

### Subscribe
- `SUBSCRIBE_TIMELINE` - Subscribe to timeline updates
- `SUBSCRIBE_THREATS` - Subscribe to threat updates
- `SUBSCRIBE_DECISIONS` - Subscribe to decision updates

### Actions
- `GET_CONTEXT` - Get context for query
- `STORE_MEMORY` - Store new memory

---

## CONNECTORS

### Notion
- **Purpose:** Case brain, databases
- **Databases:** Actor x Crime Matrix, RICO Timeline, §1983 Registry, Damages, Discovery

### GitHub
- **Purpose:** Evidence repository
- **Repo:** GlacierEQ/1FDV-23-0001009-FEDERAL-WARFARE

### CourtListener
- **Purpose:** Legal research
- **API:** Dockets, opinions, people, citations

### Mem0
- **Purpose:** Memory storage
- **Features:** Semantic search, categorization

### Pinecone
- **Purpose:** Vector search
- **Features:** Embeddings, similarity search

### Supabase
- **Purpose:** Database
- **Features:** Real-time, edge functions

### Linear
- **Purpose:** Task management
- **Features:** Issues, projects, cycles

### Tasklet
- **Purpose:** Webhooks
- **Features:** Event notifications

---

## DASHBOARD

Access the dashboard at `http://localhost:3001/dashboard`

Features:
- System status overview
- Custody countdown
- Threat assessment
- Connector status
- Motion status
- Flip cascade progress
- Recent timeline

---

## ENVIRONMENT VARIABLES

```bash
# Notion
NOTION_API_KEY=ntn_...

# GitHub
GITHUB_TOKEN=ghp_...

# CourtListener
COURTLISTENER_API_KEY=...

# Mem0
MEM0_API_KEY=m0-...

# Pinecone
PINECONE_API_KEY=pcsk_...

# Supabase
SUPABASE_URL=https://...
SUPABASE_API_KEY=...
SUPABASE_SECRET=sba_...

# Linear
LINEAR_API_KEY=lin_...

# Tasklet
TASKLET_WEBHOOK=https://...
```

---

## DEVELOPMENT

```bash
# Run in development mode
npm run dev

# Run tests
npm test
```

---

## STATUS

✅ Server Architecture: Complete
✅ Connectors: 8 configured
✅ Dashboard: Ready
✅ API: Endpoints defined
✅ WebSocket: Real-time updates
⏳ Deployment: Pending
⏳ Testing: Pending
