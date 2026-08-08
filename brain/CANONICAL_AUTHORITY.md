# Canonical Authority — Legal Powerhouse / CASEBRAIN

**Case:** `1FDV-23-0001009`  
**Status:** Governance contract; additive to the existing CASEBRAIN lane  
**Rule:** This document does not replace an official record, authenticated source, or the existing CASEBRAIN machine contract.

## 1. Authority topology

Legal Powerhouse is the **orchestration and investigation gateway**. It is not, by itself, the evidentiary source of truth.

The controlling topology is:

1. **Substantive factual authority — official/native sources**
   - operative filed orders and docket entries;
   - certified or official court records;
   - authenticated original recordings, communications, photographs, business/agency records, and native metadata;
   - original bytes are immutable.
2. **Canonical machine contract — `GlacierEQ/SUPERLUMINAL_CASE_MATRIX/CASEBRAIN_V3`**
   - schemas;
   - normalized reviewed nodes;
   - contradiction objects;
   - source locators;
   - validation rules;
   - receipts and version history.
3. **Legal-estate cartography — `GlacierEQ/monolith/catalog/legal_spines/1FDV-23-0001009*`**
   - exhaustive case-repository mapping and alias groups;
   - ownership-layer classification;
   - discovery-candidate queue;
   - migration order and no-delete invariants;
   - Monolith maps; owning repositories execute;
   - repository presence or search match is not evidence.
4. **Evidence custody — persistent Library and restricted Box proofbooks**
   - authenticated binaries;
   - hashes;
   - provenance;
   - actor proofbooks;
   - restricted evidence.
5. **Court-preparation plane — Google Drive**
   - working documents;
   - exhibit manifests;
   - court-ready derivatives;
   - preparation packages.
6. **Raw/recovery plane — Dropbox**
   - original media and large-source archives;
   - bounded intake and recovery;
   - not a mixed-root canonical fact store.
7. **Human governance plane — Notion**
   - navigation;
   - review;
   - decision state;
   - queues and linked summaries;
   - never sole evidence.
8. **Legal Powerhouse**
   - discovery;
   - retrieval;
   - orchestration;
   - contradiction detection;
   - research;
   - drafting;
   - visualization;
   - must project from the authority chain above.

## 2. Non-negotiable truth classes

Every substantive proposition emitted, stored, displayed, scored, drafted, or exported by Legal Powerhouse MUST carry exactly one factual class:

- `ESTABLISHED_RECORD_FACT`
- `ORIGINAL_SOURCE_FACT`
- `USER_ALLEGATION`
- `SOURCE_SUMMARY`
- `INFERENCE`
- `LEGAL_HYPOTHESIS`
- `DISPUTED`
- `UNVERIFIED`
- `SUPERSEDED`
- `REJECTED`

A proposition without a truth class is incomplete and MUST NOT be promoted into a filing-ready layer.

## 3. Source precedence

Highest to lowest:

1. operative official court record;
2. authenticated original source;
3. locally computed cryptographic hash + source metadata;
4. declaration based on personal knowledge;
5. reliable authenticated derivative;
6. party/attorney-created filing or correspondence;
7. internal summary, dashboard, task, memory, or AI analysis;
8. unsupported narrative, prediction, or generated conclusion.

When sources conflict, preserve both and create a contradiction record. Never silently select the version that best fits a theory.

Repository duplication is not corroboration. Forks, backups, renamed successors, archive copies, derivative exports, and repeated generated prose count as one lineage unless independent provenance establishes a separate source.

## 4. Proposition contract

Every material proposition **MUST** resolve to a machine object containing at least:

- `proposition_id`
- `case_id`
- `statement`
- `truth_class`
- `source_locators[]`
- `source_object_ids[]`
- `actor_ids[]`
- `event_ids[]`
- `docket_entry_ids[]`
- `contradiction_ids[]`
- `legal_element_ids[]`
- `authentication_status`
- `admissibility_posture`
- `sensitivity_class`
- `last_verified_at`
- `verification_receipt`
- `missing_proof[]`
- `deployment_state`

Incomplete proposition objects MUST be rejected before promotion or export. Missing `sensitivity_class`, `verification_receipt`, or `deployment_state` is a hard failure, not advisory metadata.

No source locator means no promotion to `ESTABLISHED_RECORD_FACT`.

## 5. Repository mesh

The exhaustive cartographic source is the Monolith legal spine:

- `GlacierEQ/monolith/catalog/legal_spines/1FDV-23-0001009.json`
- `GlacierEQ/monolith/catalog/legal_spines/1FDV-23-0001009-index.json`
- `GlacierEQ/monolith/catalog/legal_spines/1FDV-23-0001009-discovery-candidates.json`

At the 2026-08-03 generation, it records **47 assigned repositories and 43 discovery candidates (90 total case-bearing repositories/candidates)**. The lists below identify high-value owning surfaces; they are not a second exhaustive inventory.

