class Machine {
  constructor(registry) {
    this.allowedProofClasses = registry?.governance?.proof_classes || [
      'draft', 'researched', 'templated', 'precedent_verified',
      'filed', 'argued', 'ruled', 'appellate_reviewed',
      'supreme_certified', 'constitutional'
    ];
  }

  /**
   * Level 3: Machine
   * Unyielding automation, deterministic pipelines, and strict verification logic.
   */
  verifyPipeline(tradeOutput, requiredProofClass) {
    if (!this.allowedProofClasses.includes(requiredProofClass)) {
      throw new Error(`[MACHINE REJECTION] Invalid proof class: ${requiredProofClass}`);
    }

    const verificationLog = [];
    verificationLog.push(`[VERIFY] Checking work product against ${requiredProofClass} standards...`);

    // Strict validation rules
    if (tradeOutput.confidence < 0.8) {
      verificationLog.push(`[FATAL] Confidence score ${tradeOutput.confidence} falls below 0.8 Machine threshold.`);
      return { verified: false, log: verificationLog, output: null };
    }

    if (requiredProofClass === 'precedent_verified') {
      const hasPrecedent = tradeOutput.trace.some(t => t.includes('precedent') || t.includes('authority'));
      if (!hasPrecedent) {
        verificationLog.push(`[FATAL] Proof class 'precedent_verified' requires explicit precedent tracing.`);
        return { verified: false, log: verificationLog, output: null };
      }
    }

    verificationLog.push(`[SUCCESS] Deterministic verification passed for proof class: ${requiredProofClass}`);

    return {
      verified: true,
      log: verificationLog,
      proof_class_attained: requiredProofClass,
      certified_output: tradeOutput.workProduct,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = Machine;
