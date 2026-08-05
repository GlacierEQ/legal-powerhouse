import { v4 as uuidv4 } from 'uuid';

export class DecisionEngine {
  constructor() {
    this.decisions = new Map();
    this.recommendations = new Map();
    this.caseId = '1FDV-23-0001009';
    
    this.initializeDecisionMatrix();
  }

  initializeDecisionMatrix() {
    this.decisionMatrix = {
      EMERGENCY: {
        childSafety: {
          primary: 'IMMEDIATE ACTION',
          steps: ['Contact authorities', 'Document everything', 'File emergency motion', 'Notify operator'],
          priority: 1
        },
        evidenceDestruction: {
          primary: 'SECURE EVIDENCE',
          steps: ['Create backup copies', 'Hash all files', 'Document chain of custody', 'File preservation motion'],
          priority: 1
        },
        courtOrderViolation: {
          primary: 'DOCUMENT VIOLATION',
          steps: ['Record all details', 'Gather witness statements', 'Prepare contempt motion', 'File with court'],
          priority: 1
        }
      },
      FILING: {
        emergency: {
          primary: 'FILE IMMEDIATELY',
          steps: ['Final review', 'Electronic filing', 'Service of process', 'Monitor for response'],
          priority: 1
        },
        response: {
          primary: 'CHECK DEADLINE',
          steps: ['Review filing', 'Check deadline', 'Prepare response', 'File timely'],
          priority: 2
        },
        motion: {
          primary: 'SEQUENCE PROPERLY',
          steps: ['Check dependencies', 'Prepare exhibits', 'Draft motion', 'File in order'],
          priority: 2
        }
      },
      STRATEGIC: {
        settlement: {
          primary: 'EVALUATE TERMS',
          steps: ['Review terms', 'Assess risks', 'Calculate value', 'Decide on acceptance'],
          priority: 3
        },
        publicity: {
          primary: 'WEIGH RISKS',
          steps: ['Assess benefits', 'Evaluate risks', 'Prepare statement', 'Execute if beneficial'],
          priority: 3
        },
        alliance: {
          primary: 'CONSIDER IMPLICATIONS',
          steps: ['Evaluate ally', 'Assess benefits', 'Consider risks', 'Form if advantageous'],
          priority: 3
        }
      }
    };
  }

  async analyzeSituation(situation) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    const analysis = {
      id,
      timestamp,
      caseId: this.caseId,
      situation,
      category: this.categorizeSituation(situation),
      urgency: this.assessUrgency(situation),
      impact: this.assessImpact(situation),
      recommendations: await this.generateRecommendations(situation),
      actionItems: this.generateActionItems(situation),
      deadlines: this.identifyDeadlines(situation),
      risks: this.assessRisks(situation)
    };

