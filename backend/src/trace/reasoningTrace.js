
const createTrace = () => ({
    nodes: [],
    edges: []
});

const reasoningTrace = {
    /**
     * Adds a stage to the trace and links it to the previous stage.
     * @param {Object} trace - The current trace object.
     * @param {string} id - Unique ID for this node (e.g., 'input_1', 'tarka_1').
     * @param {string} label - Display name (e.g., 'Tweet Input').
     * @param {string} type - 'input', 'process', 'inference', or 'error'.
     * @param {Object} data - Metadata (confidence scores, fallacy names, etc).
     */
    addStep: (trace, id, label, type, data = {}) => {
        const newNode = { id, label, type, data };

        // 1. Add the new node
        trace.nodes.push(newNode);

        // 2. If there's a previous node, create a directed edge to the new one
        if (trace.nodes.length > 1) {
            const previousNode = trace.nodes[trace.nodes.length - 2];
            trace.edges.push({
                id: `e_${previousNode.id}_${id}`,
                source: previousNode.id,
                target: id,
                label: data.transition || 'processed'
            });
        }

        return trace;
    }
};

module.exports = { createTrace, reasoningTrace };