// errors
const errNoInternetConnection = "No internet connection!";
const errUserNotFound = "User not found!"

// messages
const msgConnectToInternet = "Internet connected.";
const msgReadFromLocal = "Read from local storage."

// elements
let responseElement = document.getElementById("response");
let userInputElement = document.getElementById("username");


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

// function to call for the user from either local storage/cookies or github api.
async function getUser(){
    // get username
    let username = userInputElement.value

    // check local storage
    if (read_from_local(username) == null) {
        // need to send http request.
        let response = await fetch(`https://api.github.com/users/${username}`);

        // send http request to github api
        let data = await response.json();
        data = JSON.stringify(data);

        // save it into local storage
        save_to_local(username, data);
        document.getElementById("message").innerHTML = "";
    } else {
        // no need for api request
        var data = JSON.parse(read_from_local(username));
        document.getElementById("message").innerHTML = msgReadFromLocal;
    }
    
    // get data from cookie
    if (getCookie(username) == "") {
        let response = await fetch(`https://api.github.com/users/${username}`);

        var data = await response.json();
        data = JSON.stringify(data);

        setCookie(username, data, 1);
        document.getElementById("message").innerHTML = "";
    } else {
        var data = JSON.parse(getCookie(username));
        document.getElementById("message").innerHTML = msgReadFromLocal;
    }

    if (data.message) {
        document.getElementById("info-box").style.opacity = 0.35;
        document.getElementById("message").innerHTML = errUserNotFound;
    } else {
        if (document.getElementById("message").innerHTML == errUserNotFound){
            document.getElementById("message").innerHTML = "";
        }

        document.getElementById("info-box").style.opacity = 1;

        if (data.avatar_url) {document.getElementById("avatar-img").src = data.avatar_url ;}
        if (data.name) {document.getElementById("account-name").innerHTML = data.name} else {document.getElementById("account-name").innerHTML = "unknown"}
        if (data.bio) {document.getElementById("bio").innerHTML = data.bio;} else {document.getElementById("bio").innerHTML = "No Bio"}
        if (data.blog) {document.getElementById("blog").innerHTML = "blog: " + data.blog.replace('https://','www.');} else {document.getElementById("blog").innerHTML = "No Blog"}

        if (data.location) {document.getElementById("loc").innerHTML = data.location} else {document.getElementById("loc").innerHTML = "location not specified"}
        if (data.followers) {document.getElementById("followers").innerHTML = data.followers} else {document.getElementById("followers").innerHTML = "unknown"}
        if (data.following) {document.getElementById("following").innerHTML = data.following} else {document.getElementById("following").innerHTML = "unknown"}
        if (data.company) {
            document.getElementById("company").innerHTML = data.company
        }
    }
}