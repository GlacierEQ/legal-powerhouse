import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export class MemoryEngine {
  constructor() {
    this.memories = new Map();
    this.categories = ['LEGAL', 'EVIDENCE', 'TIMELINE', 'PEOPLE', 'THREATS', 'DECISIONS'];
    this.stats = {
      total: 0,
      byCategory: {},
      lastOperation: null
    };
  }

  async store(memory) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    const enrichedMemory = {
      id,
      timestamp,
      caseId: '1FDV-23-0001009',
      ...memory,
      metadata: {
        ...memory.metadata,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    };

    // Store locally
    this.memories.set(id, enrichedMemory);
    
    // Update stats
    this.stats.total++;
    this.stats.byCategory[memory.category] = (this.stats.byCategory[memory.category] || 0) + 1;
    this.stats.lastOperation = { type: 'store', id, timestamp };

    // Store in Mem0
    await this.storeInMem0(enrichedMemory);
    
    // Store in Pinecone (vector)
    await this.storeInPinecone(enrichedMemory);
    
    // Store in Notion (if applicable)
    if (memory.category === 'EVIDENCE') {
      await this.storeInNotion(enrichedMemory);
    }

    return enrichedMemory;
  }

  async storeInMem0(memory) {
    try {
      const connector = this.getConnector('mem0');
      if (!connector) return;

      await axios.post(`${connector.baseUrl}/memories/`, {
        messages: [
          { role: 'user', content: `Store ${memory.category} memory` },
          { role: 'assistant', content: memory.content }
        ],
        user_id: connector.userId,
        metadata: {
          category: memory.category,
          case_id: memory.caseId,
          tags: memory.tags,
          importance: memory.importance,
          source: memory.source,
          ...memory.metadata
        }
      }, {
        headers: {
          'Authorization': `Token ${connector.token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Mem0 store error:', error.message);
    }
  }

  async storeInPinecone(memory) {
    try {
      const connector = this.getConnector('pinecone');
      if (!connector) return;

      // Generate embedding (simplified - would use actual embedding model)
      const embedding = await this.generateEmbedding(memory.content);
      
      await axios.post(`https://index-${connector.index}.svc.${connector.region}.pinecone.io/vectors/upsert`, {
        vectors: [{
          id: memory.id,
          values: embedding,
          metadata: {
            content: memory.content,
            category: memory.category,
            caseId: memory.caseId,
            tags: memory.tags?.join(','),
            importance: memory.importance,
            timestamp: memory.timestamp
          }
        }]
      }, {
        headers: {
          'Api-Key': connector.apiKey,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Pinecone store error:', error.message);
    }
  }

  async storeInNotion(memory) {
    try {
      const connector = this.getConnector('notion');
      if (!connector) return;

      const dbId = connector.databases.discovery;
      
      await axios.post(`${connector.baseUrl}/pages`, {
        parent: { database_id: dbId },
        properties: {
          'Name': {
            title: [{ text: { content: `${memory.category}: ${memory.id}` } }]
          },
          'Status': {
            select: { name: 'Active' }
          },
          'Priority': {
            select: { name: memory.importance || 'Medium' }
          }
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: memory.content } }]
            }
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${connector.token}`,
          'Notion-Version': connector.version,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Notion store error:', error.message);
    }
  }

  async search(query, options = {}) {
    const { categories, tags, limit = 10 } = options;
    
    // Search locally
    let results = Array.from(this.memories.values());
    
    // Filter by categories
    if (categories?.length) {
      results = results.filter(m => categories.includes(m.category));
    }
    
    // Filter by tags
    if (tags?.length) {
      results = results.filter(m => 
        tags.some(tag => m.tags?.includes(tag))
      );
    }
    
    // Simple text search (would use vector search in production)
    results = results.filter(m => 
      m.content.toLowerCase().includes(query.toLowerCase())
    );
    
    // Sort by importance and recency
    results.sort((a, b) => {
      const importanceOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      const aPriority = importanceOrder[a.importance] || 2;
      const bPriority = importanceOrder[b.importance] || 2;
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    return results.slice(0, limit);
  }

  async getContext(query) {
    const memories = await this.search(query, { limit: 20 });
    
    return {
      query,
      results: memories,
      summary: this.generateSummary(memories),
      recommendations: this.generateRecommendations(memories)
    };
  }

  generateSummary(memories) {
    if (memories.length === 0) return 'No relevant memories found.';
    
    const categories = [...new Set(memories.map(m => m.category))];
    const byCategory = {};
    
    categories.forEach(cat => {
      byCategory[cat] = memories.filter(m => m.category === cat).length;
    });
    
    return `Found ${memories.length} memories across ${categories.length} categories: ${Object.entries(byCategory).map(([k, v]) => `${k}(${v})`).join(', ')}`;
  }

  generateRecommendations(memories) {
    const recommendations = [];
    
    // Check for critical memories
    const critical = memories.filter(m => m.importance === 'CRITICAL');
    if (critical.length > 0) {
      recommendations.push({
        type: 'CRITICAL_MEMORY',
        message: `${critical.length} critical memories found - immediate attention required`,
        memories: critical.map(m => m.id)
      });
    }
    
    // Check for recent memories
    const recent = memories.filter(m => {
      const age = Date.now() - new Date(m.timestamp).getTime();
      return age < 24 * 60 * 60 * 1000; // Last 24 hours
    });
    
    if (recent.length > 0) {
      recommendations.push({
        type: 'RECENT_ACTIVITY',
        message: `${recent.length} memories added in last 24 hours`,
        memories: recent.map(m => m.id)
      });
    }
    
    return recommendations;
  }

  async generateEmbedding(text) {
    // Simplified embedding generation
    // In production, would use OpenAI, Cohere, or similar
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(1536).fill(0);
    
    words.forEach((word, i) => {
      const hash = this.simpleHash(word);
      embedding[hash % 1536] += 1;
    });
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  getConnector(name) {
    // Would get from connector hub
    return null;
  }

  getStatus() {
    return {
      total: this.stats.total,
      byCategory: this.stats.byCategory,
      lastOperation: this.stats.lastOperation
    };
  }

  async getStats() {
    return this.stats;
  }
}
