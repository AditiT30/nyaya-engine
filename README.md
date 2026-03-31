# Nyaya Engine
### A Source-Sensitive Epistemic Reasoning Agent
**IKS Hackathon 2026 — Unriddling Inference**
Problem Statement 2: Artificial Human-Like Reasoning Agent
*Submitted by Aditi Tiwari (Individual — Team Dhatri)*
 
---

## What This Is

Most AI agents store beliefs as `true` or `false`. They have no mechanism to ask *how* a belief was obtained, *how reliable* the source is, or *whether the reasoning* that produced it was logically valid.

The Nyaya Engine is a reasoning middleware that sits between raw data — tweets, sensor readings, manual reports — and final action. Every belief it holds carries a full epistemic chain: which source produced it, which pramāṇa (valid means of knowledge) classified it, what confidence score it received, and what prior beliefs it revised. No conclusion is accepted without justification. No belief is overwritten without a trace.

The architecture is grounded entirely in **Nyāya-Śāstra**, a 2,000-year-old Indian school of epistemology that formalises not just *what* is known, but *how* it is known.
 
---

## Section 1 — Technical Implementation: Critical Features

### 1.1 Two-Level Source Classification (`sourceDetector.js` + `channelClassifier.js`)

The system performs source classification at two independent levels before any belief is formed.

**Level 1 — Source Detection:** The `sourceDetector.js` scans input metadata for a declared `source` field. If present, `detectionConfidence` is set to `1.0` and the method is marked `explicit`. If absent, the `autoDetector` runs structural pattern recognition — identifying `tweet_id`, `device_id`, or `author_handle` fields to infer origin. Auto-detected sources receive a `detectionConfidence` of `0.6–0.9`, reflecting the uncertainty of inference about the source itself.

**Level 2 — Channel Classification:** Once the source is known, `channelClassifier.js` assigns a `channelTrust` constant and attaches `mappingRules` — a schema that defines how each JSON field maps to a logical component (Pakṣa, Hetu, or Sādhya). This means the same field name in a tweet payload and a sensor payload is treated with structurally different epistemic weight.

```
Hardware Sensor   → channelTrust: 0.95
Manual Entry      → channelTrust: 0.85
Twitter / Social  → channelTrust: 0.50
```

### 1.2 Field-Level Pramāṇa Mapping (`pramanaMapper.js`)

Rather than classifying an entire input as a single pramāṇa, the mapper assigns a pramāṇa type and rank to **each individual field** within the payload. A sensor input produces three separate evidence entries:

```json
[
  { "field": "content.raw_reading",      "pramana": "pratyaksa", "rank": 1.0 },
  { "field": "content.computed_avg",     "pramana": "anumana",   "rank": 0.8 },
  { "field": "content.calibration_note", "pramana": "sabda",     "rank": 0.6 }
]
```

This field-level granularity means the confidence calculation reflects the actual epistemic composition of the input — not a coarse label applied to the whole payload.

### 1.3 Blended Confidence Formula (`calculateBlendedConfidence.js`)

The system moves entirely away from binary `true/false` belief storage. Every belief receives a `finalConfidence` score computed as:

```
finalConfidence = channelTrust × detectionConfidence × avg(pramanaRanks)
```

This is a **multiplicative formula**, not an average. Each factor acts as a filter: a high content score cannot compensate for a low-trust channel. Examples from the dry run:

| Input | channelTrust | detectionConf | avgPramana | finalConfidence |
|-------|-------------|---------------|------------|-----------------|
| Twitter eyewitness (Ex.1) | 0.50 | 1.0 | 0.733 | **0.367** |
| Forest dept sensor (Ex.3) | 0.95 | 1.0 | 0.800 | **0.760** |
| Manual entry anumana (Ex.5) | 0.85 | 1.0 | 0.860 | **0.723** |
| Upamana ranger report (Ex.11) | 0.85 | 1.0 | 0.830 | **0.697** |

The output includes a `displayPercentage` and a full `trace` object for auditability.

### 1.4 Runtime Vyāpti Learning (`vyaptiLearner.js` + `vyaptiStore.js`)

The Vyāpti Store is not a static lookup table. Universal pervasion rules are **learned at runtime** through co-occurrence observation. Every time a Hetu and Sādhya are observed together, the learner increments an `occurrences` counter against a configurable `threshold`. A rule only becomes `isValid: true` when the threshold is crossed — reflecting Nyāya's requirement of *bhūyodarśana* (repeated observation).

From the dry run — rule `SMOKE_OBSERVED → FIRE_CONFIRMED` evolving across examples:

```
Ex.2  → occurrences: 1, isValid: false
Ex.5  → occurrences: 2, isValid: false
Ex.6  → occurrences: 3, isValid: true   ← threshold crossed, Tarka can now proceed
Ex.10 → occurrences: 4, isValid: true
```

