const { CONTRADICTIONS } = require('./constants');
const InferenceStatuses = require('./inferenceStatuses');
const beliefStore = require('../store/beliefStore');
//logical fallacies

//array of functions
const hetvabhasaRegistry = [

    // 1.Savyabhicara (Does the Hetu ever appear in the beliefStore without the Sadhya ?)
    {
        name: 'Savyabhicara (Inconstancy)',

        check: (hetu, sadhya) => {
            const history = beliefStore.listBeliefs();

            // Find all beliefs where hetu was the proposition
            const hetuInstances = history.filter(b => b.content.text === hetu);
            if (hetuInstances.length === 0) return false;
            const sadhyaExists = history.some(b => b.content.text === sadhya);
            return hetuInstances.length > 0 && !sadhyaExists;
        }
    },

    //2. Viruddha (Contradiction) (Does the Hetu actually prove the opposite of the Sadhya?)
    {
        name: 'Viruddha (Contradiction)',
        // reason actually proves the opposite.
        check: (hetu, sadhya) => {
            if (!hetu || !sadhya) return false;
            const h = hetu.toLowerCase();
            const s = sadhya.toLowerCase();

            //finding any key in our map that is contained in the hetu string
            const hetuKey = Object.keys(CONTRADICTIONS).find(key => h.includes(key));

            if (hetuKey) {
                const enemies = CONTRADICTIONS[hetuKey];
                // if the Sadhya contains any of those 'Enemies'
                return enemies.some(enemy => s.includes(enemy));
            }
            return false;
        }
    },

    //3. Satpratipaksa (Is there an equally strong, opposite inference already in the store?)
    {
        name: 'Satpratipaksa (Balanced Opposition)',
        check: (hetu, sadhya, store) => {
            return beliefStore.listBeliefs().some(b =>
                b.content.text === `NOT_${sadhya}` &&
                b.status === InferenceStatuses.PROCEED
            );
            }
    },

    //4. Asiddha (Is the Hetu itself actually true right now?)
    {
        name: 'Asiddha (Unestablished)',
        // "reason" itself isn't even proven yet
        check: (hetu, sadhya) => {
            const source = beliefStore.listBeliefs().find(b => b.proposition=== hetu);
            return !source || source.finalConfidence < 0.2 || source.status === InferenceStatuses.SUSPENDED;
        }
    },


    //5. Badhita (Does Direct Perception already prove the conclusion is false?)
    {
        name: 'Badhita (Overruled)',
        //sensor (Direct Perception) already said the conclusion is false.\
        check: (hetu, sadhya, store) => {
            return beliefStore.listBeliefs().some(b =>
                b.content.text === sadhya &&
                b.source === 'sensor' &&
                b.finalConfidence > 0.9 &&
                b.value === false
            );
        }
    }

    ];
module.exports = hetvabhasaRegistry;