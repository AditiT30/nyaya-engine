const tweetChannel = require('./channels/tweetChannel');
const sensorChannel = require('./channels/sensorChannel');
const manualChannel = require('./channels/manualChannel');

//keeping the rules in separate files (channels) and using switch here to keep code clean.

/**
 * Assigns a channel configuration based on the detected source.
 * @param {Object} payload - object containing data and detectionMetadata.
 */

const classifyChannel = (payload) => {

    const source = payload.source;
    let selectedChannel;

    //The Routing Switch
    switch (source) {
        case 'twitter':
            selectedChannel = tweetChannel;
            break;
        case 'sensor':
            selectedChannel = sensorChannel;
            break;
        case 'manual_entry':
            selectedChannel = manualChannel;
            break;
        default:
            // Fallback/Default for unknown data
            // giving it very low trust (0.1) and no special rules
            selectedChannel = {
                channelTrust: 0.1,
                mappingRules: {}
            };
    }

    //Return the "Enhanced" Payload after adding the new trust info.
    return {
        ...payload,
        channelTrust: selectedChannel.channelTrust,
        mappingRules: selectedChannel.mappingRules
    };
};

module.exports = classifyChannel;