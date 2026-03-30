const sensorChannel = {
    channelTrust: 0.95,
    mappingRules: {
        'content.raw_reading': 'pratyaksa',
        'content.computed_avg': 'anumana',
        'content.calibration_note': 'sabda'
    }
};

module.exports = sensorChannel;