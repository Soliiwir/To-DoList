// Load tasks from the server
const loadTasks = async () => {
    try {
        const response = await fetch("/tasks");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to load tasks:", error);
        return [];
    }
};

// Save tasks to the server
const saveTasks = async (tasks) => {
    try {
        await fetch("/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(tasks),
        });
    } catch (error) {
        console.error("Failed to save tasks:", error);
    }
};