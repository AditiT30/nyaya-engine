const detectExplicitSource = require('./src/input/sourceDetector');
const autoDetectSource = require('./src/input/autoDetector');
const flatConfidence = require('./src/baseline/flatConfidence');
const beliefStore = require('./src/store/beliefStore');
const vyaptiLearner = require('./src/learning/vyaptiLearner');
const naiveTarkaEngine = require('./src/baseline/naiveTarkaEngine');

const runBaseline = (rawInput) => {

    let detectionMetadata = detectExplicitSource(rawInput);
    if (detectionMetadata == null) detectionMetadata = autoDetectSource(rawInput);

    // Flat confidence — no source weighting, no pramana mapping
    let PAYLOAD = {
        ...rawInput,
        ...detectionMetadata,
        channelTrust: 0.5,        // flat for everyone
        evidence: [],             // no evidence mapping
        mappingRules: {}          // no rules
    };

    PAYLOAD = flatConfidence(PAYLOAD);

    // Use a different id namespace so baseline beliefs don't clash with Nyaya beliefs
    const baselineId = `baseline_${rawInput.id}`;
    const primaryBelief = beliefStore.addBelief(baselineId, PAYLOAD);

    const rule = vyaptiLearner.learnFromNewBelief(primaryBelief);

    if (rule == null) {
        return {
            belief: primaryBelief,
            rule: null,
            inferenceStatus: null,
            revisionLog: null
        };
    }

    // No belief revision — baseline never retracts or ignores
    const inferenceStatus = naiveTarkaEngine.validateInference(rule.hetu, rule.sadhya);

    return {
        belief: primaryBelief,
        rule,
        inferenceStatus,
        revisionLog: null  // baseline never revises
    };
};

module.exports = runBaseline;