//In Nyaya, Vyapti is the "Universal Relation"
//beliefStore handles Facts,vyaptiStore handles Logic

const rules = new Map();

/**
  Vyapti Structure:{ id, hetu (reason), sadhya (conclusion), occurrences, threshold, isValid }
 **/
const vyaptiStore = {

    addObservation: (hetu, sadhya) => {
        const id = `${hetu}_to_${sadhya}`; //H->S (potential rule)
        const existing = rules.get(id);

        if (existing) {
            return vyaptiStore.updateStrength(id, existing.occurrences + 1);
        } else {

            const newRule = {
                id, //With id inside , object carries its own identity wherever it goes in code
                hetu,
                sadhya,
                occurrences: 1,
                threshold: 5, // Requires 5 sightings to be "Valid"
                isValid: false
            };
            rules.set(id, newRule); //outside id acts as key in the Map
            return newRule;
        }
    },


    getRule: (id) => {
        return rules.get(id);
    },

    // 3. Update the strength and check validity
    updateStrength: (id, newCount) => {
        const rule = rules.get(id);
        if (!rule) return null;

        const updatedRule = {
            ...rule,
            occurrences: newCount, ////overwrites the old count with the new one
            isValid: newCount >= rule.threshold
        };

        rules.set(id, updatedRule);
        return updatedRule;
    }
};

module.exports = vyaptiStore;