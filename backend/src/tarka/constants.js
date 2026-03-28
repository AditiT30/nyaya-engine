
//will include UPMANA later
const PRAMANA_RANKS = {
    PRATYAKSA: 1.0,  // Direct Observation
    ANUMANA: 0.8,    // Logical Inference
    SABDA: 0.6       // Verbal Testimony/Claims
};

const CONTRADICTIONS = {
    // Thermal Opposites
    'hot': ['cold', 'freezing', 'icy', 'chilled', 'cool'],
    'fire': ['water', 'extinguished', 'damp', 'wet'],

    // Status/Presence Opposites
    'present': ['absent', 'missing', 'void', 'null', 'none'],
    'active': ['idle', 'stopped', 'broken', 'offline', 'disabled'],
    'on': ['off', 'shutdown', 'deactivated'],

    // Temporal/Environmental
    'day': ['night', 'darkness', 'midnight'],
    'dry': ['wet', 'flooded', 'rainy', 'soaked'],

    // Safety/Logic
    'safe': ['danger', 'threat', 'hazard', 'alert'],
    'true': ['false', 'denied', 'rejected']
};


module.exports = { PRAMANA_RANKS , CONTRADICTIONS };