const EXAMPLE1 = {
    source: 'twitter',
    id: 1,
    metadata: { source: 'twitter', author: 'hiker_rohan92' },
    content: {
        text: 'Thick black smoke rising from the northern ridge of Aravalli hills. Visible from highway.',
        tags: ['smoke', 'aravalli', 'northern_ridge', 'observation']
    },
    proposition: 'SMOKE_OBSERVED'
}
const EXAMPLE2 = {
    source: 'twitter',
    id: 2,
    metadata: { source: 'twitter', author: 'trekker_priya' },
    content: {
        text: 'Can clearly see flames near the northern ridge. Pretty sure its a forest fire.',
        tags: ['fire', 'flames', 'aravalli', 'northern_ridge', 'observation']
    },
    proposition: 'FIRE_CONFIRMED'
}
const EXAMPLE3 = {
    source: 'sensor',
    id: 3,
    metadata: { source: 'sensor', device_id: 'air_quality_sensor_NR_04' },
    content: {
        raw_reading: 342.7,
        computed_avg: 318.5,
        unit: 'particulate_matter_ppm',
        calibration_note: 'Forest dept sensor — last calibrated 2026-02-10'
    },
    proposition: 'SMOKE_DENSITY_HIGH'
}
const EXAMPLE4 = {
    source: 'sensor',
    id: 4,
    metadata: { source: 'sensor', device_id: 'thermal_imaging_drone_01' },
    content: {
        raw_reading: 847.3,
        computed_avg: 812.6,
        unit: 'celsius_surface_temp',
        calibration_note: 'Drone thermal cam — calibrated 2026-03-01'
    },
    proposition: 'HEAT_SIGNATURE_HIGH'
}
const EXAMPLE5 = {
    source: 'manual_entry',
    id: 5,
    metadata: { source: 'manual_entry', author: 'forest_officer_IFS_sharma' },
    content: {
        proposition: 'Active forest fire confirmed at northern ridge sector 4B',
        reason: 'Smoke density above 300ppm and surface temperature above 800 celsius both observed simultaneously',
        evidence: 'Historical data shows co-occurrence of these readings always indicates active fire in 94% of past incidents',
        pramana_type: 'anumana'
    },
    proposition: 'FIRE_CONFIRMED'
}
const EXAMPLE6 = {
    source: 'twitter',
    id: 6,
    metadata: { source: 'twitter', author: 'news_reporter_ndtv' },
    content: {
        text: 'Smoke density readings have crossed dangerous levels therefore emergency services have been dispatched to Aravalli northern ridge',
        tags: ['smoke', 'emergency', 'aravalli', 'fire_response']
    },
    proposition: 'FIRE_CONFIRMED'
}
const EXAMPLE7 = {
    source: 'twitter',
    id: 7,
    metadata: { source: 'twitter', author: 'weather_bot_imd' },
    content: {
        text: 'Heavy rainfall recorded across Aravalli range. All fire risk indices show zero.',
        tags: ['rainfall_recorded', 'dry_conditions', 'zero_fire_risk', 'aravalli']
    },
    proposition: 'RAINFALL_PRESENT'
}
const EXAMPLE8 = {
    source: 'manual_entry',
    id: 8,
    metadata: { source: 'manual_entry', author: 'ground_team_lead_verma' },
    content: {
        proposition: 'No active fire found at northern ridge sector 4B',
        reason: 'Ground team completed full sector sweep and found only controlled burn by local farmers — not a forest fire',
        evidence: 'Farmers confirmed they had permission for crop residue burning. Smoke misidentified as forest fire.',
        pramana_type: 'pratyaksa'
    },
    proposition: 'NO_FIRE_CONFIRMED'
}
const EXAMPLE9 = {
    source: 'sensor',
    id: 9,
    metadata: { source: 'sensor', device_id: 'fire_detection_grid_NR_07' },
    content: {
        raw_reading: 0,
        computed_avg: 0,
        unit: 'active_flame_detected_boolean',
        calibration_note: 'IR flame detection array — operational 2026-03-15'
    },
    proposition: 'NO_FIRE_CONFIRMED'
}
const EXAMPLE10 = {
    source: 'twitter',
    id: 10,
    metadata: { source: 'twitter', author: 'viral_post_account' },
    content: {
        text: 'BREAKING: Massive forest fire raging at Aravalli hills. Authorities hiding the truth. Share this now.',
        tags: ['fire', 'aravalli', 'breaking', 'viral']
    },
    proposition: 'FIRE_CONFIRMED'
}
const EXAMPLE11 = {
    source: 'manual_entry',
    id: 11,
    metadata: { source: 'manual_entry', author: 'senior_ranger_kulkarni' },
    content: {
        proposition: 'Forest fire likely at Aravalli northern ridge',
        reason: 'Smoke column pattern is similar to Rajasthan wildfire 2024 which was a confirmed 400 hectare fire',
        evidence: 'Shared property — thick black smoke column above ridge line in both cases',
        pramana_type: 'upamana'
    },
    proposition: 'FIRE_CONFIRMED'
};

module.exports = {EXAMPLE1,EXAMPLE2,EXAMPLE3,EXAMPLE4,EXAMPLE5,EXAMPLE6,EXAMPLE7,EXAMPLE8,EXAMPLE9,EXAMPLE10,EXAMPLE11};

/*
1-2   → Social media sparks the investigation (weak, unverified)
3-4   → Sensors independently confirm (high trust, same conclusion)
5     → Forest officer formalizes the inference (rule crosses threshold → PROCEED)
6     → News reporter's language triggers anumana detection
7     → Weather bot introduces contradictory data → engine refuses inference
8     → Ground team retracts the fire belief with direct evidence
9     → Sensor grid independently confirms ground team finding
10    → Viral tweet tries to override everything → engine ignores it*/