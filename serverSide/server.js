const path = require("path");
const express = require("express");
const AWS = require ("aws-sdk");

// Create an Express app
const app = express();
const PORT = 3000;  // number to run the server

// AWS setup
AWS.config.update({ region: "us-east-1"});
const s3 = new AWS.S3();
const BUCKET = "task-inputs";
const FILE_KEY = "tasks.json";

// Middleware to parse JSON data
app.use(express.json());

// Serve frontend
app.use('/clientSide', express.static(path.join(__dirname, '..', 'clientSide')));
app.use('/icons', express.static(path.join(__dirname, '..', 'icons')));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '..', 'clientSide', 'index.html'));
});

// load taskks from s3
app.get("/tasks", async (request, response) => {
    try {
        const data = await s3.getObject({ Bucket: BUCKET, Key: FILE_KEY }).promise();
        const tasks = JSON.parse(data.Body.toString("utf-8"));
        response.json(tasks);
    } catch (error) {
        if (error.code === "NoSuchKey") {
            return response.json([]); // empty if no tasks yet
        }
        console.error("Error reading tasks:", error);
        response.status(500).send("Could not read tasks");
    }
});

// Save tasks to S3
app.post("/tasks", async (request, response) => {
    const tasks = request.body;
    try {
        await s3.putObject({
            Bucket: BUCKET,
            Key: FILE_KEY,
            Body: JSON.stringify(tasks, null, 2),
            ContentType: "application/json",
        }).promise();
        response.send("Tasks saved successfully!");
    } catch (error) {
        console.error("Error writing tasks:", error);
        response.status(500).send("Could not save tasks");
    }
});

// Start server
app.listen(3000, "0.0.0.0", () => {
    console.log("Server running at http://0.0.0.0:3000");
});
