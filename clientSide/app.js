"use strict";

let tasks = [];
let currentFilter = "all";

// Save tasks to server
const saveTasks = async () => {
    try {
        await fetch("/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tasks)
        });
    } catch (error) {
        console.error("Error saving tasks:", error);
    }
};

// Load tasks from server
const loadTasks = async () => {
    try {
        const response = await fetch("/tasks");
        if (!response.ok) throw new Error("Failed to load tasks");
        tasks = await response.json();
    } catch (error) {
        console.error("Error loading tasks:", error);
        tasks = [];
    }
};

document.addEventListener("DOMContentLoaded", async function () {

    const input = document.querySelector("#taskInput");     // Text for input box
    const addButton = document.querySelector("#addTask");   // "Add" button
    const taskList = document.querySelector("#taskList");   // The <ul> to display

    const dateInputField = document.querySelector("#dateTime");  // date and time
    const dailyButton = document.querySelector("#daily"); // "Daily" button
    const weeklyButton = document.querySelector("#weekly"); // "Weekly" button
    const monthlyButton = document.querySelector("#monthly"); // "Monthly" button
    const allButton = document.getElementById("all");
    const reminderButton = document.querySelector("#reminder"); // "Reminder" button

    const reminderPanel = document.querySelector("#reminderPanel");// Reminder panel
    const reminderList = document.querySelector("#reminderList") // Reminder list
    const themeToggle = document.querySelector("#themeToggle")// theme toggle

    const completedCount = document.querySelector("#completedCount"); // Completed tasks
    const totalCount = document.querySelector("#totalCount"); // Total tasks

    const saveAndRender = async () => {
        await saveTasks();
        renderTasks(currentFilter);
    };

    const renderTasks = (filterType = "all") => {
        taskList.innerHTML = ""; // Clears task list display
        currentFilter = filterType;

 // filter tasks by date
        let filteredTasks = tasks;
        if (filterType === "daily") {
            filteredTasks = tasks.filter(task => todaysTask(task.date));
        } else if (filterType === "weekly") {
            filteredTasks = tasks.filter(task => weekTask(task.date));
        } else if (filterType === "monthly") {
         filteredTasks = tasks.filter(task => monthTask(task.date));
        };

        let completedTasks = 0;

        // Add each task as <li> element
        filteredTasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.classList.add("task-item");

            // Create checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed
            checkbox.addEventListener("change", async() => {
                task.completed = checkbox.checked;
                await saveAndRender();
            });

            // Create task text and date span
            const span = document.createElement("span");
            const dateSpan = new Date(task.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            });

            span.textContent = `${task.text} — ${dateSpan}`;
            // Marks as completed if checkbox clicked
            if (task.completed) {
                span.style.textDecoration = "line-through";
                span.style.opacity = ".5";
                completedTasks++;
            }

            // Wraps checkbox and text together so they're on the left side
            const taskContent = document.createElement("div");
            taskContent.classList.add("task-content");
            taskContent.appendChild(checkbox);
            taskContent.appendChild(span);

            // Create edit icon button
            const editButton = document.createElement("img");
            editButton.src = "/icons/edit.png";
            editButton.alt = "Edit";
            editButton.classList.add("edit-icon");
            editButton.addEventListener("click", async() => {
                let newText;
                let newDate;

                // Prevents blank task edits
                while (true) {
                    newText = prompt("Edit your task:", task.text);
                    if (newText === null) {
                        return;
 }
                    newText = newText.trim();
                    if (newText !== "") {
                        break;
                    }
                    alert("Task cannot be empty");
                };

                // Prevents blank time edits
                while (true) {
                    newDate = prompt("Edit the date and time (YYYY-MM-DDTHH:MM):", task.date)
                    if (newDate === null) {
                        return;
                    }
                    const parseDate = new Date(newDate);
                    const now = new Date();

                    if (isNaN(parseDate.getTime())) {
                            alert("Please enter valid date/time such as '2025-08-5T12:00");
                            continue;
                        }

                    if (parseDate < now) {
                            alert("Can't choose a date or time in the past.");
                            continue;
                        }

                    break;
                };

                task.text = newText;
                task.date = newDate;
                await saveAndRender();
            });

            // Create delete icon button
            const deleteButton = document.createElement("img");
            deleteButton.src = "/icons/delete.png";
            deleteButton.alt = "Delete";
            deleteButton.classList.add("delete-icon");
            deleteButton.addEventListener("click", async () => {
                const realIndex = tasks.indexOf(task);
                if (realIndex > -1) {
                    tasks.splice(realIndex, 1);
                }
                await saveAndRender();
            });

            // Wraps delete + edit buttons together on the right side
            const iconContainer = document.createElement("div");
            iconContainer.classList.add("icon-container");
            iconContainer.appendChild(editButton);
            iconContainer.appendChild(deleteButton);

            // Adds checkbox + text and edit + delete button to list element
            li.appendChild(taskContent);
            li.appendChild(iconContainer);

            // Add list item to task list
            taskList.appendChild(li);
        });
 // Updates completed tasks box
        completedCount.textContent = completedTasks;
        totalCount.textContent = filteredTasks.length;
    };

    // Adds task with "Add Button"
    const addTask = async () => {
        console.log("Add button clicked");
        const text = input.value.trim();
        const dateInput = dateInputField.value;

        try {
            if (!text) {
                const msg = "You must write something.";
                throw new Error(msg);

            }

            if (!dateInput) {
                const msg = "You must select a date and time for the task.";
                throw new Error(msg);
            }

            const selectedDate = new Date(dateInput);
            const currentDate = new Date();

            if (selectedDate < currentDate) {
                alert("Can't choose a date or date in the past.");
                return;
            }

            let newTask = {
            text: text,
            date: dateInput,
            completed: false
            };

            tasks.push(newTask);
            await saveAndRender();

            input.value = "";
            dateInputField.value = "";
        }
        catch (e) {
            console.log(`${e.name}: ${e.message}`);
            alert(e.message);
        }

    };

    // Adds task when press "Enter" on keyboard
    const addTaskFromEnter = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addTask();
        }
    };

    // load tasks from server before rendering
    await loadTasks();
    renderTasks();
 // Daily task display
    const todaysTask = (date) => {
        const today = new Date();
        const taskDate = new Date(date);

        return (
            taskDate.getDate() === today.getDate() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getFullYear() === today.getFullYear()
        );
    };

    // this week task display
    const weekTask = (date) => {
        const today = new Date();
        const taskDate = new Date(date);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return taskDate >= startOfWeek && taskDate <= endOfWeek;
    };

    // this months task display
    const monthTask = (date) => {
        const now = new Date();
        const taskDate = new Date(date);

        return (
            taskDate.getMonth() === now.getMonth() &&
            taskDate.getFullYear() === now.getFullYear()
        );
    };


    // display tasks that are due 12 hours from now
    const showDueTasks = () => {
        const now = new Date();
        const dueDate = new Date()
        dueDate.setHours(now.getHours() + 12);

        const dueSoonTasks = [];

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            if (!task.date) continue; // skip if no date

            const taskDue = new Date(task.date);

            if (taskDue > now && taskDue <= dueDate) {
                dueSoonTasks.push(task);
            }
        }
 reminderList.innerHTML = "";

        if (dueSoonTasks.length === 0) {
            reminderList.innerHTML = "<li>No tasks due within 12 hours.</li>";
        } else {

            for (let i = 0; i < dueSoonTasks.length; i++) {
                const task = dueSoonTasks[i];
                const li = document.createElement("li");


                const taskDueTime = new Date(task.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                li.textContent = `${task.text} — Due: ${taskDueTime}`;
                reminderList.appendChild(li);
            }
        }

    };

    // For switching to dark/light mode
    const switchTheme = () => {
        if (themeToggle.checked) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    };

    // Active button behaviors
    const buttonClick = (buttonID) => {
        // removes "active" class from all buttons
        const buttons = [dailyButton, weeklyButton, monthlyButton, allButton];
        buttons.forEach(button => button.classList.remove("active"));
        // add "active" class to selected button
        buttonID.classList.add("active");
    };

    dailyButton.addEventListener("click", () => {
        buttonClick(dailyButton);
        renderTasks("daily");
    });

    weeklyButton.addEventListener("click", () => {
        buttonClick(weeklyButton);
        renderTasks("weekly");
    });

    monthlyButton.addEventListener("click", () => {
        buttonClick(monthlyButton);
        renderTasks("monthly");
    });

    allButton.addEventListener("click", () => {
        buttonClick(allButton);
        currentFilter = "all";
        renderTasks(currentFilter);
    });

    taskForm.addEventListener("submit", evt => {
        evt.preventDefault();
        addTask();
    });
  input.addEventListener("keydown", addTaskFromEnter);

    dateInputField.addEventListener("keydown", addTaskFromEnter);

    reminderButton.addEventListener("click", () => {
        reminderPanel.classList.toggle("hidden");
        if (!reminderPanel.classList.contains("hidden")) {
            reminderPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        showDueTasks();
    });
    themeToggle.addEventListener("change", switchTheme);

        
});

