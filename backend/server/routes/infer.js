const express = require('express');
const router = express.Router();

// GET /api/infer/simulate — runs pipeline directly and streams output
router.get('/simulate', (req, res) => {

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (line) => {
        res.write(`data: ${JSON.stringify(line)}\n\n`);
    };

    try {
        const runPipeline = require('../../pipeline');
        const { EXAMPLE1, EXAMPLE2, EXAMPLE3, EXAMPLE4, EXAMPLE5,
            EXAMPLE6, EXAMPLE7, EXAMPLE8, EXAMPLE9, EXAMPLE10,
            EXAMPLE_UPAMANA } = require('../../src/data/sample_data');

        const examples = [
            EXAMPLE1, EXAMPLE2, EXAMPLE3, EXAMPLE4, EXAMPLE5,
            EXAMPLE6, EXAMPLE7, EXAMPLE8, EXAMPLE9, EXAMPLE10,
            EXAMPLE_UPAMANA
        ];

        const SCENARIOS = [
            'Twitter eyewitness reports thick smoke on Aravalli ridge',
            'Second Twitter user confirms visible flames',
            'Forest dept smoke sensor confirms — confidence jumps to 76%',
            'Thermal drone detects high heat signature',
            'Forest officer files manual report',
            'News reporter uses logic connector — first PROCEED',
            'Weather bot reports heavy rainfall — Viruddha fallacy detected',
            'Ground team sweeps sector — no fire found, RETRACT fires',
            'Fire detection grid confirms zero — sensor double-confirms',
            'Viral tweet claims massive fire — dismissed',
            'Senior ranger identifies fire by comparison — Upamana detected'
        ];

        send('═'.repeat(60));
        send('  NYAYA REASONING ENGINE — LIVE SIMULATION');
        send('═'.repeat(60));

        examples.forEach((example, i) => {
            send('');
            send('─'.repeat(60));
            send(`  STEP ${i + 1} of ${examples.length} — ${SCENARIOS[i]}`);
            send('─'.repeat(60));

            const result = runPipeline(example);

            const input = example.content?.text ||
                example.content?.proposition ||
                `sensor reading: ${example.content?.raw_reading}`;

            send(`  Source     : ${example.source} (trust: ${result.belief.channelTrust})`);
            send(`  Input      : "${input}"`);
            send(`  Confidence : ${result.belief.finalConfidence} (${result.belief.displayPercentage}%)`);
            send(`  Evidence   : ${result.belief.evidence.length} field(s) mapped`);

            result.belief.evidence.forEach(e => {
                send(`    → ${e.field} = ${e.pramana} (rank ${e.rank})`);
            });

            if (!result.rule) {
                send(`  Tarka      : Skipped — awaiting second belief`);
            } else {
                send('');
                send(`  Vyapti Rule : ${result.rule.hetu} → ${result.rule.sadhya} (observations: ${result.rule.occurrences})`);
                const status = result.inferenceStatus?.status;
                send(`  Tarka Status: ${status}`);
                if (result.inferenceStatus?.fallacy) {
                    send(`  Fallacy     : ${result.inferenceStatus.fallacy}`);
                }
            }

            if (result.revisionLog?.length > 0) {
                send('');
                result.revisionLog.forEach(r => {
                    send(`  Revision    : [${r.type}] ${r.reason}`);
                });
            }

            if (result.anumana?.passed) {
                send('');
                send(`  Anumana (Pancavayava):`);
                Object.values(result.anumana.steps).forEach(step => {
                    send(`    ${step.passed ? '✓' : '✗'} ${step.label}: ${step.value}`);
                });
                send(`  Inference Confidence: ${result.anumana.inferenceConfidence}`);
            }

            send('');
        });

        send('═'.repeat(60));
        send('  SIMULATION COMPLETE');
        send('═'.repeat(60));

    } catch (err) {
        send(`ERROR: ${err.message}`);
    }

    res.write(`data: ${JSON.stringify('__DONE__')}\n\n`);
    res.end();
});

// POST /api/infer — single input
router.post('/', (req, res) => {
    try {
        const runPipeline = require('../../pipeline');
        const result = runPipeline(req.body);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;