class Machine {
  constructor(registry = {}) {
    this.allowedProofClasses = registry.proof_classes || [
      'draft', 'researched', 'templated', 'precedent_verified',
      'filed', 'argued', 'ruled', 'appellate_reviewed',
      'supreme_certified', 'constitutional'
    ];
    this.authority = registry.authority || {};
    this.requiredFields = this.authority.required_proposition_fields || [];
    this.truthClasses = this.authority.truth_classes || [];
  }

  /**
   * Level 3: Machine
   * Validates contract completeness and provenance posture. Passing this gate
   * means the object satisfies the configured CASEBRAIN contract; it does NOT
   * independently prove the underlying factual proposition or legal conclusion.
   */
  verifyPipeline(tradeOutput, requiredProofClass) {
    if (!this.allowedProofClasses.includes(requiredProofClass)) {
      throw new Error(`[MACHINE REJECTION] Invalid work-product class: ${requiredProofClass}`);
    }

    const verificationLog = [];
    verificationLog.push(`[VERIFY] Validating CASEBRAIN proposition contract for work-product class: ${requiredProofClass}.`);

    const proposition = tradeOutput?.proposition;
    if (!proposition || typeof proposition !== 'object' || Array.isArray(proposition)) {
      verificationLog.push('[FATAL] Missing canonical proposition object. Analytical output cannot be promoted or synchronized as verified.');
      return { verified: false, contract_validated: false, log: verificationLog, output: null };
    }

    const missingFields = this.requiredFields.filter(field => {
      if (!Object.prototype.hasOwnProperty.call(proposition, field)) return true;
      const value = proposition[field];
      return value === null || value === undefined || value === '';
    });

    if (missingFields.length > 0) {
      verificationLog.push(`[FATAL] Incomplete proposition contract. Missing/empty fields: ${missingFields.join(', ')}.`);
      return {
        verified: false,
        contract_validated: false,
        missing_fields: missingFields,
        log: verificationLog,
        output: null
      };
    }

    if (!this.truthClasses.includes(proposition.truth_class)) {
      verificationLog.push(`[FATAL] Invalid truth_class: ${proposition.truth_class}.`);
      return { verified: false, contract_validated: false, log: verificationLog, output: null };
    }

    if (proposition.truth_class === 'ESTABLISHED_RECORD_FACT') {
      if (!Array.isArray(proposition.source_locators) || proposition.source_locators.length === 0) {
        verificationLog.push('[FATAL] ESTABLISHED_RECORD_FACT requires at least one source locator.');
        return { verified: false, contract_validated: false, log: verificationLog, output: null };
      }
      if (!proposition.verification_receipt) {
        verificationLog.push('[FATAL] ESTABLISHED_RECORD_FACT requires a verification receipt.');
        return { verified: false, contract_validated: false, log: verificationLog, output: null };
      }
    }

    if (requiredProofClass === 'precedent_verified') {
      const hasAuthorityLocator = Array.isArray(proposition.source_locators) && proposition.source_locators.length > 0;
      if (!hasAuthorityLocator) {
        verificationLog.push("[FATAL] Work-product class 'precedent_verified' requires explicit authority source locators.");
        return { verified: false, contract_validated: false, log: verificationLog, output: null };
      }
    }

    verificationLog.push('[PASS] Proposition contract is complete. This is contract validation, not independent proof of the proposition.');

    return {
      verified: true,
      contract_validated: true,
      log: verificationLog,
      proof_class_attained: requiredProofClass,
      truth_class: proposition.truth_class,
      proposition_id: proposition.proposition_id,
      certified_output: tradeOutput.workProduct,
      verification_boundary: 'CONTRACT_VALIDATED_NOT_INDEPENDENTLY_PROVEN',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = Machine;