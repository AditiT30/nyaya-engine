//Custom Middleware function for Express
//gatekeeper for API routes, ensures that incoming data is valid before the server processes it
const validator = (req, res, next) => {
    const { source, id, content } = req.body;

    if (!source) {
        return res.status(400).json({ error: 'Missing required field: source' });
    }
    if (!id) {
        return res.status(400).json({ error: 'Missing required field: id' });
    }
    if (!content) {
        return res.status(400).json({ error: 'Missing required field: content' });
    }

    next();
};

module.exports = validator;
