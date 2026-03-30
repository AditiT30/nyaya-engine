const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    try {
        const beliefStore = require('../../src/store/beliefStore');
        const beliefs = beliefStore.listBeliefs();
        res.json({ success: true, count: beliefs.length, beliefs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;