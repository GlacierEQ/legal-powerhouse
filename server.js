/**
 * LEGAL POWERHOUSE - Unified Entry Point
 *
 * Orchestration gateway for legal investigation and work product.
 * Factual authority remains with authenticated originals / operative official
 * records and the reviewed CASEBRAIN machine contract.
 */

const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: '.env.local' });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const Recruiter = require('./core/Level1_Recruiter');
const MasterOfTrade = require('./core/Level2_MasterOfTrade');
const Machine = require('./core/Level3_Machine');
const Mesh = require('./core/Level4_Mesh');

const agents = require('./shared/config/agents.json');
const documents = require('./shared/config/documents.json');
const canonicalAuthority = require('./shared/config/canonical-authority.json');
const internalInvestigator = require('./shared/config/internal-investigator.json');

const CASE_ID = canonicalAuthority.case_id;
const CANONICAL_MACHINE_CONTRACT = `${canonicalAuthority.canonical_machine_contract.repository}/${canonicalAuthority.canonical_machine_contract.path}`;
const INTERNAL_INVESTIGATOR_CONFIG_ID = internalInvestigator.config_id;

function validateAuthorityBinding() {
  const errors = [];

  if (documents.case_id !== canonicalAuthority.case_id) {
    errors.push(`case_id mismatch: documents=${documents.case_id} authority=${canonicalAuthority.case_id}`);
  }

  if (documents.authority_contract !== 'shared/config/canonical-authority.json') {
    errors.push(`unexpected authority_contract: ${documents.authority_contract}`);
  }

  if (documents.canonical_machine_contract !== CANONICAL_MACHINE_CONTRACT) {
    errors.push(`canonical_machine_contract mismatch: documents=${documents.canonical_machine_contract} authority=${CANONICAL_MACHINE_CONTRACT}`);
  }

  if (documents.orchestration_role !== 'gateway_not_evidence_store') {
    errors.push(`unexpected orchestration_role: ${documents.orchestration_role}`);
  }

  if (errors.length > 0) {
    throw new Error(`Canonical authority binding failed: ${errors.join('; ')}`);
  }
}

function validateInternalInvestigatorBinding() {
  const errors = [];
  const expectedCanonicalSource = 'GlacierEQ/SUPERLUMINAL_CASE_MATRIX/CASEBRAIN_V3/control-plane/INTERNAL_INVESTIGATOR_CONFIG.json';

  if (internalInvestigator.case_id !== CASE_ID) {
    errors.push(`case_id mismatch: investigator=${internalInvestigator.case_id} authority=${CASE_ID}`);
  }

  if (internalInvestigator.mode !== 'INVESTIGATOR') {
    errors.push(`unexpected mode: ${internalInvestigator.mode}`);
  }

  if (internalInvestigator.boot_required !== true) {
    errors.push('boot_required must be true');
  }

  if (internalInvestigator.canonical_source !== expectedCanonicalSource) {
    errors.push(`unexpected canonical_source: ${internalInvestigator.canonical_source}`);
  }

  if (!Array.isArray(internalInvestigator.boot_sequence) || internalInvestigator.boot_sequence.length < 5) {
    errors.push('boot_sequence is incomplete');
  }

  if (!Array.isArray(internalInvestigator.hard_fail_rules) || internalInvestigator.hard_fail_rules.length === 0) {
    errors.push('hard_fail_rules are missing');
  }

  if (errors.length > 0) {
    throw new Error(`Internal investigator binding failed: ${errors.join('; ')}`);
  }
}

validateAuthorityBinding();
validateInternalInvestigatorBinding();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const brainRoutes = require('./routes/brain');
app.use('/api/brain', brainRoutes);

const contextRoutes = require('./routes/context');
app.use('/api', contextRoutes);

const agentRoutes = require('./routes/agents');
app.use('/api/agents', agentRoutes);

function projectionBoundary(extra = {}) {
  return {
    case_id: CASE_ID,
    authority: 'UNVERIFIED_INTERNAL_PROJECTION',
    canonical_machine_contract: CANONICAL_MACHINE_CONTRACT,
    investigator_config_id: INTERNAL_INVESTIGATOR_CONFIG_ID,
    investigator_mode: internalInvestigator.mode,
    substantive_authority: 'AUTHENTICATED_ORIGINAL_OR_OPERATIVE_OFFICIAL_RECORD',
    promotion_state: 'BLOCKED_UNTIL_SOURCE_LINKED_AND_CONTRACT_VALIDATED',
    ...extra
  };
}

function requireExplicitUnverifiedProjection(req, res, next) {
  if (req.query.include_unverified !== 'true') {
    return res.status(409).json(projectionBoundary({
      error: 'Raw legacy casebuilder projection is not canonical evidence.',
      action: 'Set include_unverified=true only for bounded investigative review; do not treat returned content as filing-ready fact.'
    }));
  }
  next();
}

