const { PRAMANA_RANKS } = require('../tarka/constants');

//raw data ----> structured Nyaya evidence
const mapPramanas = (payload) => {

    // Destructured to get rules and kept the rest(rem. payload + channelTrust) as data
    const { mappingRules, ...data } = payload;
    const evidence = [];

    Object.keys(mappingRules).forEach(fieldName => {
        // checking if the incoming data actually has this field
        const valueFound = data[fieldName];
        if (valueFound !== undefined) {
            // identifying the type of pramana based on mapping rules
            const type = mappingRules[fieldName];

            // create the "Evidence" object and save it
            const evidenceStamp = {
                field: fieldName,
                value: valueFound,
                pramana: type,
                rank: PRAMANA_RANKS[type.toUpperCase()] || 0.5
            };
            evidence.push(evidenceStamp);
    }

    });
  //pattern hunting - look for "Logic Words" in data
  //data=initial payload +  channelTrust
  //keeping the search source agnostic so that it works even if we don't know the field names
    const allText = JSON.stringify(data).toLowerCase();

    // Checking if the user used words like "because" or "so"
    const isTryingToProveSomething = /\b(because|so|therefore|hence)\b/.test(allText);
    if (isTryingToProveSomething) {
        // Added a "Logic Stamp" to our evidence list
        evidence.push({
            field: "logic_connector",
            value: "detected",
            pramana: "anumana",
            rank: PRAMANA_RANKS.ANUMANA // Usually 0.8
        });
    }

    // final result
        return {
            ...data,
            detectionMetadata: payload.detectionMetadata,
            channelTrust: payload.channelTrust,
            //Added our newly created list of "Stamps"
            evidence: evidence
        };
}
module.exports = mapPramanas;