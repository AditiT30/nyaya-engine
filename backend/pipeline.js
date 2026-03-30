const detectExplicitSource = require('./src/input/sourceDetector');
const autoDetectSource = require('./src/input/autoDetector');
const classifyChannel = require('./src/classifier/channelClassifier');
const mapPramanas = require('./src/classifier/pramanaMapper');
const calculateBlendedConfidence = require('./src/confidence/blendedConfidence'); // Added ./
const beliefStore = require('./src/store/beliefStore');
const vyaptiLearner = require('./src/learning/vyaptiLearner');
const vyaptiStore = require('./src/store/vyaptiStore');
const tarkaEngine = require('./src/tarka/tarkaEngine');
const beliefRevisionModule = require('./src/revision/beliefRevisionModule');
const anumanaEngine = require('./src/anumana/anumanaEngine');

//payload contains - rawInput
const runPipeline = (rawInput) => {
    let detectionMetadata = detectExplicitSource(rawInput);

    if (detectionMetadata == null) detectionMetadata = autoDetectSource(rawInput);


    let PAYLOAD = {
        ...rawInput,
        ...detectionMetadata
    } //keys of detection metadata t/f

//payload contains - rawInput + source, detectionConfidence , method

    PAYLOAD = classifyChannel(PAYLOAD);

    /*payload contains -> rawInput , source, detectionConfidence ,
    method , channelTrust , mapping rules
     */

    PAYLOAD = mapPramanas(PAYLOAD);

    /*payload contains -> rawInput , source, detectionConfidence ,
    method , channelTrust , evidence object (cont. each evidence having fieldName, value , pramana , rank )
     */

    PAYLOAD = calculateBlendedConfidence(PAYLOAD);

    /*payload contains -> rawInput , source, detectionConfidence ,
    method , channelTrust , evidence object , finalConfidence , displayPercentage , trace
     */


    const primaryBelief = beliefStore.addBelief(rawInput.id, PAYLOAD);

    /*primaryBelief contains -> PAYLOAD , id , status , revisions , createdAt
 */

   let rule = vyaptiLearner.learnFromNewBelief(primaryBelief);

    // Guard — no rule yet, skip tarka engine on first belief
    if (rule == null) {
        return {
            belief: primaryBelief,
            rule: null,
            anumana: null,
            inferenceStatus: null,
            revisionLog: null
        };
    }

    const anumanaResult = anumanaEngine.run(primaryBelief, rule);
    let inferenceStatus = tarkaEngine.validateInference(rule.hetu , rule.sadhya );
    const revisionLog = beliefRevisionModule.revise(primaryBelief, inferenceStatus);

    return {
        belief: primaryBelief,
        rule,
        anumana: anumanaResult,
        inferenceStatus,
        revisionLog
    };

}

module.exports = runPipeline;


















