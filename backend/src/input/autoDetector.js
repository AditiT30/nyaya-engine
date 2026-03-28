const autoDetectSource = (payload) => {

    //list of all keys in the JSON
    const keys = Object.keys(payload);

    //score for each possible source type
    let scores = {
        twitter : 0,
        sensor : 0,
        manual_entry : 0
    }

    //length can also be included as clue in all these
    //Clues for Twitter
    if(keys.includes('handle') || keys.includes('username') )
        scores.twitter +=0.4;
    if(keys.includes('tweet_text') || keys.includes('hashtags') )
        scores.twitter +=0.4;

    //Clues for Sensor
    if(keys.includes('reading') || keys.includes('value') )
        scores.sensor +=0.4;
    if(keys.includes('unit') || keys.includes('sensor_id') )
        scores.sensor +=0.4;
    if (typeof payload.value === 'number')
        scores.sensor += 0.1;

    //Clues for manual entry ((Nyaya/Formal Logic Pattern)
    if (keys.includes('reason') || keys.includes('hetu'))
        scores.manual_entry += 0.3;
    if (keys.includes('major_term') || keys.includes('sadhya'))
        scores.manual_entry += 0.3;
    if (keys.includes('proposition') || keys.includes('pratijna'))
        scores.manual_entry += 0.3;

    //Most probable source selection
    const sortedSources = Object.entries(scores).sort((a,b) => b[1] - a[1]);
    const [bestMatch, highestScore] = sortedSources[0];

    //confidence calculation
    //We use a base confidence but penalize if the highest score is too close to the next highest
    const margin = highestScore - (sortedSources[1][1]);
    let baseConfidence=highestScore;

    if(margin <=0.1) baseConfidence -= 0.1;

    // to Clamp between 0.6 and 0.9
    const detectionConfidence = Math.min(Math.max(baseConfidence, 0.6), 0.9);
    return {
        source: bestMatch,
        detectionConfidence: parseFloat(detectionConfidence.toFixed(2)),
        method: 'heuristic',
        analysis: scores // for the "Reasoning Trace"
    };
};

module.exports = autoDetectSource;