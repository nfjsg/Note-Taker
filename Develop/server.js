// Import required modules and packages
const path = require('path');             // Enables working with file and directory paths
const fs = require('fs');                 // Enables interaction with the file system
const { v4: uuidv4 } = require('uuid');   // Imports the v4 method from the uuid package to generate unique IDs

// Set up Express application
const express = require('express');       // Imports the Express framework
const app = express();                    // Initializes an Express application
const PORT = process.env.PORT || 3001;    // Defines the port the server will listen on

// Middleware setup

// Parse incoming JSON and urlencoded data into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (like HTML, CSS, JS) from the 'public' directory
app.use(express.static('public'));

// Start the server to listen on a specific port
app.listen(PORT, () => {
   console.log(`Server is live at http://localhost:${PORT}`);
});

// Route setup

// Serves the notes.html file when '/notes' endpoint is accessed
app.get('/notes', (req, res) => {
   res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// Returns all saved notes as JSON when '/api/notes' endpoint is accessed
app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
       if (err) throw err;
       res.json(JSON.parse(data));         // Convert string data from file into JSON and send as a response
    });
 });

// Serves the index.html file for all other endpoints not previously defined (acts as a fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
 });

// Accepts new note data, assigns a unique ID, saves it, and returns the new note when '/api/notes' endpoint is accessed using POST
app.post('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
       if (err) throw err;
       
       const notes = JSON.parse(data);    // Convert string data from file into JSON
       const newNote = { ...req.body, id: uuidv4() };  // Create new note object with unique ID

       notes.push(newNote);               // Add new note to existing notes
       
       // Write updated notes list back to db.json
       fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), err => {
          if (err) throw err;
          res.json(newNote);              // Send the new note as a response
       });
    });
 });

// Deletes a specific note by its unique ID when '/api/notes/:id' endpoint is accessed using DELETE
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;          // Extract the ID from the URL

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) throw err;

        let notes = JSON.parse(data);      // Convert string data from file into JSON
        
        // Create a new array excluding the note with the targeted ID
        const updatedNotes = notes.filter(note => note.id !== noteId);
        
        // Write updated notes list back to db.json
        fs.writeFile('./db/db.json', JSON.stringify(updatedNotes, null, 2), err => {
            if (err) throw err;
            res.json({ message: 'Note deleted successfully!' });
        });
    });
});