Every repository projected by Legal Powerhouse MUST carry both a machine-stable `role` and an explicit `authority_level`. Consumers may not infer authority from category names or prose.

### Canonical legal-data / source-index lane

- `GlacierEQ/SUPERLUMINAL_CASE_MATRIX` — canonical CASEBRAIN machine contract and evidence graph.
- `GlacierEQ/DOCKETS` — docket corpus and direct record extraction/indexing.
- `GlacierEQ/CASE-1FDV-23-0001009` — primary case pack.
- `GlacierEQ/CASE-1FDV-23-0001009-LEAN` — bounded/lean case representation; reconcile against the primary case pack before promotion.
- `GlacierEQ/CYBERTACK-1FDV-23-0001009` — forensic working set; working evidence is not automatically established fact.
- `GlacierEQ/THE_CATACLYSM` / related CATACLYSM lineage — source/archive family; derivatives and mixed exports require source classification.
- `GlacierEQ/EVIDENCE-VAULT-ENCRYPTED` — evidence-custody capability; source identity and accessibility must be independently resolved.

### Context / memory lane

- `GlacierEQ/AspenGrove-KEKOA-1FDV-23-0001009`
- `GlacierEQ/AEON-777`
- `GlacierEQ/AEON-BRAIN-777`

These systems supply continuity and context. Memory never outranks a controlling source.

### Work-product lane

- `GlacierEQ/case-1FDV-23-0001009-legal-documents`
- `GlacierEQ/1FDV-23-0001009-FEDERAL-WARFARE`
- `GlacierEQ/apex-legal-case`
- `GlacierEQ/book-of-breach-hawaii-family-court`
- `GlacierEQ/CASE-LAW-ARSENAL`

Work product is downstream of evidence. Legal theories, authority research, damages models, and draft filings must never back-promote themselves into facts.

### Legal-technology lane

- `GlacierEQ/casey-legal-mcp-server`
- `GlacierEQ/hawaii-family-court-legal-automation`
- `GlacierEQ/hawaii-docket-automation`
- `GlacierEQ/jefs-legal-ai-fortress`
- `GlacierEQ/legal-brief-pipeline`
- `GlacierEQ/legal-motion-automation`
- `GlacierEQ/FILEBOSS`
- `GlacierEQ/case-brain-unified-runtime`
- `GlacierEQ/unified-case-brain-web`

These repositories execute, transform, validate, or present information. They are not evidence merely because they processed evidence.

## 6. Legal Powerhouse ingestion invariant

For every ingested source:

`discover -> preserve original -> identify provider/native ID -> hash when bytes are available -> classify source -> extract derivative -> create source locator -> create proposition -> truth-class proposition -> contradiction test -> legal-element map -> deployment gate`

A failed or incomplete stage remains visible. No stage may infer success from a downstream artifact.

## 7. Generated-analysis boundary

The following are never proof by themselves:

- actor "flip" or cooperation probabilities;
- guilt, liability, intent, motive, retaliation, conspiracy, corruption, fraud, or criminal labels generated from pattern analysis;
- damages totals generated without a source-backed damages model;
- confidence percentages;
- threat scores;
- predicted court or agency outcomes;
- repeated claims copied between repositories;
- AI summaries or memory entries.

They may exist as `INFERENCE`, `LEGAL_HYPOTHESIS`, or `UNVERIFIED` investigative leads and should identify the proof required to promote or reject them.

## 8. Cross-system write rule

Every persistent write that changes canonical state MUST produce:

1. source identity;
2. previous canonical state/version;
3. intended delta;
4. destination provider + stable object ID;
5. post-write read-back or hash verification;
6. append-only receipt;
7. failure/rollback state when verification does not pass.

Queued, configured, simulated, stale, or unverified activity is not completion.

## 9. Privacy and track separation

- `1FDV-23-0001009` and `1FDA-23-0000515` remain separate legal tracks.
- Protected child, medical, school, psychological, credential, and other restricted material does not enter public repository surfaces.
- Legal Powerhouse may reference restricted objects by opaque canonical IDs without copying protected content into a public layer.

## 10. Immediate integration gate

Before Legal Powerhouse labels its current case brain authoritative, it must:

1. bind its casebrain output to CASEBRAIN V3 truth classes;
2. consume the Monolith legal spine rather than maintain an untracked second repository inventory;
3. attach source locators to every factual proposition;
4. move probability/culpability fields into a non-evidentiary hypothesis namespace or remove them from filing-facing projections;
5. emit contradiction nodes instead of silently resolving conflicting sources;
6. verify that every repository projected as a source has an explicit role and authority level;
7. reject incomplete proposition objects before promotion/export;
8. make all filing/export paths fail closed when a required source, truth class, or legal-lane gate is absent.

**Canonical principle:** investigate broadly; preserve aggressively; classify precisely; prove before promotion.