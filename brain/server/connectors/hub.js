import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export class ConnectorHub {
  constructor() {
    this.connectors = new Map();
    this.status = new Map();
    this.healthChecks = new Map();
  }

  async initialize() {
    // Initialize all connectors
    await this.initializeNotion();
    await this.initializeGitHub();
    await this.initializeCourtListener();
    await this.initializeMem0();
    await this.initializePinecone();
    await this.initializeSupabase();
    await this.initializeLinear();
    await this.initializeTasklet();
    
    console.log('All connectors initialized');
  }

  async initializeNotion() {
    const connector = {
      name: 'notion',
      token: process.env.NOTION_API_KEY,
      baseUrl: 'https://api.notion.com/v1',
      version: '2022-06-28',
      databases: {
        actorCrimeMatrix: 'f28c3e00caf84bb8943fe23dd5d71283',
        ricoTimeline: '6448c81ace75445c8bdb44c096d0893e',
        section1983: '22825d13616b440c94df49a61cd5338b',
        damages: '8e9e03de31a54e9fbc04ae22f9237e36',
        discovery: 'ca8827a14e87471aa88992acf54ea442'
      }
    };

    this.connectors.set('notion', connector);
    await this.testConnector('notion');
  }

  async initializeGitHub() {
    const connector = {
      name: 'github',
      token: process.env.GITHUB_TOKEN,
      baseUrl: 'https://api.github.com',
      repo: 'GlacierEQ/1FDV-23-0001009-FEDERAL-WARFARE'
    };

    this.connectors.set('github', connector);
    await this.testConnector('github');
  }

  async initializeCourtListener() {
    const connector = {
      name: 'courtlistener',
      token: process.env.COURTLISTENER_API_KEY || '27cb3521fc97253116933795c20d3987b11865e9',
      baseUrl: 'https://www.courtlistener.com/api/rest/v4'
    };

    this.connectors.set('courtlistener', connector);
    await this.testConnector('courtlistener');
  }

  async initializeMem0() {
    const connector = {
      name: 'mem0',
      token: process.env.MEM0_API_KEY || 'm0-CkabsxFjhaYf28gYSET3JWE34k3vw6oRBP5ZUm5H',
      baseUrl: 'https://api.mem0.ai/v1',
      userId: 'OPR-NS8-GE8-KC3-001-AI-GRS-GUID:983DE8C8-E120-1-B5A0-C6D8AF97BB09'
    };

    this.connectors.set('mem0', connector);
    await this.testConnector('mem0');
  }

  async initializePinecone() {
    const connector = {
      name: 'pinecone',
      apiKey: process.env.PINECONE_API_KEY,
      index: 'quantum-nexus'
    };

    this.connectors.set('pinecone', connector);
    await this.testConnector('pinecone');
  }

  async initializeSupabase() {
    const connector = {
      name: 'supabase',
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_API_KEY,
      secret: process.env.SUPABASE_SECRET || 'sba_d06c7d0c456713066cd1de58d32849b7a7098db7'
    };

    this.connectors.set('supabase', connector);
    await this.testConnector('supabase');
  }

  async initializeLinear() {
    const connector = {
      name: 'linear',
      apiKey: process.env.LINEAR_API_KEY,
      baseUrl: 'https://api.linear.app/graphql'
    };

    this.connectors.set('linear', connector);
    await this.testConnector('linear');
  }

  async initializeTasklet() {
    const connector = {
      name: 'tasklet',
      webhook: process.env.TASKLET_WEBHOOK
    };

    this.connectors.set('tasklet', connector);
    await this.testConnector('tasklet');
  }

  async testConnector(name) {
    const connector = this.connectors.get(name);
    if (!connector) {
      this.status.set(name, { connected: false, error: 'Connector not found' });
      return false;
    }

    try {
      let testResult = false;

      switch (name) {
        case 'notion':
          testResult = await this.testNotion(connector);
          break;
        case 'github':
          testResult = await this.testGitHub(connector);
          break;
        case 'courtlistener':
          testResult = await this.testCourtListener(connector);
          break;
        case 'mem0':
          testResult = await this.testMem0(connector);
          break;
        case 'supabase':
          testResult = await this.testSupabase(connector);
          break;
        case 'linear':
          testResult = await this.testLinear(connector);
          break;
        case 'tasklet':
          testResult = true; // Webhook doesn't need testing
          break;
        default:
          testResult = true;
      }

      this.status.set(name, { connected: testResult, lastCheck: new Date().toISOString() });
      return testResult;
    } catch (error) {
      this.status.set(name, { connected: false, error: error.message });
      return false;
    }
  }

  async testNotion(connector) {
    const response = await axios.get(`${connector.baseUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${connector.token}`,
        'Notion-Version': connector.version
      }
    });
    return response.status === 200;
  }

  async testGitHub(connector) {
    const response = await axios.get(`${connector.baseUrl}/user`, {
      headers: {
        'Authorization': `Bearer ${connector.token}`
      }
    });
    return response.status === 200;
  }

  async testCourtListener(connector) {
    const response = await axios.get(`${connector.baseUrl}/`, {
      headers: {
        'Authorization': `Token ${connector.token}`
      }
    });
    return response.status === 200;
  }

  async testMem0(connector) {
    const response = await axios.get(`${connector.baseUrl}/memories/`, {
      headers: {
        'Authorization': `Token ${connector.token}`
      }
    });
    return response.status === 200;
  }

  async testSupabase(connector) {
    const response = await axios.get(`${connector.url}/rest/v1/`, {
      headers: {
        'apikey': connector.key,
        'Authorization': `Bearer ${connector.key}`
      }
    });
    return response.status === 200;
  }

  async testLinear(connector) {
    const response = await axios.post(connector.baseUrl, 
      { query: '{ viewer { id name } }' },
      { headers: { 'Authorization': connector.apiKey } }
    );
    return response.status === 200;
  }

  getStatus() {
    const status = {};
    this.status.forEach((value, key) => {
      status[key] = value;
    });
    return status;
  }

  async getAllStatus() {
    const status = {};
    for (const [name, connector] of this.connectors) {
      status[name] = {
        ...this.status.get(name),
        config: this.sanitizeConfig(connector)
      };
    }
    return status;
  }

  sanitizeConfig(connector) {
    const sanitized = { ...connector };
    // Mask sensitive data
    if (sanitized.token) sanitized.token = sanitized.token.substring(0, 10) + '...';
    if (sanitized.apiKey) sanitized.apiKey = sanitized.apiKey.substring(0, 10) + '...';
    if (sanitized.secret) sanitized.secret = sanitized.secret.substring(0, 10) + '...';
    return sanitized;
  }

  getConnector(name) {
    return this.connectors.get(name);
  }

  async executeWithRetry(connectorName, operation, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${i + 1} failed for ${connectorName}:`, error.message);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    
    throw lastError;
  }
}
