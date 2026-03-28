const runPipeline = require('./pipeline');
const { PAYLOAD2, PAYLOAD1 } = require('./src/data/sample_data');


runPipeline(PAYLOAD1);
runPipeline(PAYLOAD2);