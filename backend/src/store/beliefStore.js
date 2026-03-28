//belieStore - Long-term Memory of the Nyaya engine
//using a JavaScript Map because of faster search functionality and effective handling of  unique keys (like a beliefId)

const beliefs = new Map();

/**
 * Belief Structure:
 * { id, proposition, source, pramana, confidence, justifications[], status, revisions[] }
 */
//proposition - raw input , source - o/p of autoDetector.js & sourceDetector.js
//pramana - primary Nyaya category (part of o/p of pramanaMapper.js ) , confidence - blendedConfidence.js
//justifications[] - renamed evidence array (o/p of pramanaMapper.js ) => all these assembled in pipeline

const beliefStore = {

    //key - value(here,function)

    addBelief: (id, beliefData) => {
        const entry = {
            ...beliefData,
            id,
            status: 'active',
            revisions: [],
            createdAt: new Date().toISOString()
        };
        beliefs.set(id, entry);
        return entry;
    },

    getBelief: (id) => {
        return beliefs.get(id);
    },

    updateBelief: (id, updates) => {
        const existing = beliefs.get(id);
        if (!existing) return null;

        // Stored the old version in the revisions array for audit purpose
        const updatedEntry = { //updates after whole block executes {}
            //{...existing  , ...updates , } lays the updates sheet on top of the existing => overwrites different entries
            ...existing,
            ...updates,
            revisions: [...existing.revisions, { ...existing, updatedAt: new Date().toISOString() }]
        };

        beliefs.set(id, updatedEntry);
        return updatedEntry;
    },
    listBeliefs: () => {
        return Array.from(beliefs.values());
    }
};
module.exports = beliefStore;
