const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Node.js built-in module for path manipulation
const app = express();
const PORT = 3000;

// --- Middleware ---
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Parse JSON request bodies
app.use(bodyParser.json());

// --- In-memory storage for notes ---
let notes = [];
let nextId = 1; // Simple ID generator

// --- API Routes ---

// GET /api/notes - Returns all notes
app.get('/api/notes', (req, res) => {
    res.json(notes);
});

// POST /api/notes - Adds a new note
app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;

    // Basic validation
    if (!title || !text) {
        return res.status(400).json({ error: 'Title and text are required for a new note.' });
    }

    const newNote = {
        id: nextId++, // Assign current ID and then increment
        title,
        text
    };

    notes.push(newNote);
    res.status(201).json(newNote); // 201 Created
});

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to access the frontend.`);
});