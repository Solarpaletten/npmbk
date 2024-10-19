require('dotenv').config(); // Load environment variables from a .env file

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const clientRoutes = require('./routes'); // Import routes for handling client-related requests

const app = express();
const PORT = process.env.PORT || 3000; // Use the PORT from the environment or default to 3000

app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse incoming requests with JSON payloads

// Use the client routes for handling requests under "/api/clients"
app.use('/api/clients', clientRoutes);

// Set up a root route at "/" to test if the server is running
app.get('/', (req, res) => {
  res.send('Server is running! Welcome to the client API.');
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
