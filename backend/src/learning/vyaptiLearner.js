const vyaptiStore = require('../store/vyaptiStore');
const beliefStore = require('../store/beliefStore');

const getIdentifier = (belief) => { //TO OBTAIN values corresponding to different types of keys
    return belief.proposition ||
        belief.content?.text ||
        belief.content?.proposition ||
        String(belief.content?.raw_reading) ||
        `belief_${belief.id}`;
};

const vyaptiLearner = {

    //checks for the partner of new belief
    learnFromNewBelief: (newBelief) => {
        // Threshold set to 0.2 to catch strong signals from "noisy" sources like Twitter
        if (newBelief.finalConfidence < 0.2) return null;

        const activeBeliefs = beliefStore.listBeliefs();

        //forEach loop ignores return values
        for(const existingBelief of activeBeliefs) {
            // to avoid linking a belief to itself
            if (existingBelief.id === newBelief.id) continue;

            // to avoid linking to other "unreliable" beliefs currently in memory
            if (existingBelief.finalConfidence < 0.2) continue;

            // link them in the VyaptiStore (Hetu -> Sadhya)
            //increments the count and checks if the rule becomes 'isValid'
            const rule = vyaptiStore.addObservation(
                //used getIdentifier as "keys" vary in  diff. payloads
                getIdentifier(existingBelief),
                getIdentifier(newBelief)
            );

            if(rule) return rule;

        }
        return null;
    }

}
module.exports = vyaptiLearner;