Rules can also be **weakened**: when belief revision contradicts an established rule, the system decays its strength rather than deleting it — preserving the history of what was believed and when.

### 1.5 Five-Member Nyāya Syllogism (`anumanaEngine.js`)

Every inference is decomposed into the classical Pañcāvayava-vākya (five-member syllogism), making the reasoning chain fully auditable. No inference is a black-box prediction:

```
Pratijñā  (Proposition)   — "FIRE_CONFIRMED is claimed about this case"
Hetu      (Reason)        — "SMOKE_OBSERVED is active — confidence 0.367"
Udāharaṇa (Universal)     — "Rule SMOKE_OBSERVED → FIRE_CONFIRMED observed N times"
Upanaya   (Application)   — "Hetu SMOKE_OBSERVED holds in the current context"
Nigamana  (Conclusion)    — "FIRE_CONFIRMED is concluded with confidence X"
```

The `Nigamana` confidence is derived from the Hetu's confidence multiplied by the rule's observation weight — so weak rules produce weak conclusions, and the weakness is explicit.

### 1.6 Three-Gate Tarka Validation (`tarkaEngine.js`)

Before any inference is accepted, the Tarka Engine runs three sequential checks:

1. **Does a Vyāpti rule exist for this Hetu → Sādhya pair?** If not → `SUSPENDED`
2. **Is the rule's strength above threshold?** If not → `DOUBTFUL`
3. **Does the Hetu actually hold in the current Pakṣa?** If not → `REJECTED`

Only inputs that pass all three gates proceed. The engine also runs **counterfactual stress testing** — temporarily assuming the negation of a proposed relation and checking whether this produces contradictions in the existing belief base. If contradictions arise, the original inference is reinforced.

From the dry run: Example 7 (IMD rainfall tweet) triggers `SUSPENDED` with fallacy `Viruddha` (contradiction) — the claim contradicts established beliefs about simultaneous smoke and rainfall.

### 1.7 Hetvābhāsa Fallacy Registry (`hetvabhasaRegistry.js`)

Even when a Vyāpti rule exists and passes the gate, the fallacy registry runs matcher functions against five named fallacy categories before accepting any inference:

- **Savyabhicāra** — Hetu maps to multiple incompatible Sādhyas (irregular reason)
- **Viruddha** — Hetu proves the opposite of the intended Sādhya (contradictory reason)
- **Satpratipakṣa** — An equally strong counter-inference exists (counterbalanced reason)
- **Asiddha** — The Hetu itself is not yet established in the belief store (unproven reason)
- **Bādhita** — Direct perception in the belief store contradicts the inference (empirically false)

Detected fallacies attach a tag to the inference, reduce its confidence, or reject it entirely. This is not keyword filtering — it is structural logical analysis of the inference's epistemic components.

### 1.8 Non-Monotonic Belief Revision with Append-Only History (`beliefRevisionModule.js`)

The belief revision module supports three distinct operations:

- **Update** — New evidence refines an existing belief with improved confidence
- **Retract** — Contradictory evidence with higher confidence invalidates a belief
- **Replace** — A stronger pramāṇa overrides a weaker one (Pratyakṣa overrides Śabda)

Crucially, the system **never deletes**. Every prior state of a belief is pushed into a `revisions[]` array with a timestamp and the trigger event. The full epistemic history of any proposition is queryable at any point. This makes the system self-correcting and fully auditable — a property no baseline boolean-store agent can offer.

### 1.9 Baseline Comparison Agent (`baselineAgentPipeline.js`)

A structurally minimal agent is included that processes the same 11 inputs with no pramāṇa classification, no channel trust, no vyapti gating, and no revision history. Beliefs are stored as plain booleans. This is not a straw man — it represents the architecture of most production rule-based systems. Running both agents on the same inputs and comparing outputs demonstrates concretely what epistemic structure provides.
 
---

## Section 2 — Nyāya Concepts Implemented

### Pramāṇa — Valid Means of Knowledge
Nyāya recognises exactly four sources through which valid knowledge (*Pramā*) can be obtained. The engine encodes all four with distinct trust weights, preventing any source from being treated as epistemically equivalent to another.

**Pratyakṣa (Direct Perception)** is knowledge obtained through direct sensory contact with an object. In the engine, raw sensor readings and first-person eyewitness reports are classified as Pratyakṣa. It carries the highest pramāṇa rank (1.0) because it requires no intermediary reasoning — the object and the knower are in direct contact.

