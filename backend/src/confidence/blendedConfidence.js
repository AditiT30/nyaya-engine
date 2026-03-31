//Merges source reliability, detection certainty and Nyaya pramana ranks into a single unified confidence score

const calculateBlendedConfidence = (payload) => {
    const {channelTrust, detectionConfidence, evidence} = payload;

    //Calculate the Average Quality of Evidence (Pramana Rank)
    //'s' (accumulator) starts at 0 , 'e' (element) is each piece of evidence
    const avgPramana = evidence.length
        ? evidence.reduce((s, e) => s + e.rank, 0) / evidence.length
        : 0.5; //neutral weight to avoid dividing by zero
    //Core Formula
    const score = channelTrust * detectionConfidence * avgPramana;

    return {
        ...payload,
        finalConfidence: Number(score.toFixed(4)),
        displayPercentage: Math.round(score * 100),
        trace: {
            channelTrust,
            detectionConfidence,
            avgPramana
        }
    }
}
module.exports = calculateBlendedConfidence;