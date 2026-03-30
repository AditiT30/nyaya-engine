const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    try {
        const beliefStore = require('../../src/store/beliefStore');
        const vyaptiStore = require('../../src/store/vyaptiStore');

        const beliefs = beliefStore.listBeliefs();
        const rules   = vyaptiStore.listRules();

        // Build a simple trace — nodes and edges
        const nodes = beliefs.map(b => ({
            id: b.id,
            proposition: b.proposition,
            source: b.source,
            confidence: b.finalConfidence,
            status: b.status,
            pramana: b.evidence?.[0]?.pramana || 'unknown'
        }));

        const edges = rules.map(r => ({
            from: r.hetu,
            to: r.sadhya,
            occurrences: r.occurrences,
            isValid: r.isValid
        }));

        res.json({ success: true, nodes, edges });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;