    this.decisions.set(id, analysis);
    return analysis;
  }

  categorizeSituation(situation) {
    const text = (situation.description || '').toLowerCase();
    
    if (text.includes('child safety') || text.includes('child danger')) return 'EMERGENCY';
    if (text.includes('evidence destruction') || text.includes('evidence tampering')) return 'EMERGENCY';
    if (text.includes('court order violation')) return 'EMERGENCY';
    
    if (text.includes('filing') || text.includes('motion') || text.includes('deadline')) return 'FILING';
    if (text.includes('hearing') || text.includes('trial')) return 'FILING';
    
    if (text.includes('settlement') || text.includes('negotiation')) return 'STRATEGIC';
    if (text.includes('publicity') || text.includes('media')) return 'STRATEGIC';
    
    return 'ROUTINE';
  }

  assessUrgency(situation) {
    const text = (situation.description || '').toLowerCase();
    
    if (text.includes('immediate') || text.includes('urgent') || text.includes('emergency')) return 'CRITICAL';
    if (text.includes('deadline') || text.includes('today') || text.includes('tomorrow')) return 'HIGH';
    if (text.includes('this week') || text.includes('soon')) return 'MEDIUM';
    
    return 'LOW';
  }

  assessImpact(situation) {
    const text = (situation.description || '').toLowerCase();
    
    if (text.includes('child safety') || text.includes('custody')) return 'CRITICAL';
    if (text.includes('case outcome') || text.includes('damages')) return 'HIGH';
    if (text.includes('procedure') || text.includes('deadline')) return 'MEDIUM';
    
    return 'LOW';
  }

  async generateRecommendations(situation) {
    const category = this.categorizeSituation(situation);
    const urgency = this.assessUrgency(situation);
    
    const recommendations = [];
    
    // Get base recommendations from matrix
    const matrixEntry = this.decisionMatrix[category];
    if (matrixEntry) {
      const subcategory = this.determineSubcategory(situation, category);
      const entry = matrixEntry[subcategory];
      
      if (entry) {
        recommendations.push({
          type: 'PRIMARY',
          action: entry.primary,
          steps: entry.steps,
          priority: entry.priority
        });
      }
    }
    
    // Add context-specific recommendations
    if (urgency === 'CRITICAL') {
      recommendations.push({
        type: 'URGENT',
        action: 'NOTIFY OPERATOR IMMEDIATELY',
        steps: ['Contact operator', 'Provide situation brief', 'Await instructions'],
        priority: 0
      });
    }
    
    // Add backup recommendations
    recommendations.push({
      type: 'BACKUP',
      action: 'PREPARE ALTERNATIVE APPROACH',
      steps: ['Identify alternatives', 'Prepare contingencies', 'Document decision rationale'],
      priority: 4
    });
    
    return recommendations;
  }

  determineSubcategory(situation, category) {
    const text = (situation.description || '').toLowerCase();
    
    switch (category) {
      case 'EMERGENCY':
        if (text.includes('child safety')) return 'childSafety';
        if (text.includes('evidence destruction')) return 'evidenceDestruction';
        if (text.includes('court order')) return 'courtOrderViolation';
        return 'childSafety';
      
      case 'FILING':
        if (text.includes('emergency')) return 'emergency';
        if (text.includes('response')) return 'response';
        if (text.includes('motion')) return 'motion';
        return 'motion';
      
      case 'STRATEGIC':
        if (text.includes('settlement')) return 'settlement';
        if (text.includes('publicity')) return 'publicity';
        if (text.includes('alliance')) return 'alliance';
        return 'settlement';
      
      default:
        return 'motion';
    }
  }

  generateActionItems(situation) {
    const category = this.categorizeSituation(situation);
    const urgency = this.assessUrgency(situation);
    
    const items = [];
    
    // Immediate actions
    if (urgency === 'CRITICAL') {
      items.push({
        action: 'Document situation immediately',
        deadline: 'NOW',
        priority: 'CRITICAL'
      });
      items.push({
        action: 'Notify operator',
        deadline: 'NOW',
        priority: 'CRITICAL'
      });
    }
    
    // Category-specific actions
    switch (category) {
      case 'EMERGENCY':
        items.push({
          action: 'File emergency motion',
          deadline: 'Within 24 hours',
          priority: 'HIGH'
        });
        break;
      
      case 'FILING':
        items.push({
          action: 'Prepare filing documents',
          deadline: 'Before deadline',
          priority: 'HIGH'
        });
        items.push({
          action: 'File with court',
          deadline: 'By deadline',
          priority: 'HIGH'
        });
        break;
      
      case 'STRATEGIC':
        items.push({
          action: 'Analyze options',
          deadline: 'Within 1 week',
          priority: 'MEDIUM'
        });
        items.push({
          action: 'Make decision',
          deadline: 'Within 2 weeks',
          priority: 'MEDIUM'
        });
        break;
    }
    
    return items;
  }

  identifyDeadlines(situation) {
    const deadlines = [];
    const text = (situation.description || '').toLowerCase();
    
    // Check for explicit deadlines
    if (text.includes('deadline')) {
      deadlines.push({
        type: 'FILING_DEADLINE',
        description: 'Filing deadline approaching',
        urgency: 'HIGH'
      });
    }
    
    if (text.includes('hearing')) {
      deadlines.push({
        type: 'HEARING_DATE',
        description: 'Hearing preparation required',
        urgency: 'HIGH'
      });
    }
    
    return deadlines;
  }

  assessRisks(situation) {
    const risks = [];
    const category = this.categorizeSituation(situation);
    
    if (category === 'EMERGENCY') {
      risks.push({
        type: 'CHILD_SAFETY',
        level: 'CRITICAL',
        mitigation: 'Immediate action required'
      });
    }
    
    if (category === 'FILING') {
      risks.push({
        type: 'DEADLINE_MISS',
        level: 'HIGH',
        mitigation: 'Calendar all deadlines'
      });
    }
    
    return risks;
  }

  async getRecommendations(query) {
    const decisions = Array.from(this.decisions.values());
    
    // Find relevant decisions
    const relevant = decisions.filter(d => 
      d.situation.description?.toLowerCase().includes(query.toLowerCase())
    );
    
    // Aggregate recommendations
    const recommendations = [];
    relevant.forEach(d => {
      d.recommendations.forEach(r => {
        if (!recommendations.find(rec => rec.action === r.action)) {
          recommendations.push(r);
        }
      });
    });
    
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  async getPendingDecisions() {
    const decisions = Array.from(this.decisions.values());
    
    return decisions
      .filter(d => d.status !== 'COMPLETED')
      .sort((a, b) => {
        const urgencyOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      });
  }

  async logDecision(decisionId, decision, outcome) {
    const decisionRecord = this.decisions.get(decisionId);
    
    if (decisionRecord) {
      decisionRecord.decision = decision;
      decisionRecord.outcome = outcome;
      decisionRecord.decidedAt = new Date().toISOString();
      decisionRecord.status = 'COMPLETED';
      
      this.decisions.set(decisionId, decisionRecord);
    }
    
    return decisionRecord;
  }

  async getDecisionHistory() {
    return Array.from(this.decisions.values())
      .filter(d => d.status === 'COMPLETED')
      .sort((a, b) => new Date(b.decidedAt) - new Date(a.decidedAt));
  }

  async getStats() {
    const decisions = Array.from(this.decisions.values());
    
    return {
      total: decisions.length,
      pending: decisions.filter(d => d.status !== 'COMPLETED').length,
      completed: decisions.filter(d => d.status === 'COMPLETED').length,
      byCategory: this.groupByCategory(decisions),
      byUrgency: this.groupByUrgency(decisions)
    };
  }

  groupByCategory(decisions) {
    return decisions.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {});
  }

  groupByUrgency(decisions) {
    return decisions.reduce((acc, d) => {
      acc[d.urgency] = (acc[d.urgency] || 0) + 1;
      return acc;
    }, {});
  }

  getStatus() {
    return {
      totalDecisions: this.decisions.size,
      pendingDecisions: Array.from(this.decisions.values()).filter(d => d.status !== 'COMPLETED').length
    };
  }
}
