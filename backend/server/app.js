const express = require('express');
const cors = require('cors');
const path = require('path');

const inferRoute   = require('./routes/infer'); //Handles inference logic
const beliefsRoute = require('./routes/beliefs'); //Handles belief data
const vyaptiRoute  = require('./routes/vyapti'); //Handles universal relation logic
const traceRoute   = require('./routes/trace'); //Handles execution tracing)

const app = express();

app.use(cors());
app.use(express.json()); //built-in parser that allows the server to read and understand JSON data

// Serves React frontend from public folder
const frontendPath = '/Users/adititiwari/WebstormProjects/nyaya-engine/frontend/public'

app.use(express.static(frontendPath))

app.get('/', (req, res) => {
    res.sendFile(frontendPath + '/index.html')
})
// console.log('Serving static from:', staticPath);
// app.use(express.static(staticPath));


// API routes
app.use('/api/infer',   inferRoute); //Mounts the inference logic , equest starting with /api/infer will be handed over to the inferRoute file
app.use('/api/beliefs', beliefsRoute); //Mounts the beliefs logic to the /api/beliefs endpoint
app.use('/api/vyapti',  vyaptiRoute); //Mounts the vyapti logic to the /api/vyapti endpoint
app.use('/api/trace',   traceRoute); //Mounts the trace logic to the /api/trace endpoint



module.exports = app;