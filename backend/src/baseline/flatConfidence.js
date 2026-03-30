const flatConfidence = (payload) => {
    return {
        ...payload,
        finalConfidence: 0.5,
        displayPercentage: 50,
        trace: {
            channelTrust: 'ignored',
            detectionConfidence: 'ignored',
            avgPramana: 'ignored'
        }
    };
};

module.exports = flatConfidence;