const autoDetectSource = (payload) => {

    const keys = Object.keys(payload); //returns the top-level keys of the object as strings

    // Also scan keys inside content if it exists
    const contentKeys = payload.content ? Object.keys(payload.content) : [];
    const allKeys = [...keys, ...contentKeys];

    let scores = { twitter: 0, sensor: 0, manual_entry: 0 };

    // Twitter clues
    if (allKeys.includes('handle') || allKeys.includes('username')) scores.twitter += 0.3;
    if (allKeys.includes('tweet_text') || allKeys.includes('hashtags')) scores.twitter += 0.4;
    if (allKeys.includes('text') || allKeys.includes('tags')) scores.twitter += 0.4;
    if (payload.metadata?.author && !allKeys.includes('raw_reading')) scores.twitter += 0.2;

    // Sensor clues
    if (allKeys.includes('reading') || allKeys.includes('value')) scores.sensor += 0.4;
    if (allKeys.includes('unit') || allKeys.includes('sensor_id')) scores.sensor += 0.4;
    if (allKeys.includes('raw_reading') || allKeys.includes('computed_avg')) scores.sensor += 0.5;
    if (allKeys.includes('calibration_note')) scores.sensor += 0.3;
    if (typeof payload.content?.raw_reading === 'number') scores.sensor += 0.2;

    // Manual entry clues
    if (allKeys.includes('reason') || allKeys.includes('hetu')) scores.manual_entry += 0.3;
    if (allKeys.includes('major_term') || allKeys.includes('sadhya')) scores.manual_entry += 0.3;
    if (allKeys.includes('proposition') || allKeys.includes('pratijna')) scores.manual_entry += 0.4;
    if (allKeys.includes('pramana_type')) scores.manual_entry += 0.4;
    if (allKeys.includes('evidence') && allKeys.includes('reason')) scores.manual_entry += 0.3;

    const sortedSources = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [bestMatch, highestScore] = sortedSources[0];

    const margin = highestScore - sortedSources[1][1]; //to evaluate how much "better" the winner is compared to the runner-up & determine result trust level
    let baseConfidence = highestScore;
    if (margin <= 0.1) baseConfidence -= 0.1;

    const detectionConfidence = Math.min(Math.max(baseConfidence, 0.6), 0.9);

    return {
        source: bestMatch,
        detectionConfidence: parseFloat(detectionConfidence.toFixed(2)),
        method: 'heuristic',
        analysis: scores
    };
};

module.exports = autoDetectSource;