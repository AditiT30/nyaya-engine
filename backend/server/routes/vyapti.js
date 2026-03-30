const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    try {
        const vyaptiStore = require('../../src/store/vyaptiStore');
        const rules = vyaptiStore.listRules();
        res.json({ success: true, count: rules.length, rules });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;