import { v4 as uuidv4 } from 'uuid';

export class ThreatMonitor {
  constructor() {
    this.threats = new Map();
    this.actors = new Map();
    this.patterns = new Map();
    this.alerts = new Map();
    this.caseId = '1FDV-23-0001009';
    
    this.initializeActors();
    this.initializePatterns();
  }

  initializeActors() {
    const actors = [
      {
        id: 'shaw',
        name: 'Judge Natasha R. Shaw',
        role: 'Primary Defendant',
        capability: 'HIGH',
        intent: 'HIGH',
        opportunity: 'HIGH',
        risk: 'CRITICAL',
        patterns: ['evidence_fraud', 'procedural_fraud', 'signature_fraud'],
        criminalExposure: '40-60+ years'
      },
      {
        id: 'naso',
        name: 'Judge Courtney N. Naso',
        role: 'CSEA Defendant',
        capability: 'MEDIUM',
        intent: 'MEDIUM',
        opportunity: 'HIGH',
        risk: 'HIGH',
        patterns: ['procedural_shortcut', 'notice_violation'],
        criminalExposure: '15-30 years'
      },
      {
        id: 'brower',
        name: 'Scot Stuart Brower',
        role: 'Attorney Defendant',
        capability: 'HIGH',
        intent: 'HIGH',
        opportunity: 'HIGH',
        risk: 'HIGH',
        patterns: ['coordinated_filing', 'conflict_concealment', 'billing_fraud'],
        criminalExposure: '10-20 years'
      },
      {
        id: 'yamatani',
        name: 'Judge Micky Yamatani',
        role: 'Conflict Defendant',
        capability: 'MEDIUM',
        intent: 'MEDIUM',
        opportunity: 'HIGH',
        risk: 'MEDIUM',
        patterns: ['conflict_concealment', 'coordination'],
        criminalExposure: '5-15 years'
      },
      {
        id: 'teresa',
        name: 'Teresa Del Carpio Barton',
        role: 'Respondent',
        capability: 'MEDIUM',
        intent: 'HIGH',
        opportunity: 'HIGH',
        risk: 'HIGH',
        patterns: ['financial_fraud', 'parenting_denial', 'evidence_suppression'],
        criminalExposure: '3-10 years'
      },
      {
        id: 'hpd',
        name: 'HPD Officer',
        role: 'Report Fabricator',
        capability: 'LOW',
        intent: 'MEDIUM',
        opportunity: 'MEDIUM',
        risk: 'MEDIUM',
        patterns: ['report_fabrication', 'false_statement'],
        criminalExposure: '5-15 years'
      }
    ];

    actors.forEach(actor => this.actors.set(actor.id, actor));
  }

  initializePatterns() {
    const patterns = [
      {
        id: 'evidence_fraud',
        name: 'Evidence Fraud',
        description: 'Using fabricated evidence in court',
        indicators: ['multiple_versions', 'timestamp_manipulation', 'retraction_ignored'],
        severity: 'CRITICAL',
        examples: ['HPD Report WEBU350142 (3 versions)']
      },
      {
        id: 'procedural_fraud',
        name: 'Procedural Fraud',
        description: 'Bypassing required procedures',
        indicators: ['signature_waived', '87_second_decree', 'no_judicial_review'],
        severity: 'CRITICAL',
        examples: ['TRO 515 (87-second decree)']
      },
      {
        id: 'financial_fraud',
        name: 'Financial Fraud',
        description: 'Inflating support orders',
        indicators: ['1393_percent_inflation', '60750_overpayment', 'false_income'],
        severity: 'HIGH',
        examples: ['CSEA $3,500/month order']
      },
      {
        id: 'coordinated_filing',
        name: 'Coordinated Filing',
        description: 'Attorney-court coordination',
        indicators: ['25_year_relationship', 'synchronized_filings', 'email_evidence'],
        severity: 'HIGH',
        examples: ['Brower-Yamatani emails']
      },
      {
        id: 'notice_violation',
        name: 'Notice Violation',
        description: 'Inadequate notice to parties',
        indicators: ['13_hour_notice', '957_pm_email', 'no_opportunity'],
        severity: 'HIGH',
        examples: ['CSEA hearing notice']
      },
      {
        id: 'parenting_denial',
        name: 'Parenting Time Denial',
        description: 'Systematic denial of parenting time',
        indicators: ['22_months_denial', 'all_requests_refused', 'calendar_cancellation'],
        severity: 'CRITICAL',
        examples: ['22-month parenting time denial log']
      }
    ];

    patterns.forEach(pattern => this.patterns.set(pattern.id, pattern));
  }

  async detectThreat(signal) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    const threat = {
      id,
      timestamp,
      caseId: this.caseId,
      ...signal,
      status: 'DETECTED',
      severity: this.assessSeverity(signal),
      actor: this.identifyActor(signal),
      pattern: this.matchPattern(signal),
      recommendedResponse: this.generateResponse(signal)
    };

    this.threats.set(id, threat);
    
