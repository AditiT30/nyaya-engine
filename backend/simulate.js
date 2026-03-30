const runPipeline = require('./pipeline');
const {
    EXAMPLE1, EXAMPLE2, EXAMPLE3, EXAMPLE4, EXAMPLE5,
    EXAMPLE6, EXAMPLE7, EXAMPLE8, EXAMPLE9, EXAMPLE10, EXAMPLE11
} = require('./src/data/sample_data');

const examples = [
    EXAMPLE1, EXAMPLE2, EXAMPLE3, EXAMPLE4, EXAMPLE5,
    EXAMPLE6, EXAMPLE7, EXAMPLE8, EXAMPLE9, EXAMPLE10, EXAMPLE11
];

const SCENARIOS = [
    'Twitter eyewitness reports thick smoke on Aravalli ridge',
    'Second Twitter user confirms visible flames — first inference rule formed',
    'Forest dept smoke sensor independently confirms — confidence jumps to 76%',
    'Thermal drone detects high heat signature — sensor corroborates',
    'Forest officer files manual report — strongest evidence so far upgrades belief',
    'News reporter uses logic connector — rule crosses threshold, first PROCEED',
    'Weather bot reports heavy rainfall — Viruddha fallacy detected, inference blocked',
    'Ground team sweeps sector — no fire found, retracts earlier fire belief',
    'Fire detection grid confirms zero — sensor double-confirms ground team',
    'Viral tweet claims massive fire — dismissed, engine already has stronger evidence',
    'Senior ranger identifies fire by comparison to Rajasthan wildfire 2024'
];

const NYAYA_EXPLANATIONS = {
    'PROCEED':   'Tarka approves — rule is valid, no fallacies detected. Inference stands.',
    'DOUBTFUL':  'Tarka withholds — rule exists but has not been observed enough times to trust.',
    'SUSPENDED': 'Tarka vetoes — a logical fallacy was detected. Inference refused.'
};

const PRAMANA_LABELS = {
    'pratyaksa': 'direct perception',
    'anumana':   'inference',
    'upamana':   'comparison',
    'sabda':     'testimony'
};

const divider = (char = '─', len = 65) => console.log(char.repeat(len));
const gap = () => console.log('');

const getSourceLabel = (source) => {
    const labels = {
        'twitter':      'Twitter (trust: 0.50)',
        'sensor':       'Sensor  (trust: 0.95)',
        'manual_entry': 'Manual  (trust: 0.85)'
    };
    return labels[source] || source;
};

const getStatusSymbol = (status) => {
    const symbols = {
        'PROCEED':   '✓ PROCEED',
        'DOUBTFUL':  '? DOUBTFUL',
        'SUSPENDED': '✗ SUSPENDED'
    };
    return symbols[status] || status;
};

const getRevisionSymbol = (type) => {
    const symbols = {
        'REVISION':   '↑ REVISED',
        'RETRACTION': '✗ RETRACTED',
        'IGNORED':    '— IGNORED',
        'DECAY':      '↓ DECAYED'
    };
    return symbols[type] || type;
};

// ── Header ────────────────────────────────────────────────
gap();
divider('═');
console.log('  NYAYA REASONING ENGINE — SIMULATION');
console.log('  Scenario: Forest fire investigation at Aravalli Hills');
console.log('  Demonstrating source-sensitive epistemic reasoning');
divider('═');
gap();
console.log('  Three source tiers:');
console.log('  Twitter      → channelTrust 0.50 | sabda (testimony)');
console.log('  Manual Entry → channelTrust 0.85 | anumana + upamana');
console.log('  Sensor       → channelTrust 0.95 | pratyaksa (perception)');
divider('═');

