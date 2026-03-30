const beliefStore = require('../store/beliefStore');
const vyaptiStore = require('../store/vyaptiStore');

/*
 * Anumana Engine — implements the Nyaya Pancavayava (5-step syllogism)
 * Runs after vyaptiLearner, before tarkaEngine
 * Returns a structured result showing which steps passed or failed
 */
const anumanaEngine = {

    run: (belief, rule) => {

        const result = {
            beliefId: belief.id,
            proposition: belief.proposition,
            steps: {},
            passed: false,
            inferenceConfidence: 0
        };

        // ── Step 1: Pratijña (The Claim) ──────────────────────
        // What are we trying to prove?
        result.steps.pratijña = {
            label: 'Pratijña (Claim)',
            passed: true,
            value: `"${rule.sadhya}" is claimed about this case`
        };

        // ── Step 2: Hetu (The Reason) ─────────────────────────
        // Does the hetu belief actually exist and is it active?
        const hetuBelief = beliefStore.listBeliefs()
            .find(b => b.proposition === rule.hetu);

        if (!hetuBelief || hetuBelief.status !== 'active') {
            result.steps.hetu = {
                label: 'Hetu (Reason)',
                passed: false,
                value: `Hetu "${rule.hetu}" not found or inactive in belief store`
            };
            result.passed = false;
            return result;
        }

        result.steps.hetu = {
            label: 'Hetu (Reason)',
            passed: true,
            value: `"${rule.hetu}" is active — confidence ${hetuBelief.finalConfidence}`
        };

        // ── Step 3: Udaharana (Universal Example) ─────────────
        // Does the vyaptiStore have a rule linking hetu to sadhya?
        const vyaptiRule = vyaptiStore.getRule(rule.id);

        if (!vyaptiRule) {
            result.steps.udaharana = {
                label: 'Udaharana (Universal Example)',
                passed: false,
                value: `No universal rule found for "${rule.hetu} → ${rule.sadhya}"`
            };
            result.inferenceConfidence = hetuBelief.finalConfidence * 0.5;
            result.passed = false;
            return result;
        }

        result.steps.udaharana = {
            label: 'Udaharana (Universal Example)',
            passed: true,
            value: `Rule "${rule.hetu} → ${rule.sadhya}" observed ${vyaptiRule.occurrences} times`
        };

        // ── Step 4: Upanaya (Application to This Case) ────────
        // Does the current belief belong to the same paksa as the hetu?
        const samePaksa = belief.paksa && hetuBelief.paksa
            ? belief.paksa === hetuBelief.paksa
            : true; // if no paksa defined, assume same context

        if (!samePaksa) {
            result.steps.upanaya = {
                label: 'Upanaya (Application)',
                passed: false,
                value: `Paksa mismatch — hetu is from "${hetuBelief.paksa}", current case is "${belief.paksa}"`
            };
            result.passed = false;
            return result;
        }

        result.steps.upanaya = {
            label: 'Upanaya (Application)',
            passed: true,
            value: `Hetu "${rule.hetu}" holds in the current context`
        };

        // ── Step 5: Nigamana (Conclusion) ─────────────────────
        // All steps passed — compute inference confidence
        const ruleStrength = Math.min(vyaptiRule.occurrences / vyaptiRule.threshold, 1.0);
        const inferenceConfidence = parseFloat(
            (hetuBelief.finalConfidence * ruleStrength).toFixed(4)
        );

        result.steps.nigamana = {
            label: 'Nigamana (Conclusion)',
            passed: true,
            value: `"${rule.sadhya}" is concluded with confidence ${inferenceConfidence}`
        };

        result.passed = true;
        result.inferenceConfidence = inferenceConfidence;
        return result;
    }
};

module.exports = anumanaEngine;