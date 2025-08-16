const fs = require("fs");
const path = require("path");
const express = require("express");

// Create an Express app
const app = express();
const PORT = 3000;  // number to run the server

// Define path where tasks will be saved
const taskFile = path.join(__dirname, "tasks.json");

// Middleware to parse JSON data
app.use(express.json());

// Serve frontend
app.use('/clientSide', express.static(path.join(__dirname, '..', 'clientSide')));
app.use('/icons', express.static(path.join(__dirname, '..', 'icons')));

// serve index.html at root
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '..', 'clientSide', 'index.html'));
});

// Route to load tasks
app.get("/tasks", (request, response) => {
    // Read the tasks.json file
    fs.readFile(taskFile, "utf-8", (error, data) => {
        if(error) {
            console.error("Error reading the tasks:", error);
            return response.status(500).send("Could not read tasks");
        }

        // Parse the file contents or default to empty array
        const tasks = data ? JSON.parse(data) : [];
        response.json(tasks); // Send tasks back to the frontend
    });
});

// Route to save tasks (POST /tasks)
app.post("/tasks", (request, response) => {
    const tasks = request.body;  // Get tasks from request body

    // Write tasks to tasks.json file 
    fs.writeFile(taskFile, JSON.stringify(tasks, null, 2), (error) => {
        if (error) {
            console.error("Error writing tasks:", error);
            return response.status(500).send("Could not save tasks.");
        }

        response.send("Tasks saved successfully!");
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});