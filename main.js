// errors
const errNoInternetConnection = "No internet connection!";
const errUserNotFound = "User not found!";
const errServerError = "Server error!";

// messages
const msgConnectToInternet = "Internet connected.";
const msgReadFromLocal = "Read from local storage.";

// elements
let responseElement = document.getElementById("response");
let userInputElement = document.getElementById("username");
let infoBoxElement = document.getElementById("info-box");
let avatarElement = document.getElementById("avatar");
let accountElement = document.getElementById("account");
let bioElement = document.getElementById("bio");
let blogElement = document.getElementById("blog");
let locationElement = document.getElementById("location");
let followersElement = document.getElementById("followers");
let followingElement = document.getElementById("following");
let companyElement = document.getElementById("company");
let repoElement = document.getElementById("repos");
let hireElement = document.getElementById("hireable");



// add event listeners for checking internet connection.
window.addEventListener("offline", function() {
    responseElement.innerHTML = errNoInternetConnection;

    alert(errNoInternetConnection);
});

window.addEventListener("online", function() {
    if (responseElement.innerHTML == errNoInternetConnection) {
        responseElement.innerHTML = "";
    }

    alert(msgConnectToInternet);
});

// function for saving data as cookie.
function setCookie(key, value, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));

    let expires = "expires="+ d.toUTCString();

    document.cookie = key + "=" + value + ";" + expires + ";path=/";
}

// function for reading data from cookie.
function getCookie(key) {
    let name = key + "=";
    let decodedCookie = decodeURIComponent(document.cookie);

    let ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
}

// function for saving data in local storage.
function save_to_local(key, value){
    localStorage.setItem(key, value);
}

// function for reading data from local storage.
function read_from_local(key){
    return localStorage.getItem(key);
}

// function for sending http request to github.
async function sendRequest(username) {
    return fetch(`https://api.github.com/users/${username}`);
}

// function to call for the user from either local storage/cookies or github api.
async function getUser(){
    // get username
    let username = userInputElement.value

    // check local storage
    if (read_from_local(username) == null) {
        // need to send http request.
        let response = await sendRequest(username);

        // check for network errors
        if (response.status !== 200) {
            responseElement.innerHTML = errServerError

            alert(errServerError)

            return
        }

        // send http request to github api
        let data = await response.json();

        // save it into local storage
        save_to_local(username, JSON.stringify(data));

        responseElement.innerHTML = "";
    } else {
        // no need for api request
        var data = JSON.parse(read_from_local(username));

        responseElement.innerHTML = msgReadFromLocal;
    }
    
    // get data from cookie
    if (getCookie(username) == "") {
        let response = await sendRequest(username);
        if (response.status !== 200) {
            responseElement.innerHTML = errServerError

            alert(errServerError)

            return
        }

        var data = await response.json();
        setCookie(username, JSON.stringify(data), 1);

        responseElement.innerHTML = "";
    } else {
        var data = JSON.parse(getCookie(username));

        responseElement.innerHTML = msgReadFromLocal;
    }

    // setting the response into elements
    if (data.message) {
        infoBoxElement.style.opacity = 0.35;
        responseElement.innerHTML = errUserNotFound;
    } else {
        if (responseElement.innerHTML == errUserNotFound){
            responseElement.innerHTML = "";
        }

        infoBoxElement.style.opacity = 1;

        avatarElement.src = data.avatar_url ? data.avatar_url : "unknown";
        accountElement.innerHTML = data.name ? data.name : "unknown";
        bioElement.innerHTML = data.bio ? data.bio : "unknown";
        blogElement.innerHTML = data.blog ? "blog: " + data.blog.replace('https://','www.') : "unknown";
        locationElement.innerHTML = data.location ? data.location : "unknown";
        followersElement.innerHTML = data.followers ? data.followers : "unknown";
        followingElement.innerHTML = data.following ? data.following : "unknown";
        companyElement.innerHTML = data.company ? data.company : "unknown";
        repoElement.innerHTML = data.public_repos ? data.public_repos : "unknown";
        hireElement.innerHTML = data.hireable ? data.hireable : "unknown";
    }
}