const container = document.getElementById('user-container');
const reloadBtn = document.getElementById('reload-btn');
const retryBtn = document.getElementById('retry-btn');
const addUserBtn = document.getElementById('add-user-btn');
let usersData = []; // Store fetched data locally

function fetchUsers() {
    container.innerHTML = '<p>Loading...</p>';
    reloadBtn.disabled = true;
    retryBtn.style.display = 'none';
    
    fetch('https://jsonplaceholder.typicode.com/users')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            usersData = data; // Store original data
            loadLocalEdits(); // Apply any saved local edits
            displayUsers(usersData);
            reloadBtn.disabled = false;
        })
        .catch(error => {
            container.innerHTML = '<p>Error fetching data: ' + error.message + '</p>';
            reloadBtn.disabled = false;
            retryBtn.style.display = 'inline-block';
        });
}

function displayUsers(users) {
    container.innerHTML = '';
    users.forEach((user, index) => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('user');
        userDiv.innerHTML = `
            <button class="delete-btn" data-index="${index}">×</button>
            <h3 contenteditable="true">${user.name}</h3>
            <p>Email: <span contenteditable="true">${user.email}</span></p>
            <p>Address: <span contenteditable="true">${user.address.street}, ${user.address.city}, ${user.address.zipcode}</span></p>
        `;
        
        // Delete button event
        userDiv.querySelector('.delete-btn').addEventListener('click', () => {
            users.splice(index, 1);
            displayUsers(users);
            saveLocalEdits(users);
        });
        
        // Save edits on blur (when user stops editing)
        userDiv.addEventListener('blur', () => {
            saveLocalEdits(users);
        }, true);
        
        container.appendChild(userDiv);
    });
}

function addNewUser() {
    const name = document.getElementById('new-name').value.trim();
    const email = document.getElementById('new-email').value.trim();
    const street = document.getElementById('new-street').value.trim();
    const city = document.getElementById('new-city').value.trim();
    const zip = document.getElementById('new-zip').value.trim();
    
    if (!name || !email) {
        alert('Name and Email are required!');
        return;
    }
    
    const newUser = {
        name,
        email,
        address: { street, city, zipcode: zip }
    };
    
    usersData.push(newUser);
    displayUsers(usersData);
    saveLocalEdits(usersData);
    
    // Clear form
    document.getElementById('new-name').value = '';
    document.getElementById('new-email').value = '';
    document.getElementById('new-street').value = '';
    document.getElementById('new-city').value = '';
    document.getElementById('new-zip').value = '';
}

function saveLocalEdits(users) {
    localStorage.setItem('localUsers', JSON.stringify(users));
}

function loadLocalEdits() {
    const saved = localStorage.getItem('localUsers');
    if (saved) {
        usersData = JSON.parse(saved);
    }
}

// Event listeners
reloadBtn.addEventListener('click', () => {
    localStorage.removeItem('localUsers'); // Reset local edits on reload
    fetchUsers();
});
retryBtn.addEventListener('click', fetchUsers);
addUserBtn.addEventListener('click', addNewUser);

// Initial fetch on page load
fetchUsers();