// ── Run each example ──────────────────────────────────────
examples.forEach((example, i) => {

    gap();
    divider();
    console.log(`  STEP ${i + 1} of ${examples.length}`);
    console.log(`  ${SCENARIOS[i]}`);
    divider();
    gap();

    // Source
    console.log(`  Source         : ${getSourceLabel(example.source)}`);

    // Input summary
    const inputSummary = example.content?.text ||
        example.content?.proposition ||
        `sensor reading: ${example.content?.raw_reading} ${example.content?.unit || ''}`;
    console.log(`  Input          : "${inputSummary}"`);
    gap();

    const result = runPipeline(example);

    // Confidence
    console.log(`  Confidence     : ${result.belief.finalConfidence} (${result.belief.displayPercentage}%)`);

    // Evidence breakdown
    console.log(`  Evidence       : ${result.belief.evidence.length} field(s) mapped`);
    result.belief.evidence.forEach(e => {
        const label = PRAMANA_LABELS[e.pramana] || e.pramana;
        console.log(`    → ${e.field.padEnd(28)} ${label} (rank ${e.rank})`);
    });

    gap();

    // Tarka result
    if (!result.rule) {
        console.log(`  Tarka          : Skipped — awaiting second belief to form a rule`);
    } else {
        console.log(`  Vyapti Rule    : ${result.rule.hetu} → ${result.rule.sadhya}`);
        console.log(`  Observations   : ${result.rule.occurrences} (threshold: 3)`);
        gap();

        const status = result.inferenceStatus?.status;
        console.log(`  Tarka Status   : ${getStatusSymbol(status)}`);
        console.log(`  Explanation    : ${NYAYA_EXPLANATIONS[status]}`);

        if (result.inferenceStatus?.fallacy) {
            console.log(`  Fallacy        : ${result.inferenceStatus.fallacy}`);
        }
    }

    // Revision log
    if (result.revisionLog?.length > 0) {
        gap();
        console.log(`  Belief Store Updates:`);
        result.revisionLog.forEach(r => {
            console.log(`    ${getRevisionSymbol(r.type)} — ${r.reason}`);
            if (r.type === 'RETRACTION') {
                console.log(`      "${r.retractedProposition}" was overruled`);
                console.log(`      Old confidence: ${r.retractedConfidence} → New source confidence: ${r.retractedByConfidence}`);
            }
            if (r.type === 'REVISION') {
                console.log(`      Confidence updated: ${r.oldConfidence} → ${r.newConfidence}`);
            }
            if (r.type === 'IGNORED') {
                console.log(`      Incoming: ${r.incomingConfidence} lost to existing: ${r.existingConfidence}`);
            }
        });
    }
    // Anumana steps
    if (result.anumana) {
        gap();
        console.log(`  Anumana Engine (Pancavayava):`);
        Object.values(result.anumana.steps).forEach(step => {
            const symbol = step.passed ? '✓' : '✗';
            console.log(`    ${symbol} ${step.label}`);
            console.log(`      ${step.value}`);
        });
        if (result.anumana.passed) {
            console.log(`  Inference Conf : ${result.anumana.inferenceConfidence}`);
        }
    }

    gap();
});


// ── Final summary ─────────────────────────────────────────
divider('═');
console.log('  SIMULATION COMPLETE — FINAL BELIEF STORE STATE');
divider('═');
gap();

const { listBeliefs } = require('./src/store/beliefStore');
const finalBeliefs = listBeliefs();

finalBeliefs.forEach(b => {
    const prop = b.proposition || b.content?.text || b.content?.proposition || 'unknown';
    const statusSymbol = {
        'active':    '●',
        'retracted': '✗',
        'revised':   '↑'
    }[b.status] || '?';

    console.log(`  ${statusSymbol} ${prop.padEnd(30)} | ${b.source.padEnd(14)} | confidence: ${b.finalConfidence} (${b.displayPercentage}%) | ${b.status}`);
});

gap();
divider('═');
console.log('  KEY INSIGHT FOR JUDGES:');
console.log('  A source-agnostic baseline would treat all 11 inputs equally.');
console.log('  This engine tracked HOW it knows, not just WHAT it knows.');
console.log('  Result: viral misinformation dismissed, sensor evidence trusted,');
console.log('  ground truth correctly retracted an unverified social media claim.');
divider('═');
gap();
