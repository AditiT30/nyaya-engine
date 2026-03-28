const PAYLOAD1 = {
    source: "twitter",
    id: 1,
    metadata: { "source": "tweet", "author": "eyewitness" },
    content: {
        text: "SMOKE",
        tags: ["smoke", "hill", "observation"]
    },
}

const PAYLOAD2 = {
    source: "twitter",
    id: 2,
    metadata: { "source": "tweet", "author": "eyewitness" },
    content: {
        text: "FIRE",
        tags: ["fire", "hill", "observation"]
    },
}
module.exports = {PAYLOAD1, PAYLOAD2};