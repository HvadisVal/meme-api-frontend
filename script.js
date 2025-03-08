const API_URL = "http://localhost:5001/api";
let token = localStorage.getItem("auth-token");

function isLoggedIn() {
    return localStorage.getItem("auth-token") !== null;
}

// Handle API requests with auth token
async function apiRequest(url, method, body = null) {
    const headers = {
        "Content-Type": "application/json",
    };
    
    const storedToken = localStorage.getItem("auth-token");
    if (storedToken) headers["auth-token"] = storedToken;  // Ensure token is added

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(API_URL + url, options);
    return response.json();
}


// Register User
async function registerUser() {
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    const result = await apiRequest("/user/register", "POST", { name, email, password });
    if (result.error) alert(result.error);
    else alert("Registration successful! Please log in.");
}

async function loginUser() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const result = await apiRequest("/user/login", "POST", { email, password });

    if (result.error) {
        alert("Login failed: " + result.error);
    } else {
        token = result.token;  
        localStorage.setItem("auth-token", token);
        alert("Login successful!");

        updateUI(); // Call function to update UI
        fetchMemes();
    }
}

function updateUI() {
    const storedToken = localStorage.getItem("auth-token");

    if (storedToken) {
        document.getElementById("auth").style.display = "none";  // Hide login/register
        document.getElementById("logout-button").style.display = "block"; // Show logout
    } else {
        document.getElementById("auth").style.display = "block";  // Show login/register
        document.getElementById("logout-button").style.display = "none"; // Hide logout
    }
}

// Run updateUI on page load
updateUI();




// Logout User
function logoutUser() {
    localStorage.removeItem("auth-token");
    token = null;
    alert("Logged out!");
    updateUI(); // Reset UI after logout
}


// Fetch All Memes 
async function fetchMemes() {
    const memes = await apiRequest("/memes", "GET");
    let memeList = document.getElementById("meme-list");
    memeList.innerHTML = "";

    memes.forEach(meme => {
        let memeDiv = document.createElement("div");
        memeDiv.className = "col s12 m6 l4"; // 3-column layout on large screens

        memeDiv.innerHTML = `
            <div class="card">
                <div class="card-image">
                    <img src="${meme.imageUrl}" alt="${meme.title}">
                </div>
                <div class="card-content">
                    <span class="card-title">${meme.title}</span>
                    <p>${meme.description}</p>
                    <p><strong>Votes:</strong> ${meme.votes}</p>
                </div>
                <div class="card-action">
                    <button class="btn blue waves-effect waves-light" onclick="voteMeme('${meme._id}')">Vote</button>
                    <button class="btn red waves-effect waves-light" onclick="deleteMeme('${meme._id}')">Delete</button>
                    <button class="btn grey darken-1 waves-effect waves-light" onclick="editMeme('${meme._id}', '${meme.title}', '${meme.imageUrl}', '${meme.description}')">Edit</button>
                </div>
            </div>
        `;

        memeList.appendChild(memeDiv);
    });
}


// Fetch Two Random Memes for Battle
async function fetchBattleMemes() {
    const battleMemes = await apiRequest("/memes/battle", "GET");
    let battleContainer = document.getElementById("battle-container");
    battleContainer.innerHTML = "";

    battleMemes.forEach(meme => {
        let memeDiv = document.createElement("div");
        memeDiv.className = "col s12 m6 l4"; // Ensures 3 memes per row on large screens

        memeDiv.innerHTML = `
            <div class="card">
                <div class="card-image">
                    <img src="${meme.imageUrl}" alt="${meme.title}">
                </div>
                <div class="card-content">
                    <span class="card-title">${meme.title}</span>
                    <p>${meme.description}</p>
                    <p><strong>Votes:</strong> ${meme.votes}</p>
                </div>
                <div class="card-action">
                    <button class="btn blue waves-effect waves-light" onclick="voteMeme('${meme._id}')">Vote</button>
                </div>
            </div>
        `;

        battleContainer.appendChild(memeDiv);
    });
}

// Vote for a Meme
async function voteMeme(memeId) {
    if (!isLoggedIn()) {
        alert("You need to log in to vote!");
        return;
    }

    await apiRequest(`/memes/${memeId}/vote`, "POST");
    fetchMemes();
}



// Delete a Meme
async function deleteMeme(memeId) {
    if (!isLoggedIn()) {
        alert("You need to log in to delete memes!");
        return;
    }

    await apiRequest(`/memes/${memeId}`, "DELETE");
    fetchMemes();
}


// Add a New Meme
async function addMeme() {
    if (!isLoggedIn()) {
        alert("You need to log in to add memes!");
        return;
    }

    const title = document.getElementById("meme-title").value;
    const imageUrl = document.getElementById("meme-url").value;
    const description = document.getElementById("meme-description").value;

    const result = await apiRequest("/memes", "POST", { title, imageUrl, description });
    alert("Meme added successfully!");
    fetchMemes();
}



// Edit a Meme
function editMeme(memeId, title, imageUrl, description) {
    const newTitle = prompt("Edit Title:", title);
    const newImageUrl = prompt("Edit Image URL:", imageUrl);
    const newDescription = prompt("Edit Description:", description);

    if (newTitle && newImageUrl && newDescription) {
        apiRequest(`/memes/${memeId}`, "PUT", { title: newTitle, imageUrl: newImageUrl, description: newDescription })
            .then(() => fetchMemes());
    }
}

// Load memes on page load
fetchMemes();
