const vyaptiStore = require('../store/vyaptiStore');
const hetvabhasaRegistry = require('./hetvabhasaRegistry');
const InferenceStatuses = require('./inferenceStatuses');

const tarkaEngine = {
    /**
     * The core validation method: Should we infer Sadhya from Hetu?
     * @param {string} hetu - The reason (The 'Sign')
     * @param {string} sadhya - The conclusion (The 'Target')
     * @returns {string} - An InferenceStatus (PROCEED, DOUBTFUL, or SUSPENDED)
     */

    validateInference: (hetu, sadhya) => {
        // console.log(hetu,sadhya);

        const ruleId = `${hetu}_to_${sadhya}`;
        const rule = vyaptiStore.getRule(ruleId);

        //running all hetvabhasaRegistry matchers
        // If ANY fallacy is detected, we "Veto" the logic immediately
        const detectedFallacy = hetvabhasaRegistry.find(fallacy =>
            fallacy.check(hetu, sadhya)
        );
        if (detectedFallacy) {
            // console.warn(`Tarka Veto: ${detectedFallacy.name} detected for ${hetu} -> ${sadhya}`);
            return {
                status: InferenceStatuses.SUSPENDED,
                reason: 'FALLACY',
                fallacy: detectedFallacy.name
            };
        }

        // If the rule doesn't exist or hasn't hit the threshold
        if (!rule || !rule.isValid) {
            // console.log(`Tarka Doubt: Rule ${ruleId} is weak or unproven.`);
            return {
                status: InferenceStatuses.DOUBTFUL,
                reason: 'WEAK_RULE',
                fallacy: null
            };
        }

        //Strong Rule + No Fallacies
        // console.log(`Tarka Approved: ${hetu} -> ${sadhya} is logically correct.`);
        return {
            status: InferenceStatuses.PROCEED,
            reason: 'VALID',
            fallacy: null
        };


    }

}

module.exports = tarkaEngine;