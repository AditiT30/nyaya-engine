const vyaptiStore = require('../store/vyaptiStore');
const beliefStore = require('../store/beliefStore');

const vyaptiLearner = {

    //checks for the partner of new belief
    learnFromNewBelief: (newBelief) => {
        // Threshold set to 0.4 to catch strong signals from "noisy" sources like Twitter
        if (newBelief.confidence < 0.2) return null;

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
                existingBelief.content.text,
                newBelief.content.text
            );

            if(rule) return rule;

        }
        return null;
    }

}
module.exports = vyaptiLearner;