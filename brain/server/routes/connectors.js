import express from 'express';
const router = express.Router();

// Get all connectors status
router.get('/', async (req, res) => {
  try {
    const { connectorHub } = req.app.locals;
    const status = await connectorHub.getAllStatus();
    res.json({ connectors: status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific connector status
router.get('/:name', async (req, res) => {
  try {
    const { connectorHub } = req.app.locals;
    const connector = connectorHub.getConnector(req.params.name);
    
    if (!connector) {
      return res.status(404).json({ error: 'Connector not found' });
    }
    
    res.json({
      name: req.params.name,
      status: connectorHub.status.get(req.params.name),
      config: connectorHub.sanitizeConfig(connector)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test connector
router.post('/:name/test', async (req, res) => {
  try {
    const { connectorHub } = req.app.locals;
    const result = await connectorHub.testConnector(req.params.name);
    res.json({ connected: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute connector operation
router.post('/:name/execute', async (req, res) => {
  try {
    const { connectorHub } = req.app.locals;
    const { operation, params } = req.body;
    
    const connector = connectorHub.getConnector(req.params.name);
    if (!connector) {
      return res.status(404).json({ error: 'Connector not found' });
    }
    
    // Execute operation based on connector type
    let result;
    switch (req.params.name) {
      case 'notion':
        result = await executeNotionOperation(connector, operation, params);
        break;
      case 'github':
        result = await executeGitHubOperation(connector, operation, params);
        break;
      case 'mem0':
        result = await executeMem0Operation(connector, operation, params);
        break;
      default:
        result = { message: 'Operation not implemented' };
    }
    
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notion operations
async function executeNotionOperation(connector, operation, params) {
  const axios = (await import('axios')).default;
  
  const headers = {
    'Authorization': `Bearer ${connector.token}`,
    'Notion-Version': connector.version,
    'Content-Type': 'application/json'
  };
  
  switch (operation) {
    case 'query_database':
      const response = await axios.post(
        `${connector.baseUrl}/databases/${params.databaseId}/query`,
        params.filter || {},
        { headers }
      );
      return response.data;
    
    case 'get_page':
      const pageResponse = await axios.get(
        `${connector.baseUrl}/pages/${params.pageId}`,
        { headers }
      );
      return pageResponse.data;
    
    case 'create_page':
      const createResponse = await axios.post(
        `${connector.baseUrl}/pages`,
        params.page,
        { headers }
      );
      return createResponse.data;
    
    default:
      return { error: 'Unknown operation' };
  }
}

// GitHub operations
async function executeGitHubOperation(connector, operation, params) {
  const axios = (await import('axios')).default;
  
  const headers = {
    'Authorization': `Bearer ${connector.token}`,
    'Accept': 'application/vnd.github.v3+json'
  };
  
  switch (operation) {
    case 'get_repo':
      const repoResponse = await axios.get(
        `${connector.baseUrl}/repos/${connector.repo}`,
        { headers }
      );
      return repoResponse.data;
    
    case 'list_files':
      const filesResponse = await axios.get(
        `${connector.baseUrl}/repos/${connector.repo}/contents/${params.path || ''}`,
        { headers }
      );
      return filesResponse.data;
    
    case 'get_file':
      const fileResponse = await axios.get(
        `${connector.baseUrl}/repos/${connector.repo}/contents/${params.path}`,
        { headers }
      );
      return fileResponse.data;
    
    default:
      return { error: 'Unknown operation' };
  }
}

// Mem0 operations
async function executeMem0Operation(connector, operation, params) {
  const axios = (await import('axios')).default;
  
  const headers = {
    'Authorization': `Token ${connector.token}`,
    'Content-Type': 'application/json'
  };
  
  switch (operation) {
    case 'search':
      const searchResponse = await axios.post(
        `${connector.baseUrl}/memories/search/`,
        {
          query: params.query,
          user_id: connector.userId,
          limit: params.limit || 10
        },
        { headers }
      );
      return searchResponse.data;
    
    case 'get_all':
      const allResponse = await axios.get(
        `${connector.baseUrl}/memories/`,
        {
          headers,
          params: { user_id: connector.userId }
        }
      );
      return allResponse.data;
    
    default:
      return { error: 'Unknown operation' };
  }
}

export default router;
