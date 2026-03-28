//sources supported by engine
const VALID_SOURCES = ["twitter","sensor","manual_entry"];

/** JSON Object sent from the frontend
@param {Object} payload
*/

const detectExplicitSource = (payload)=>{

    //looking up for source key in json object "payload"
    const source = payload.source || (payload.metadata && payload.metadata.source);


    if(source && VALID_SOURCES.includes(source)){
        return {
            source: source,
            detectionConfidence: 1.0,
            method: 'explicit'
        };
    }
    //no source was found , "null" signals the pipeline to move to "Auto-Detect"
    return null;
}

module.exports = detectExplicitSource;