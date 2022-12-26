// errors
const errNoInternetConnection = "No internet connection!";
const errUserNotFound = "User not found!";
const errServerError = "Server error!";


// messages
const msgConnectToInternet = "Internet connected.";
const msgReadFromLocal = "Read from cache.";
const msgAPIFetch = "Read from API call.";


// other variables
const timeUnit = 24*60*60*1000;


// elements
let responseElement = document.getElementById("response");
let userInputElement = document.getElementById("username");

let infoBoxElement = document.getElementById("info");
let localElement = document.getElementById("use_local");
let cookieElement = document.getElementById("use_cookie");

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
let twitterElement = document.getElementById("twitter");
let orgsElement = document.getElementById("orgs");



// add event listeners for checking internet connection.
// get online.
window.addEventListener("online", function() {
    if (responseElement.innerHTML == errNoInternetConnection) {
        responseElement.innerHTML = "";
    }

    alert(msgConnectToInternet);
});
// get offline.
window.addEventListener("offline", function() {
    responseElement.innerHTML = errNoInternetConnection;

    alert(errNoInternetConnection);
});



// function for saving data as cookie.
function setCookie(key, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * timeUnit));

    document.cookie = key + "=" + value + ";" + "expires="+ d.toUTCString() + ";path=/";
}

// function for reading data from cookie.
function getCookie(key) {
    key = key + "=";

    let cookies = decodeURIComponent(document.cookie).split(';');

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];

        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }

        if (cookie.indexOf(key) == 0) {
            return cookie.substring(key.length, cookie.length);
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

    // check local storage or cookie storage
    if (localElement.checked) {
        console.log('try: local storage');

        if (read_from_local(username) == null) {
            // need to send http request.
            let response = await sendRequest(username);
    
            // check for network errors
            if (response.status !== 200) {
                responseElement.innerHTML = errServerError
    
                alert(errServerError)
    
                return
            }

            console.log(response.status)
    
            // send http request to github api
            var data = await response.json();
    
            // save it into local storage
            save_to_local(username, JSON.stringify(data));
    
            responseElement.innerHTML = "";
        } else {
            // no need for api request
            var data = JSON.parse(read_from_local(username));
    
            responseElement.innerHTML = msgReadFromLocal;
        }
    } else if (cookieElement.checked) {
        console.log('try: cookie');

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

        avatarElement.src = data.avatar_url || "unknown";
        accountElement.innerHTML = data.name || "unknown";
        bioElement.innerHTML = data.bio || "unknown";
        blogElement.innerHTML = data.blog ? "blog: " + data.blog.replace('https://','www.') : "unknown";
        locationElement.innerHTML = data.location || "unknown";
        followersElement.innerHTML = data.followers || "unknown";
        followingElement.innerHTML = data.following || "unknown";
        companyElement.innerHTML = data.company || "unknown";
        repoElement.innerHTML = data.public_repos || "unknown";
        hireElement.innerHTML = data.hireable ? data.hireable === true ? 'Yes' : 'No' : "unknown";
        twitterElement.innerHTML = data.twitter_username || "unknown";

        if (data.organizations_url) {
            let orgsResp = await fetch(data.organizations_url);
            var orgs = await orgsResp.json();

            if (orgsResp.status === 200) {
                orgsElement.innerHTML = orgs.length
            } else {
                orgsElement.innerHTML = "unknown"
            }
        }

    }
}