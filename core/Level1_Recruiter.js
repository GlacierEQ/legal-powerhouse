const fs = require('fs');
const path = require('path');

class Recruiter {
  constructor(agentRegistry) {
    this.agents = agentRegistry.agents || {};
    this.pistons = agentRegistry.pistons || {};
    this.monolith = this.loadMonolith();
  }

  loadMonolith() {
    try {
      const estatePath = path.join(__dirname, '..', 'brain', 'monolith_estate.json');
      if (fs.existsSync(estatePath)) {
        return JSON.parse(fs.readFileSync(estatePath, 'utf8'));
      }
    } catch (e) {
      console.error("[RECRUITER] Failed to load Monolith:", e.message);
    }
    return null;
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

    // Mesh the links: Attach relevant repositories from the Monolith
    const meshedLinks = [];
    if (this.monolith && this.monolith.layers) {
      if (text.includes('rico') || squad.pistons.includes('stealth-evidence')) {
        meshedLinks.push(...(this.monolith.layers.legal_data?.nodes.slice(0, 3) || []));
      }
      if (squad.pistons.includes('stealth-precedent')) {
        meshedLinks.push(...(this.monolith.layers.legal_tech?.nodes.slice(0, 2) || []));
      }
      // Always attach core colossus nodes to the commander
      meshedLinks.push(...(this.monolith.layers.colossus_core_nodes?.nodes.slice(0, 2) || []));
    }

    // Deduplicate meshed links by URL
    const uniqueLinks = Array.from(new Map(meshedLinks.map(repo => [repo.url, repo])).values());

    return {
      objective,
      squad,
      meshed_links: uniqueLinks.map(r => ({ name: r.name, url: r.url })),
      recruitment_timestamp: new Date().toISOString(),
      status: 'SQUAD_ASSEMBLED_AND_MESHED'
    };
  }
}

module.exports = Recruiter;
