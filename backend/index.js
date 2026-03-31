const app = require('./server/app');
console.log(__dirname)
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Nyaya Engine API running on http://localhost:${PORT}`);
    console.log(`Open: http://localhost:${PORT}`);
});



/*const runPipeline = require('./pipeline');
const {EXAMPLE1,EXAMPLE2,EXAMPLE3,EXAMPLE4,EXAMPLE5,EXAMPLE6,EXAMPLE7,EXAMPLE8,EXAMPLE9,EXAMPLE10, EXAMPLE11} = require('./src/data/sample_data');

const examples =[EXAMPLE1,EXAMPLE2,EXAMPLE3,EXAMPLE4,EXAMPLE5,EXAMPLE6,EXAMPLE7,EXAMPLE8,EXAMPLE9,EXAMPLE10,EXAMPLE11];

examples.forEach((example, i) => {

    console.log(`\n${'─'.repeat(60)}`); //divider line of 60 dashes
    console.log(`EXAMPLE ${i + 1} | Source: ${example.source} | "${example.content?.text || example.content?.proposition || example.content?.raw_reading}"`); //example header

    const result = runPipeline(example); //Runs the full Nyaya pipeline & stores the returned object { belief, rule, inferenceStatus, revisionLog }

    console.log(`Confidence : ${result.belief.finalConfidence} (${result.belief.displayPercentage}%)`); //blended confidence score and its percentage form

    console.log(`Evidence : ${result.belief.evidence.length} field(s) mapped`);
    result.belief.evidence.forEach(e => console.log(`  → ${e.field} = ${e.pramana} (rank ${e.rank})`));

    if (!result.rule) {
        console.log(`Tarka  : skipped — no rule formed yet`);
    } else {
        console.log(`Rule          : ${result.rule.hetu} → ${result.rule.sadhya} (occurrences: ${result.rule.occurrences})`);
        console.log(`Tarka Status  : ${result.inferenceStatus?.status}`);
        if (result.inferenceStatus?.fallacy) console.log(`Fallacy       : ${result.inferenceStatus.fallacy}`);
    }
    if (result.revisionLog) {
        result.revisionLog.forEach(r => console.log(`Revision      : [${r.type}] ${r.reason}`));
    }
});*/