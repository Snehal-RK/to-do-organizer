//
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const placeholderMessage = document.getElementById('placeholderMessage');

// Function to toggle the placeholder message
function togglePlaceholder() {
    if (taskList.children.length === 1) { // Only the placeholder exists
        placeholderMessage.style.display = 'block'; // Show the placeholder
    } else {
        placeholderMessage.style.display = 'none'; // Hide the placeholder
    }
}

// Save tasks to local storage on page load
function saveTasks() {
    const tasks = []; // Array to hold task objects
    taskList.querySelectorAll('li').forEach(item => {
        tasks.push({
            text:item.querySelector('span').textContent, // Get task text
            completed:item.classList.contains('completed') // Check if task is completed
        });
    }); // Iterate over each list item
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Save tasks to local storage
}

// Drag And Drop Functionality
function addDragAndDropListener() {
    taskList.addEventListener('dragstart', function(event) {
        draggedItem = event.target; // Store the dragged item
        event.dataTransfer.setData('text/html', draggedItem.innerHTML); // Set data for drag event
        draggedItem.classList.add('dragging'); // Add dragging class to the item
    });

    taskList.addEventListener('dragover', function(event) {
        event.preventDefault(); // Prevent default behavior to allow drop
        const afterElement = getDragAfterElement(taskList, event.clientY); // Get the element after which the dragged item should be inserted
        const draggable = document.querySelector('.dragging'); // Get the currently dragged item
        if (draggable && afterElement == null) {
            taskList.appendChild(draggable); // Append the dragged item to the end if no after element is found
        } else if(draggable && afterElement) {
            taskList.insertBefore(draggable, afterElement); // Insert the dragged item before the after element
        }
    });

    taskList.addEventListener('dragend', function() {
        const draggedItem = document.querySelector('.dragging'); // Get the currently dragged item
        if(draggedItem) {
            draggedItem.classList.remove('dragging'); // Remove dragging class from the item
        }
        saveTasks(); // Save tasks order to local storage/
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')]; // Get all draggable elements except the currently dragged item
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect(); // Get the bounding box of the child element
        const offset = y - box.top - box.height / 2; // Calculate the offset from the top of the box
        if (offset < 0 && offset > closest.offset) { // Check if the offset is closer than the closest found so far
            return { offset: offset, element: child }; // Update closest element
        } else {
            return closest; // Return closest element found so far
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element; // Return the closest element found
}


// Event listener for adding a task
addTaskButton.addEventListener('click', function() {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {

        // Create a new list item and append it to the task list
        const listItem = document.createElement('li');
        listItem.draggable = true; // Make the list item draggable

        // Create checkbox for completing the task
        const completeIcon = document.createElement('img');
        completeIcon.src = 'icons/black-check.png'; // Set the source of the checkbox image
        completeIcon.alt = 'Complete Task'; // Set alt text for accessibility
        completeIcon.style.width = '20px'; // Set width of the checkbox image
        completeIcon.style.cursor = 'pointer'; // Set cursor style for the checkbox image
        completeIcon.addEventListener('click', function() {
            listItem.classList.toggle('completed'); // Toggle completed class on click
            if (listItem.classList.contains('completed')) {
                completeIcon.src = 'icons/check.png'; // Change icon to checked
            }
            else {
                completeIcon.src = 'icons/black-check.png'; // Change icon to unchecked
            }
            saveTasks(); // Save tasks to local storage
        });
        listItem.appendChild(completeIcon); // Append checkbox image to the list item

        // Create span for task text
        const taskSpan = document.createElement('span');
        taskSpan.textContent = taskText;
        listItem.appendChild(taskSpan); // Append task text to the list item

        // Create drag handle
        const dragIcon = document.createElement('img');
        dragIcon.src = 'icons/drag.png'; // Set the source of the drag icon
        dragIcon.alt = 'Drag Task'; // Set alt text for accessibility
        dragIcon.style.width = '20px'; // Set width of the drag icon
        dragIcon.style.cursor = 'grab'; // Set cursor style for the drag icon
        dragIcon.draggable = true; // Make the drag icon draggable
        dragIcon.addEventListener('dragstart', function(event) {
            draggedItem = listItem; // Store the dragged item
            event.dataTransfer.setData('text/plain', listItem.innerHTML); // Set data for drag event
            listItem.classList.add('dragging'); // Add dragging class to the item
        });
        listItem.appendChild(dragIcon); // Append drag icon to the list item

        // Create edit feature
        const editIcon = document.createElement('img'); // Create edit icon
        editIcon.src = 'icons/edit.png'; // Set the source of the edit icon
        editIcon.alt = 'Edit Task'; // Set alt text for accessibility
        editIcon.style.width = '20px'; // Set width of the edit icon
        editIcon.style.cursor = 'pointer'; // Set cursor style for the edit icon
        editIcon.classList.add('edit'); // Add class for styling
        listItem.appendChild(editIcon); // Append edit icon to the list item


        // Create delete button for removing the task
        const deleteIcon = document.createElement('img');
        deleteIcon.src = 'icons/delete.png'; // Set the source of the delete icon
        deleteIcon.alt = 'Delete Task'; // Set alt text for accessibility
        deleteIcon.style.width = '20px'; // Set width of the delete icon
        deleteIcon.style.cursor = 'pointer'; // Set cursor style for the delete icon
        deleteIcon.addEventListener('click', function() {
            taskList.removeChild(listItem); // Remove the list item from the task list
            saveTasks(); // Save tasks to local storage
        });
        listItem.appendChild(deleteIcon); // Append delete icon to the list item

        taskList.insertBefore(listItem, taskList.firstChild);  // Append the new task to the list
        taskInput.value = ''; // Clear the input field

        saveTasks(); // Save tasks to local storage
        togglePlaceholder(); // Update placeholder visibility
    } else {
        alert('Please enter a task!');
    }
});

// Initial call to set the correct state
togglePlaceholder();

// Event delegation for handling clicks on complete and delete buttons
taskList.addEventListener('click', function(event) {
    if (event.target.type === 'checkbox') {
        // Remove the task when delete button is clicked
        const listItem = event.target.closest('li'); // Get the closest list item
        listItem.classList.toggle('completed');
        saveTasks(); // Save tasks to local storage
    } else if (event.target.tagName === 'BUTTON') {
        // Handle task deletion
        const listItem = event.target.closest('li'); // Get the closest list item
        taskList.removeChild(listItem); // Remove the list item from the task list
        saveTasks(); // Save tasks to local storage
    } else if (event.target.classList.contains('edit')) {
        // Handle task editing
        const listItem = event.target.closest('li'); // Get the closest list item
        const taskSpan = listItem.querySelector('span'); // Get the task text span
        const currentText = taskSpan.textContent; // Get the current task text

        // Replace span with an input field for editing
        const editInput = document.createElement('input'); // Create input field for editing
        editInput.type = 'text'; // Set input type to text
        editInput.value = currentText; // Set input value to current task text
        editInput.style.border = 'none';
        editInput.style.background = 'transparent';
        editInput.style.fontSize = window.getComputedStyle(taskSpan).fontSize;
        editInput.style.fontWeight = window.getComputedStyle(taskSpan).fontWeight;
        editInput.style.textTransform = window.getComputedStyle(taskSpan).textTransform;
        editInput.style.color = window.getComputedStyle(taskSpan).color;
        editInput.style.width = '100%';
        editInput.style.outline = 'none';
        editInput.style.paddingLeft = '10px';
        editInput.style.margin = '0';
        listItem.insertBefore(editInput, taskSpan); // Insert input field before the task text span
        listItem.removeChild(taskSpan); // Remove the task text span

        // Change edit button to save
        event.target.src = 'icons/save.png'; // Change icon to save
        event.target.alt = 'Save Task'; // Change alt text to Save Task
        event.target.classList.remove('edit'); // Remove edit class from the button
        event.target.classList.add('save'); // Add save class to the button

        editInput.focus(); // Focus on the input field
    } else if (event.target.classList.contains('save')) {
        const listItem = event.target.closest('li'); // Get the closest list item
        const editInput = listItem.querySelector('input[type="text"]'); // Get the input field for editing
        const newText = editInput.value.trim(); // Get the new task text

        if (newText !== '') {
            // Replace input field with a span for task text
            const taskSpan = document.createElement('span'); // Create span for task text
            taskSpan.textContent = newText; // Set new task text
            listItem.insertBefore(taskSpan, editInput); // Insert span before the input field
            listItem.removeChild(editInput); // Remove the input field

            // Change save button back to edit
            event.target.src = 'icons/edit.png'; // Change icon to edit
            event.target.alt = 'Edit Task'; // Change alt text to Edit Task
            event.target.classList.remove('save'); // Remove save class from the button
            event.target.classList.add('edit'); // Add edit class to the button

            saveTasks(); // Save tasks to local storage
        } else {
            alert('Please enter a task!'); // Alert if the input is empty
        }

    }
});

// Filter tasks based on completion, pending, or all
const filterAllBtn = document.querySelector('.filter-btn[data-filter="all"]');
const filterPendingBtn = document.querySelector('.filter-btn[data-filter="pending"]');
const filterCompletedBtn = document.querySelector('.filter-btn[data-filter="completed"]');

const filterButtons = document.querySelectorAll('.filter-btn');  // To manage active state

// Add event listener to filter buttons
filterAllBtn.addEventListener('click', () => filterTasks('all'));
filterPendingBtn.addEventListener('click', () => filterTasks('pending'));
filterCompletedBtn.addEventListener('click', () => filterTasks('completed'));

// Function to filter tasks based on the selected filter
function filterTasks(filter) {
    const tasks = taskList.querySelectorAll('li'); // Get all tasks
    
    // Update active state of filter buttons
    filterButtons.forEach(button => {
        button.classList.remove('active');
        
        tasks.forEach(item => {
            switch (filter) {
                case 'all':
                    item.style.display = 'flex'; // Show all tasks
                    break;
                case 'pending':
                    item.style.display = item.classList.contains('completed') ? 'none' : 'flex'; // Show only pending tasks
                    break;
                case 'completed':
                    item.style.display = item.classList.contains('completed') ? 'flex' : 'none'; // Show only completed tasks
                    break;
            }
        });
    });
}
filterTasks('all'); // Initialize with all tasks visible

// Load tasks from local storage on page load
function loadTasks() {
    const storedTasks = localStorage.getItem('tasks'); // Get tasks from local storage
    if(storedTasks) {
        const tasks = JSON.parse(storedTasks); // Parse the tasks from JSON
        tasks.forEach(task => {
            const listItem = document.createElement('li'); // Create a new list item
            listItem.draggable = true; // Make the list item draggable

            const CompleteIcon = document.createElement('img'); // Create checkbox for completing the task
            CompleteIcon.src = task.completed ? 'icons/check.png' : 'icons/black-check.png'; // Show checkbox if task is completed  // Set the source of the checkbox image
            CompleteIcon.alt = 'Complete Task'; // Set alt text for accessibility
            CompleteIcon.style.width = '20px'; // Set width of the checkbox image
            CompleteIcon.style.cursor = 'pointer'; // Set cursor style for the checkbox image  
            CompleteIcon.addEventListener('click', function() {
                listItem.classList.toggle('completed'); // Toggle completed class on click
                if (listItem.classList.contains('completed')) {
                    CompleteIcon.src = 'icons/check.png'; // Change icon to checked
                }
                else {
                    CompleteIcon.src = 'icons/black-check.png'; // Change icon to unchecked
                }
                saveTasks(); // Save tasks to local storage
            });

            // Create span for task text
            const taskSpan = document.createElement('span'); // Create span for task text
            taskSpan.textContent = task.text; // Set task text

            // create delete button for removing the task
            const deleteIcon = document.createElement('img'); // Create delete button for removing the task
            deleteIcon.src = 'icons/delete.png'; // Set the source of the delete icon
            deleteIcon.alt = 'Delete Task'; // Set alt text for accessibility
            deleteIcon.style.width = '20px'; // Set width of the delete icon
            deleteIcon.style.cursor = 'pointer'; // Set cursor style for the delete icon
            deleteIcon.addEventListener('click', function() {
                taskList.removeChild(listItem); // Remove the list item from the task list
                saveTasks(); // Save tasks to local storage
            });

            const editIcon = document.createElement('img'); // Create edit icon
            editIcon.src = 'icons/edit.png'; // Set the source of the edit icon
            editIcon.alt = 'Edit Task'; // Set alt text for accessibility
            editIcon.style.width = '20px'; // Set width of the edit icon
            editIcon.style.cursor = 'pointer'; // Set cursor style for the edit icon
            editIcon.classList.add('edit'); // Add class for styling

            if(task.completed){
                listItem.classList.add('completed'); // Add completed class if task is completed   
            }

            // Create drag handle
            const dragIcon = document.createElement('img'); // Create drag handle
            dragIcon.src = 'icons/drag.png'; // Set the source of the drag icon
            dragIcon.alt = 'Drag Task'; // Set alt text for accessibility
            dragIcon.style.width = '20px'; // Set width of the drag icon
            dragIcon.style.cursor = 'grab'; // Set cursor style for the drag icon
            dragIcon.draggable = true; // Make the drag icon draggable
            dragIcon.addEventListener('dragstart', function(event) {
                draggedItem = listItem; // Store the dragged item
                event.dataTransfer.setData('text/html', listItem.innerHTML); // Set data for drag event
                listItem.classList.add('dragging'); // Add dragging class to the item
            });

            if(task.completed){
                listItem.classList.add('completed'); // Add completed class if task is completed
            }

            listItem.appendChild(CompleteIcon); // Append checkbox image to the list item
            listItem.appendChild(taskSpan); // Append task text to list item
            listItem.appendChild(dragIcon); // Append drag icon to the list item
            listItem.appendChild(editIcon); // Append edit icon to the list item
            listItem.appendChild(deleteIcon); // Append delete button to list item

            taskList.appendChild(listItem); // Append the new task to the list
        }); // Iterate over each task

        const activeFilter = document.querySelector('.filter-btn.active'); // Get the active filter button
        if(activeFilter){
            filterTasks(activeFilter.dataset.filter); // Filter tasks based on the active filter
        }
        else {
            filterTasks('all'); // Show all tasks if no filter is active
        }
        // Add event listener for drag and drop functionality
        addDragAndDropListener();
        togglePlaceholder(); // Update placeholder visibility
    }
    else {
        filterTasks('all'); // Show all tasks if no tasks are stored
        addDragAndDropListener(); // Add drag and drop listener
    }
}
loadTasks(); // Load tasks on page load

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggleBtn'); // Get the theme toggle button
const body = document.body; // Get the body element

function toggleTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark-theme'); // Add dark theme class to body
        themeToggle.textContent = 'Light Mode'; // Change button text to Light Mode
        themeToggle.classList.add('dark-mode'); // Add dark theme class to button
        themeToggle.src = 'icons/sun.png'; // Change icon to sun
    } else {
        body.classList.remove('dark-theme'); // Remove dark theme class from body
        themeToggle.textContent = 'Dark Mode'; // Change button text to Dark Mode
        themeToggle.classList.remove('dark-mode'); // Remove dark theme class from button
        themeToggle.src = 'icons/moon.png'; // Change icon to moon
    }
    localStorage.setItem('theme', theme); // Save the selected theme to local storage
}

// Event listener for theme toggle button
themeToggle.addEventListener('click', function() {
    const currentTheme = localStorage.getItem('theme'); // Get the current theme from local storage
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'; // Toggle theme
    toggleTheme(newTheme); // Call the toggleTheme function with the new theme
});

// Load the saved theme on page load
const savedTheme = localStorage.getItem('theme'); // Get the saved theme from local storage
if (savedTheme) {
    toggleTheme(savedTheme); // Apply the saved theme
}else {
    toggleTheme('light'); // Default to light theme if no theme is saved
}
