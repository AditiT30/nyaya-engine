const vyaptiStore = require('../store/vyaptiStore');
const InferenceStatuses = require('../tarka/inferenceStatuses');

const naiveTarkaEngine = {
    validateInference: (hetu, sadhya) => {
        const ruleId = `${hetu}_to_${sadhya}`;
        const rule = vyaptiStore.getRule(ruleId);

        // No fallacy checks — accepts everything
        if (!rule || !rule.isValid) {
            return {
                status: InferenceStatuses.DOUBTFUL,
                reason: 'WEAK_RULE',
                fallacy: null
            };
        }

        return {
            status: InferenceStatuses.PROCEED,
            reason: 'VALID',
            fallacy: null
        };
    }
};

module.exports = naiveTarkaEngine;