    // Create alert if high severity
    if (threat.severity === 'CRITICAL' || threat.severity === 'HIGH') {
      await this.createAlert(threat);
    }

    return threat;
  }

  assessSeverity(signal) {
    // Assess based on type and context
    if (signal.type === 'CHILD_SAFETY') return 'CRITICAL';
    if (signal.type === 'EVIDENCE_DESTRUCTION') return 'CRITICAL';
    if (signal.type === 'COURT_ORDER_VIOLATION') return 'HIGH';
    if (signal.type === 'RETALIATION') return 'HIGH';
    if (signal.type === 'FINANCIAL_PRESSURE') return 'MEDIUM';
    return 'LOW';
  }

  identifyActor(signal) {
    // Try to match signal to known actor
    for (const [id, actor] of this.actors) {
      if (signal.source?.toLowerCase().includes(actor.name.toLowerCase())) {
        return id;
      }
    }
    return 'UNKNOWN';
  }

  matchPattern(signal) {
    // Try to match signal to known patterns
    for (const [id, pattern] of this.patterns) {
      const matches = pattern.indicators.filter(indicator => 
        signal.description?.toLowerCase().includes(indicator.replace(/_/g, ' '))
      );
      if (matches.length > 0) {
        return id;
      }
    }
    return 'UNKNOWN';
  }

  generateResponse(signal) {
    const severity = this.assessSeverity(signal);
    
    const responses = {
      CRITICAL: [
        'IMMEDIATE: Document everything',
        'IMMEDIATE: Contact authorities if child safety',
        'IMMEDIATE: File emergency motion',
        'IMMEDIATE: Notify operator'
      ],
      HIGH: [
        'URGENT: Document threat',
        'URGENT: Prepare response',
        'URGENT: File motion if needed',
        'URGENT: Monitor closely'
      ],
      MEDIUM: [
        'IMPORTANT: Document occurrence',
        'IMPORTANT: Monitor for escalation',
        'IMPORTANT: Prepare countermeasures'
      ],
      LOW: [
        'ROUTINE: Log event',
        'ROUTINE: Continue monitoring'
      ]
    };
    
    return responses[severity] || responses.LOW;
  }

  async createAlert(threat) {
    const id = uuidv4();
    
    const alert = {
      id,
      timestamp: new Date().toISOString(),
      threatId: threat.id,
      severity: threat.severity,
      message: `THREAT DETECTED: ${threat.type} - ${threat.description}`,
      actor: threat.actor,
      pattern: threat.pattern,
      recommendedResponse: threat.recommendedResponse,
      acknowledged: false
    };

    this.alerts.set(id, alert);
    return alert;
  }

  async getThreatLevel() {
    const threats = Array.from(this.threats.values());
    const recentThreats = threats.filter(t => {
      const age = Date.now() - new Date(t.timestamp).getTime();
      return age < 7 * 24 * 60 * 60 * 1000; // Last 7 days
    });
    
    const criticalCount = recentThreats.filter(t => t.severity === 'CRITICAL').length;
    const highCount = recentThreats.filter(t => t.severity === 'HIGH').length;
    
    let level = 'GUARDED';
    if (criticalCount > 0) level = 'CRITICAL';
    else if (highCount > 2) level = 'HIGH';
    else if (highCount > 0) level = 'ELEVATED';
    
    return {
      level,
      recentThreats: recentThreats.length,
      critical: criticalCount,
      high: highCount,
      actors: this.getActorStatus(),
      patterns: this.getActivePatterns()
    };
  }

  getActorStatus() {
    return Array.from(this.actors.values()).map(actor => ({
      name: actor.name,
      risk: actor.risk,
      capability: actor.capability,
      intent: actor.intent,
      criminalExposure: actor.criminalExposure
    }));
  }

  getActivePatterns() {
    const threats = Array.from(this.threats.values());
    const patternCounts = {};
    
    threats.forEach(threat => {
      if (threat.pattern && threat.pattern !== 'UNKNOWN') {
        patternCounts[threat.pattern] = (patternCounts[threat.pattern] || 0) + 1;
      }
    });
    
    return Object.entries(patternCounts)
      .map(([patternId, count]) => ({
        ...this.patterns.get(patternId),
        occurrences: count
      }))
      .sort((a, b) => b.occurrences - a.occurrences);
  }

  async getRecentThreats(hours = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return Array.from(this.threats.values())
      .filter(t => new Date(t.timestamp) >= cutoff)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getUnacknowledgedAlerts() {
    return Array.from(this.alerts.values())
      .filter(a => !a.acknowledged)
      .sort((a, b) => {
        const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }

  async acknowledgeAlert(alertId) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      this.alerts.set(alertId, alert);
    }
    return alert;
  }

  getStatus() {
    return {
      totalThreats: this.threats.size,
      totalAlerts: this.alerts.size,
      unacknowledgedAlerts: Array.from(this.alerts.values()).filter(a => !a.acknowledged).length
    };
  }
}
