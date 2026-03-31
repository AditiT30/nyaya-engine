const beliefStore = require('../store/beliefStore');
const vyaptiStore = require('../store/vyaptiStore');
const InferenceStatuses = require('../tarka/inferenceStatuses');

const DECAY_FACTOR = 0.85;

const beliefRevisionModule = {

    /*
    Handles both rule decay AND belief revision/retraction.
     */
    revise: (newBelief, inferenceStatus) => {

        const getProposition = (belief) =>
            belief.proposition ||
            belief.content?.text ||
            belief.content?.proposition ||
            null;

        const revisionLog = [];

        //Belief Revision / Retraction
        const existingBeliefs = beliefStore.listBeliefs();

       // Adding deduplication in `beliefRevisionModule` cleans up double RETRACT
        const strongestPerProposition = new Map();
        existingBeliefs.forEach(b => {
            const prop = b.proposition || b.content?.text || b.content?.proposition;
            if (!prop) return;
            const current = strongestPerProposition.get(prop);
            if (!current || b.finalConfidence > current.finalConfidence) {
                strongestPerProposition.set(prop, b);
            }
        });


        existingBeliefs.forEach(existingBelief => {
            const prop = getProposition(existingBelief);
            const strongest = strongestPerProposition.get(prop);

            // Skip if this belief is not the strongest for its proposition
            if (strongest?.id !== existingBelief.id) return;


            // Skip self
            if (existingBelief.id === newBelief.id) return;

            // Skip already retracted beliefs
            if (existingBelief.status === 'retracted') return;

            const sameProposition = getProposition(existingBelief) === getProposition(newBelief) && getProposition(existingBelief) !== null;;
            const isContradiction = beliefRevisionModule.areContradictory(existingBelief, newBelief);

            // Case 1 — Same proposition, new belief is stronger → REVISE
            if (sameProposition && newBelief.finalConfidence > existingBelief.finalConfidence) {

                const revisionRecord = {
                    timestamp: new Date().toISOString(),
                    type: 'REVISION',
                    reason: 'Stronger evidence arrived for same proposition',
                    oldConfidence: existingBelief.finalConfidence,
                    newConfidence: newBelief.finalConfidence,
                    replacedById: newBelief.id
                };

                beliefStore.updateBelief(existingBelief.id, {
                    status: 'revised',
                    finalConfidence: newBelief.finalConfidence,
                    source: newBelief.source,
                    channelTrust: newBelief.channelTrust,
                    revisions: [...existingBelief.revisions, revisionRecord]
                });

                // console.log(`Belief Revision [REVISE]: "${existingBelief.proposition || existingBelief.content?.text || existingBelief.content?.proposition || 'unknown'}" updated — confidence ${existingBelief.finalConfidence} → ${newBelief.finalConfidence}`);
                revisionLog.push(revisionRecord);
            }

            //  Contradiction AND new belief is stronger → RETRACT old belief
            else if (isContradiction && newBelief.finalConfidence >= existingBelief.finalConfidence) {

                const revisionRecord = {
                    timestamp: new Date().toISOString(),
                    type: 'RETRACTION',
                    reason: 'Contradicted by stronger evidence',
                    retractedProposition: existingBelief.proposition || existingBelief.content?.text || existingBelief.content?.proposition || 'unknown' ,
                    retractedConfidence: existingBelief.finalConfidence,
                    retractedById: newBelief.id,
                    retractedByConfidence: newBelief.finalConfidence
                };

                beliefStore.updateBelief(existingBelief.id, {
                    status: 'retracted',
                    revisions: [...existingBelief.revisions, revisionRecord]
                });

                // console.log(`Belief Revision [RETRACT]: "${existingBelief.proposition || existingBelief.content?.text || existingBelief.content?.proposition || 'unknown'}" retracted — overruled by "${newBelief.proposition || newBelief.content?.text || newBelief.content?.proposition || 'unknown'}" (confidence ${newBelief.finalConfidence})`);
                revisionLog.push(revisionRecord);
            }

            //  New belief is weaker → ignore, log only
            else if (sameProposition && newBelief.finalConfidence <= existingBelief.finalConfidence) {

                const revisionRecord = {
                    timestamp: new Date().toISOString(),
                    type: 'IGNORED',
                    reason: 'Existing belief is stronger — new evidence discarded',
                    existingConfidence: existingBelief.finalConfidence,
                    incomingConfidence: newBelief.finalConfidence
                };

                // console.log(`Belief Revision [IGNORED]: "${newBelief.proposition || newBelief.content?.text || newBelief.content?.proposition || 'unknown'}" discarded — existing belief is stronger (${existingBelief.finalConfidence} > ${newBelief.finalConfidence})`);
                revisionLog.push(revisionRecord);
            }
        });

        // Vyapti Rule Decay (only on SUSPENDED)
        if (inferenceStatus?.status === InferenceStatuses.SUSPENDED
            && inferenceStatus?.reason !== 'FALLACY') { // fallacies won't trigger rule decay, only genuine contradicting observations will do

            const allBeliefs = beliefStore.listBeliefs();
            const allRules = allBeliefs
                .map(b => {
                    const bId = b.proposition || b.content?.text || b.content?.proposition;
                    const newId = newBelief.proposition || newBelief.content?.text || newBelief.content?.proposition;
                    const ruleId = `${bId}_to_${newId}`;
                    return vyaptiStore.getRule(ruleId);
                })
                .filter(Boolean);

            allRules.forEach(rule => {
                const strengthBefore = rule.occurrences;
                const newStrength = Math.floor(rule.occurrences * DECAY_FACTOR);

                vyaptiStore.updateStrength(rule.id, newStrength);

                const decayRecord = {
                    timestamp: new Date().toISOString(),
                    type: 'DECAY',
                    ruleAffected: `${rule.hetu} -> ${rule.sadhya}`,
                    strengthBefore,
                    strengthAfter: newStrength,
                    reason: 'inference SUSPENDED — rule strength decayed',
                    contradictingBeliefId: newBelief.id
                };

                // Write decay into hetu belief's revisions[]
                const hetuBelief = allBeliefs.find(b =>
                    (b.proposition || b.content?.text || b.content?.proposition) === rule.hetu
                );
                if (hetuBelief) {
                    beliefStore.updateBelief(hetuBelief.id, {
                        revisions: [...hetuBelief.revisions, decayRecord]
                    });
                }

                console.log(`Belief Revision [DECAY]: Rule "${rule.hetu} -> ${rule.sadhya}" ${strengthBefore} → ${newStrength}`);
                revisionLog.push(decayRecord);
            });
        }

        return revisionLog.length > 0 ? revisionLog : null;
    },


    areContradictory: (beliefA, beliefB) => {

        const OPPOSING_PAIRS = [
            ['fire', 'no_fire'],
            ['smoke', 'no_smoke'],
            ['wet', 'dry'],
            ['hot', 'cold'],
            ['present', 'absent'],
            ['true', 'false']
        ];

        const tagsA = (beliefA.content?.tags || []).map(t => t.toLowerCase());
        const tagsB = (beliefB.content?.tags || []).map(t => t.toLowerCase());

        const textA = beliefA.proposition?.toLowerCase() ||
            beliefA.content?.text?.toLowerCase() ||
            beliefA.content?.proposition?.toLowerCase() || '';

        const textB = beliefB.proposition?.toLowerCase() ||
            beliefB.content?.text?.toLowerCase() ||
            beliefB.content?.proposition?.toLowerCase() || '';

        return OPPOSING_PAIRS.some(([termA, termB]) =>
            (tagsA.includes(termA) || textA.includes(termA)) &&
            (tagsB.includes(termB) || textB.includes(termB))
            ||
            (tagsA.includes(termB) || textA.includes(termB)) &&
            (tagsB.includes(termA) || textB.includes(termA))
        );
    }
};

module.exports = beliefRevisionModule;


/*
status: 'active'    → belief is current and trusted
status: 'revised'   → same proposition but updated with stronger evidence
status: 'retracted' → contradicted and overruled by stronger belief
 */