// ==================== STATUS / AUTHORITY ====================

app.get('/api/status', (req, res) => {
  res.json({
    name: 'Legal Powerhouse',
    version: '1.2.0-investigator-gated',
    case: CASE_ID,
    runtime_state: 'INVESTIGATOR_SOURCE_REQUIRED_FAIL_CLOSED',
    investigator: {
      mode: internalInvestigator.mode,
      config_id: INTERNAL_INVESTIGATOR_CONFIG_ID,
      boot_required: internalInvestigator.boot_required,
      canonical_source: internalInvestigator.canonical_source,
      primary_directive: internalInvestigator.primary_directive
    },
    authority: {
      canonical_machine_contract: CANONICAL_MACHINE_CONTRACT,
      estate_catalog: canonicalAuthority.estate_catalog,
      role: canonicalAuthority.legal_powerhouse_role,
      truth_classes: canonicalAuthority.truth_classes
    },
    components: {
      colossus: { status: 'configured', authority: 'none_for_case_facts' },
      fiat_justitia: { status: 'route_candidate', authority: 'work_product_and_research_only' },
      tower_of_babel: { status: 'route_candidate', authority: 'processing_only' },
      monolith: { status: 'catalog_bound', authority: 'cartography_only' },
      casebrain: { status: 'external_canonical_contract', authority: CANONICAL_MACHINE_CONTRACT },
      investigator_config: { status: 'validated_at_startup', authority: internalInvestigator.canonical_source }
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ==================== KEYMASTER ROUTES ====================

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

// ==================== FIAT JUSTITIA / REGISTRY ROUTES ====================

app.get('/api/documents', (req, res) => {
  res.json({
    ...documents,
    authority_binding: {
      status: 'validated_at_startup',
      contract: documents.authority_contract
    }
  });
});

app.get('/api/documents/:category', (req, res) => {
  const category = req.params.category;
  const docs = documents.categories[category];
  if (!docs) return res.status(404).json({ error: 'Category not found' });
  res.json({ category, ...docs, authority: 'WORK_PRODUCT_REGISTRY_ONLY' });
});

app.get('/api/repositories', (req, res) => {
  res.json({
    case_id: CASE_ID,
    exhaustive_catalog: canonicalAuthority.estate_catalog,
    high_value_mesh: canonicalAuthority.repository_mesh,
    rule: 'Repository presence, aliasing, backup lineage, or search match is not evidentiary corroboration.'
  });
});

// ==================== MONOLITH ROUTES ====================

app.get('/api/monolith/spine', (req, res) => {
  try {
    const estatePath = path.join(__dirname, 'brain', 'monolith_estate.json');
    if (fs.existsSync(estatePath)) {
      const estateData = JSON.parse(fs.readFileSync(estatePath, 'utf8'));
      return res.json({
        ...estateData,
        authority: 'CARTOGRAPHY_ONLY',
        canonical_catalog: canonicalAuthority.estate_catalog,
        truth_boundary: 'Monolith maps repository ownership and lineage; it does not own or authenticate evidence bytes.'
      });
    }

    res.status(404).json({
      case_id: CASE_ID,
      status: 'LOCAL_PROJECTION_NOT_PRESENT',
      canonical_catalog: canonicalAuthority.estate_catalog,
      authority: 'CARTOGRAPHY_ONLY'
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to read local Monolith projection: ${error.message}` });
  }
});

// ==================== EVIDENCE ROUTES ====================

app.get('/api/evidence', (req, res) => {
  res.status(409).json({
    case_id: CASE_ID,
    status: 'SOURCE_REQUIRED',
    authority: 'NO_HARD_CODED_EVIDENCE_COUNTS',
    source_planes: canonicalAuthority.planes,
    required_for_promotion: canonicalAuthority.required_proposition_fields,
    message: 'Evidence counts, authentication status, experts, exhibit readiness, and filing readiness must be computed from source-linked CASEBRAIN records and receipts; this runtime does not invent them.'
  });
});

// ==================== MASTER CASEBUILDER & ACTORS ROUTES ====================

function getCasebuilderData() {
  const casebuilderPath = path.join(__dirname, 'brain', 'CASE_1FDV-23-0001009_COMPLETE_CASEBUILDER.json');
  if (fs.existsSync(casebuilderPath)) {
    try {
      return JSON.parse(fs.readFileSync(casebuilderPath, 'utf8'));
    } catch (error) {
      console.error('Error reading casebuilder JSON:', error);
    }
  }
  return null;
}

const v1Auth = (req, res, next) => {
  const token = req.headers['x-api-key'] || req.query.token;
  if (!token || token !== process.env.LEGAL_POWERHOUSE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.use('/api/v1', v1Auth);

app.get('/api/v1/internal-config', (req, res) => {
  res.json({
    status: 'VALIDATED_AT_STARTUP',
    canonical_machine_contract: CANONICAL_MACHINE_CONTRACT,
    config: internalInvestigator
  });
});

app.get('/api/v1/casebuilder', requireExplicitUnverifiedProjection, (req, res) => {
  const data = getCasebuilderData();
  if (!data) return res.status(404).json({ error: 'Casebuilder projection not found' });
  return res.json(projectionBoundary({ data }));
});

app.post('/api/v1/omni-execute', async (req, res) => {
  try {
    const { objective, data, proof_class } = req.body;
    if (!objective || !data || !proof_class) {
      return res.status(400).json({ error: 'Missing required parameters: objective, data, proof_class' });
    }

    const recruiter = new Recruiter(agents);
    const squad = recruiter.recruitSquad(objective);

    const master = new MasterOfTrade();
    const tradeOutput = await master.executeDomainTask(squad, data);

    const machine = new Machine({
      proof_classes: documents.proof_classes,
      authority: canonicalAuthority
    });
    const verification = machine.verifyPipeline(tradeOutput, proof_class);

    if (!verification.verified) {
      return res.status(422).json({
        error: 'Canonical proposition gate failed',
        verification,
        investigator_config_id: INTERNAL_INVESTIGATOR_CONFIG_ID,
        truth_boundary: 'No promotion, filing-readiness claim, or external synchronization occurred.'
      });
    }

    const mesh = new Mesh();
    const syncResult = mesh.synchronize(verification, wss);

    res.json({
      status: 'CONTRACT_VALIDATED_LOCAL_ONLY',
      investigator_config_id: INTERNAL_INVESTIGATOR_CONFIG_ID,
      truth_boundary: verification.verification_boundary,
      pipeline: {
        recruiter: squad,
        master_of_trade: tradeOutput,
        machine: verification,
        mesh: syncResult
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/actors', requireExplicitUnverifiedProjection, (req, res) => {
  const data = getCasebuilderData();
  if (data && data.actor_matrix) {
    return res.json(projectionBoundary({
      total_reported_by_legacy_projection: data.total_actors,
      actors: data.actor_matrix
    }));
  }
  res.status(404).json({ error: 'Actor projection not found' });
});

app.get('/api/v1/timeline', requireExplicitUnverifiedProjection, (req, res) => {
  const data = getCasebuilderData();
  if (data && data.master_timeline) {
    return res.json(projectionBoundary({
      total_reported_by_legacy_projection: data.total_timeline_events,
      timeline: data.master_timeline
    }));
  }
  res.status(404).json({
    error: 'Timeline projection not found',
    truth_boundary: 'No fallback dates or legal conclusions are generated.'
  });
});

app.get('/api/v1/violations', requireExplicitUnverifiedProjection, (req, res) => {
  const data = getCasebuilderData();
  if (data && data.violations_matrix) {
    return res.json(projectionBoundary({
      total_reported_by_legacy_projection: data.total_statutory_violations,
      violations: data.violations_matrix
    }));
  }
  res.status(404).json({ error: 'Violations projection not found' });
});

// ==================== WEBSOCKET ====================

wss.on('connection', (ws) => {
  console.log('Client connected to Legal Powerhouse');

  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to Legal Powerhouse',
    case: CASE_ID,
    runtime_state: 'INVESTIGATOR_SOURCE_REQUIRED_FAIL_CLOSED',
    investigator_config_id: INTERNAL_INVESTIGATOR_CONFIG_ID,
    canonical_machine_contract: CANONICAL_MACHINE_CONTRACT
  }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      switch (msg.type) {
        case 'status':
          ws.send(JSON.stringify({
            type: 'status',
            data: {
              case: CASE_ID,
              status: 'investigator_source_required_fail_closed',
              readiness: null,
              investigator_config_id: INTERNAL_INVESTIGATOR_CONFIG_ID,
              canonical_machine_contract: CANONICAL_MACHINE_CONTRACT
            }
          }));
          break;
        case 'agents':
          ws.send(JSON.stringify({ type: 'agents', data: agents.agents }));
          break;
        case 'documents':
          ws.send(JSON.stringify({
            type: 'documents',
            authority: 'WORK_PRODUCT_REGISTRY_ONLY',
            data: documents.categories
          }));
          break;
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
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
LEGAL POWERHOUSE v1.2.0-investigator-gated
Case: ${CASE_ID}
Mode: ${internalInvestigator.mode}
Internal config: ${INTERNAL_INVESTIGATOR_CONFIG_ID}
Role: orchestration gateway; not an evidence store
Canonical machine contract: ${CANONICAL_MACHINE_CONTRACT}
Runtime: INVESTIGATOR_SOURCE_REQUIRED_FAIL_CLOSED
HTTP: http://localhost:${PORT}
WS: ws://localhost:${PORT}/ws
  `);
});

module.exports = { app, server, validateAuthorityBinding, validateInternalInvestigatorBinding };
