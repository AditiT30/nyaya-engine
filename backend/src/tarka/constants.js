
//will include UPMANA later
const PRAMANA_RANKS = {
    PRATYAKSA: 1.0,  // Direct Observation
    ANUMANA: 0.8,    // Logical Inference
    UPAMANA: 0.7,     // comparison — moderate
    SABDA: 0.6       // Verbal Testimony/Claims
};

const CONTRADICTIONS = {
    'rainfall_present': ['fire_confirmed', 'smoke_observed', 'heat_signature_high'],
    'no_fire_confirmed': ['fire_confirmed'],
    'dry_conditions': ['rainfall_present'],
    'no_smoke': ['smoke_observed', 'smoke_density_high'],
    'extinguished': ['fire_confirmed', 'heat_signature_high'],
    'smoke_observed': ['rainfall_present', 'no_smoke'],      // ← add this
    'fire_confirmed': ['no_fire_confirmed', 'rainfall_present'], // ← add this
    'heat_signature_high': ['rainfall_present']
};

module.exports = { PRAMANA_RANKS , CONTRADICTIONS };