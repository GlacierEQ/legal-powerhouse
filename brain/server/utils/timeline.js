import { v4 as uuidv4 } from 'uuid';

export class TimelineTracker {
  constructor() {
    this.events = new Map();
    this.deadlines = new Map();
    this.milestones = new Map();
    this.caseId = '1FDV-23-0001009';
  }

  async addEvent(event) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    const enrichedEvent = {
      id,
      timestamp,
      caseId: this.caseId,
      ...event,
      metadata: {
        ...event.metadata,
        createdAt: timestamp
      }
    };

    this.events.set(id, enrichedEvent);
    
    // Check if this is a deadline
    if (event.type === 'DEADLINE') {
      this.deadlines.set(id, enrichedEvent);
    }
    
    // Check if this is a milestone
    if (event.type === 'MILESTONE') {
      this.milestones.set(id, enrichedEvent);
    }

    return enrichedEvent;
  }

  async getTimeline(options = {}) {
    const { startDate, endDate, types, limit = 100 } = options;
    
    let events = Array.from(this.events.values());
    
    // Filter by date range
    if (startDate) {
      events = events.filter(e => new Date(e.date) >= new Date(startDate));
    }
    if (endDate) {
      events = events.filter(e => new Date(e.date) <= new Date(endDate));
    }
    
    // Filter by types
    if (types?.length) {
      events = events.filter(e => types.includes(e.type));
    }
    
    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return events.slice(0, limit);
  }

  async getUpcomingDeadlines(days = 30) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return Array.from(this.deadlines.values())
      .filter(d => {
        const deadlineDate = new Date(d.date);
        return deadlineDate >= now && deadlineDate <= future;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  async getCustodyCountdown() {
    // Target: 30-45 days from federal filing
    const filingDate = this.milestones.get('federal_filing');
    
    if (!filingDate) {
      return {
        status: 'PENDING',
        message: 'Federal filing not yet completed',
        daysToTarget: null
      };
    }
    
    const filing = new Date(filingDate.date);
    const targetDate = new Date(filing.getTime() + 45 * 24 * 60 * 60 * 1000); // 45 days
    const now = new Date();
    const daysRemaining = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
    
    return {
      status: daysRemaining > 0 ? 'IN_PROGRESS' : 'OVERDUE',
      filingDate: filing.toISOString(),
      targetDate: targetDate.toISOString(),
      daysRemaining: Math.max(0, daysRemaining),
      progress: Math.min(100, Math.round(((45 - daysRemaining) / 45) * 100))
    };
  }

  async getFlipCascadeStatus() {
    const defendants = [
      { name: 'Teresa', role: 'Primary target', probability: 90 },
      { name: 'HPD Officer', role: 'Evidence overwhelming', probability: 85 },
      { name: 'Judge Naso', role: 'Caught in conspiracy', probability: 80 },
      { name: 'Brower', role: '25-year relationship exposed', probability: 75 },
      { name: 'Yamatani', role: 'Conflict concealment', probability: 70 },
      { name: 'Judge Shaw', role: 'Main target', probability: 60 }
    ];
    
    // Check for flip events
    const flipEvents = Array.from(this.events.values())
      .filter(e => e.type === 'FLIP');
    
    return {
      defendants: defendants.map(d => {
        const flipEvent = flipEvents.find(e => e.defendant === d.name);
        return {
          ...d,
          status: flipEvent ? 'FLIPPED' : 'PENDING',
          flippedAt: flipEvent?.date || null
        };
      }),
      totalProbability: Math.round(defendants.reduce((sum, d) => sum + d.probability, 0) / defendants.length)
    };
  }

  async getMotionStatus() {
    const motions = [
      { id: 'csea_void', name: 'CSEA Void Ab Initio Motion', status: 'READY' },
      { id: 'rule_60b4', name: 'Rule 60(b)(4) Void Decree Motion', status: 'READY' },
      { id: 'emergency_return', name: 'Emergency Return of Kekoa Motion', status: 'READY' },
      { id: 'federal_complaint', name: '§1983 Federal Complaint', status: 'PENDING_AUDIO' },
      { id: 'rico_complaint', name: 'RICO Complaint', status: 'PENDING_AUDIO' }
    ];
    
    // Check for filing events
    const filingEvents = Array.from(this.events.values())
      .filter(e => e.type === 'FILING');
    
    return motions.map(m => {
      const filingEvent = filingEvents.find(e => e.motionId === m.id);
      return {
        ...m,
        status: filingEvent ? 'FILED' : m.status,
        filedAt: filingEvent?.date || null
      };
    });
  }

  async getTimelineStats() {
    const events = Array.from(this.events.values());
    const deadlines = Array.from(this.deadlines.values());
    const milestones = Array.from(this.milestones.values());
    
    return {
      totalEvents: events.length,
      totalDeadlines: deadlines.length,
      totalMilestones: milestones.length,
      eventsByType: this.groupByType(events),
      upcomingDeadlines: (await this.getUpcomingDeadlines(7)).length,
      custodyCountdown: await this.getCustodyCountdown()
    };
  }

  groupByType(events) {
    return events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});
  }

  getStatus() {
    return {
      totalEvents: this.events.size,
      totalDeadlines: this.deadlines.size,
      totalMilestones: this.milestones.size
    };
  }
}
