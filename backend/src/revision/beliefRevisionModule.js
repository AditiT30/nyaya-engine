const vyaptiStore = require('../store/vyaptiStore');
const beliefStore = require('../store/beliefStore');
const InferenceStatuses = require('./inferenceStatuses');

const DECAY_FACTOR = 0.85; //creates a weighted memory - the more a rule has been right in the past, the harder it is for a single error to destroy it

const beliefRevisionModule = {
    /**
     * Re-evaluates an inference when new, contradicting evidence arrives.
     * @param {string} beliefId - The ID of the belief to revise
     * @param {string} contradictionReason - Why we are revising it
     */

    revise: (beliefId, contradictionReason) => {
        const existing = beliefStore.getBelief(beliefId);
        if (!existing) return;

        // CASE A:INFERRED belief (Logic failed)
        if (existing.source === 'Inference (Anumana)' && existing.ruleId) {
            const rule = vyaptiStore.getRule(existing.ruleId);
            if (rule) {
                const newStrength = Math.floor(rule.occurrences * DECAY_FACTOR);
                vyaptiStore.updateStrength(existing.ruleId, newStrength);
            }
        }

        // CASE B:DIRECT belief (Sensor/Tweet failed)
        else  {
            // "punish" the trust of the original source
            const originalSource = existing.sourceId;
            if (originalSource) {
                sourceStore.decayTrust(originalSource, DECAY_FACTOR);
                console.log(` Source [${originalSource}] trust decayed. It provided false data.`);
            }
        }

        // CASE: SABDA (Verbal Testimony / Tweets / News)
        if (existing.sourceType === 'sabda') {
            const sourceId = existing.sourceId;

            // We apply a "Truth Decay" to the specific speaker/account
            // In Nyaya, this is losing the status of an 'Apta' (Trustworthy One)
            sourceStore.decayTrust(sourceId, 0.70); // Harsher penalty for Sabda (30% drop)

            console.log(`Sabda Failure: Source [${sourceId}] is no longer considered an 'Apta'.`);
        }

        // Standard Revision Log
        const revised = {
            ...existing,
            status: 'SUSPENDED',
            confidence: 0,
            revisions: [
                ...existing.revisions,
                {
                    oldStatus: existing.status,
                    reason: `Sabda Contradicted: ${contradictionReason}`,
                    timestamp: new Date().toISOString()
                }
            ]
        };

        beliefStore.updateBelief(beliefId, revised);

    }
}

module.exports = beliefRevisionModule;