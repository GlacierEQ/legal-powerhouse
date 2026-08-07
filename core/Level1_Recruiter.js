class Recruiter {
  constructor(agentRegistry) {
    this.agents = agentRegistry.agents || {};
    this.pistons = agentRegistry.pistons || {};
  }

  /**
   * Level 1: Recruiter
   * Autonomously evaluates a legal objective and delegates to the most specialized agents.
   */
  recruitSquad(objective) {
    const text = objective.toLowerCase();
    const squad = {
      commander: null,
      specialists: [],
      pistons: []
    };

    // Recruit Commander
    if (text.includes('rico') || text.includes('federal')) {
      squad.commander = this.agents['federal-litigator'] || 'STEALTH_JUSTICE_PRIME';
    } else {
      squad.commander = this.agents['civil-rights-litigator'] || 'STEALTH_EQUITY_PRIME';
    }

    // Recruit Pistons
    if (text.includes('evidence') || text.includes('exhibit')) squad.pistons.push('stealth-evidence');
    if (text.includes('audio') || text.includes('transcribe')) squad.pistons.push('stealth-transcription');
    if (text.includes('damages') || text.includes('financial')) squad.pistons.push('stealth-calculation');
    if (text.includes('rico') || text.includes('conspiracy')) squad.pistons.push('stealth-enterprise');
    if (text.includes('precedent') || text.includes('case law')) squad.pistons.push('stealth-precedent');

    // Ensure at least stealth-justice is active
    if (squad.pistons.length === 0) squad.pistons.push('stealth-justice');

    return {
      objective,
      squad,
      recruitment_timestamp: new Date().toISOString(),
      status: 'SQUAD_ASSEMBLED'
    };
  }
}

module.exports = Recruiter;