**Anumāna (Inference)** is knowledge derived from an observed mark (Hetu) combined with a known universal relation (Vyāpti). It is the engine's primary reasoning mechanism — the Anumāna Engine explicitly constructs the five-member syllogism for every derived conclusion. Computed or derived sensor values and officer-reasoned reports are classified here (rank: 0.8–0.85).

**Upamāna (Comparison/Analogy)** is knowledge obtained by recognising similarity between a new case and a previously known instance. In the engine, manual entries that include an `upamana_connector` field — explicitly drawing a comparison to a prior known event — are classified as Upamāna (rank: 0.7). Example 11 (ranger comparing Aravalli smoke to Rajasthan 2024 wildfire) demonstrates this classification.

**Śabda (Verbal Testimony)** is knowledge derived from the words of a reliable authority (*Āpta*). Text-based claims, metadata notes, and social media posts are classified as Śabda (rank: 0.6). The reliability of the authority is encoded in the `channelTrust` constant — testimony from a verified forest officer (manual entry, 0.85) is weighted differently from testimony via Twitter (0.50).

### Vyāpti — Universal Pervasion
Vyāpti is the invariable concomitance between a Hetu (reason/mark) and a Sādhya (conclusion) — the universal relation that makes inference valid. In Nyāya, an inference is only legitimate when such a pervasion has been established through repeated observation without contradiction. The engine replicates this: rules accumulate `occurrences` and only become valid after crossing a threshold, directly implementing *bhūyodarśana* (repeated observation) and *avyabhicāra* (absence of contradiction).

### Tarka — Hypothetical Reasoning
Tarka is not a direct pramāṇa but a supportive logical tool used to test inferences by assuming their negation and examining whether contradiction results. If assuming "there is no fire" leads to contradictions with established sensor beliefs, the original inference is reinforced. The engine's Tarka layer operationalises this as counterfactual stress testing before committing any inference to the belief store.

### Hetvābhāsa — Fallacious Reasoning
Nyāya catalogues specific ways in which a Hetu can appear valid while being logically flawed. The engine implements all five classical categories as matcher functions. This transforms fallacy detection from a heuristic filter into a structured logical check grounded in 2,000 years of epistemological analysis.

### Pañcāvayava-vākya — Five-Member Syllogism
The classical Nyāya inference structure decomposes every argument into five explicit steps: Pratijñā (claim), Hetu (reason), Udāharaṇa (universal example with Vyāpti), Upanaya (application to the current case), and Nigamana (conclusion). The Anumāna Engine generates all five components for every inference, making the reasoning chain fully transparent and inspectable — the opposite of a black-box prediction.

### Pramā — Valid Cognition
The ultimate goal of Nyāya epistemology is *Pramā* — cognition that is valid, justified, and true. The engine's pipeline is designed as a progressive transformation from raw unprocessed data to Pramā: each phase adds a layer of epistemic validation until only beliefs that survive source verification, confidence scoring, vyāpti gating, fallacy checking, and belief revision are accepted as valid knowledge.

### Non-Monotonic Reasoning
Classical Nyāya holds that truth (*tattva*) takes precedence over consistency — a belief must be revised when stronger evidence contradicts it, even if the system was previously certain. The Belief Revision Module implements this directly: no belief is permanent, stronger pramāṇas override weaker ones, and the full history of every revision is preserved.
 
---

## Project Structure

```
nyaya-engine/
  backend/
    server/
      routes/
        beliefs.js       — Belief query endpoints
        infer.js         — Inference trigger endpoints
        trace.js         — Reasoning trace endpoints
        vyapti.js        — Vyāpti store endpoints
      middleware/
        validator.js     — Input validation
      app.js             — Express app, static serving
    src/
      sourceDetector.js
      channelClassifier.js
      pramanaMapper.js
      calculateBlendedConfidence.js
      beliefStore.js
      vyaptiLearner.js
      vyaptiStore.js
      tarkaEngine.js
      hetvabhasaRegistry.js
      anumanaEngine.js
      beliefRevisionModule.js
    pipeline.js                — 10-phase pipeline orchestrator
    baselineAgentPipeline.js   — Source-agnostic comparison agent
    simulate.js                — Runs all 11 dry-run examples
    simulateComparison.js      — Side-by-side Nyaya vs baseline output
    index.js                   — Server entry point
  frontend/
    public/
      index.html               — Interactive dry-run interface
```

## Running the Project

```bash
cd backend
node index.js
```

Server runs at `http://localhost:3001`

To run the dry-run simulation directly:

```bash
cd backend
node simulate.js
```

To run the baseline comparison:

```bash
cd backend
node simulateComparison.js
```
 
---

*The Nyaya Engine is both a technical solution and an argument: that philosophical rigour and computational architecture are not in tension — that a 2,000-year-old framework for valid cognition can be made load-bearing in a modern reasoning system.*
 