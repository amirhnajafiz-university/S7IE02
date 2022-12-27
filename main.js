// errors
const errNoInternetConnection = "No internet connection!";
const errUserNotFound = "User not found!";
const errServerError = "Server error!";


// messages
const msgConnectToInternet = "Internet connected.";
const msgReadFromLocal = "Read from cache.";
const msgAPIFetch = "Read from API call.";


// other variables
const timeUnit = 24 * 60 * 60 * 1000;


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
let favLangElement = document.getElementById("fav_lang");


// add event listeners for checking internet connection.
// get online.
window.addEventListener("online", function() {
    if (responseElement.innerHTML == errNoInternetConnection) {
        responseElement.innerHTML = "";
    }
    infoBoxElement.style.opacity = 1;
});
// get offline.
window.addEventListener("offline", function() {
    responseElement.innerHTML = errNoInternetConnection;
    infoBoxElement.style.opacity = 0.4;
});



// function for reset user input and box.
function reset() {
    userInputElement.innerHTML = "";
    avatarElement.src = "assets/images/user.jpg";
    accountElement.innerHTML = "Name";
    blogElement.innerHTML = "Website";
    bioElement.innerHTML = "-";
    locationElement.innerHTML = "Location";
    companyElement.innerHTML = "Company";
    followersElement.innerHTML = "-";
    followingElement.innerHTML = "-";
    repoElement.innerHTML = "-";
    hireElement.innerHTML = "-";
    twitterElement.innerHTML = "-";
    orgsElement.innerHTML = "-";
    favLangElement.innerHTML = "-";
}

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

// function for updating elements values.
async function put_values(data) {
    // basic values
    avatarElement.src = data.avatar_url || "unknown";
    accountElement.innerHTML = data.name || "unknown";
    bioElement.innerHTML = data.bio || "unknown";
    twitterElement.innerHTML = data.twitter_username || "unknown";
    locationElement.innerHTML = data.location || "unknown";
    followersElement.innerHTML = data.followers || "unknown";
    followingElement.innerHTML = data.following || "unknown";
    companyElement.innerHTML = data.company || "unknown";
    repoElement.innerHTML = data.public_repos || "unknown";
    // need modification values
    blogElement.innerHTML = data.blog ? "Website: " + data.blog.replace('https://','www.') : "unknown";
    hireElement.innerHTML = data.hireable ? data.hireable ? 'Yes' : 'No' : "unknown";
    // fetch an api to get value
    if (data.organizations_url) {
        let orgsResp = await fetch(data.organizations_url);
        var orgs = await orgsResp.json();
        if (orgsResp.status === 200) {
            orgsElement.innerHTML = orgs.length
        } else {
            orgsElement.innerHTML = "unknown"
        }
    }
    if (data.repos_url) {
        let languages = {};
        // get repositories
        fetch(data.repos_url)
            .then((response) => response.json())
            .then((repos) => {
                for (let index = 0;  index < Math.min(repos.length, 5); index++) { // loop over 5 top
                    let repo = repos[index];
                    if (repo.language) {
                        if (repo.language in languages) {
                            languages[repo.language]++;
                        } else {
                            languages[repo.language] = 1;
                        }
                    }
                }

                // Find maximum
                let max = 0;
                let maxKey = "";

                for(let lang in languages){
                    if(languages[lang]> max){
                        max = languages[lang];
                        maxKey= lang
                    }
                }

                if (fav_lang) {
                    favLangElement.innerHTML = maxKey;
                } else {
                    favLangElement.innerHTML = "unknown";
                }
            })
            .catch((error) => {
                favLangElement.innerHTML = "unknown";

                console.error(error);
            })
    }
}

// function for sending http request to github.
async function send_request(username) {
    return fetch(`https://api.github.com/users/${username}`)
    .then((response) => response)
    .catch((error) => {
        responseElement.innerHTML = errNoInternetConnection

        console.log(error)

        return null
    })
}

// function to search for the user from localstorage/cookies or github api.
async function search(){
    // get username
    let username = userInputElement.value

    // check local storage or cookie storage
    if (localElement.checked) {
        console.log('try: local storage');

        // check for local storage data existance
        if (read_from_local(username) == null) {
            // need to send http request.
            let response = await send_request(username);
            if (response === null) {
                return
            }
    
            // check for network errors
            if (response.status !== 200 && response.status !== 404) {
                responseElement.innerHTML = errServerError
                infoBoxElement.style.opacity = 0.4;
    
                return
            }

            // check for user found
            if (response.status === 404) {
                responseElement.innerHTML = errUserNotFound
                infoBoxElement.style.opacity = 0.4;

                return
            }
    
            // send http request to github api
            var data = await response.json();
    
            // save it into local storage
            save_to_local(username, JSON.stringify(data));
    
            responseElement.innerHTML = msgAPIFetch;
        } else {
            // no need for api request
            var data = JSON.parse(read_from_local(username));
    
            responseElement.innerHTML = msgReadFromLocal + "(local storage)";
        }
    } else if (cookieElement.checked) {
        console.log('try: cookie');

        // get data from cookie
        if (getCookie(username) == "") {
            // make http request
            let response = await send_request(username);
            if (response === null) {
                return
            }

            if (response.status !== 200 && response.status !== 404) {
                responseElement.innerHTML = errServerError
                infoBoxElement.style.opacity = 0.4;

                return
            }

            // check for user found
            if (response.status === 404) {
                responseElement.innerHTML = errUserNotFound
                infoBoxElement.style.opacity = 0.4;

                return
            }

            var data = await response.json();
            setCookie(username, JSON.stringify(data), 1);

            responseElement.innerHTML = msgAPIFetch;
        } else {
            // read from cookie
            var data = JSON.parse(getCookie(username));

            responseElement.innerHTML = msgReadFromLocal + "(cookie)";
        }
    }

    // setting the response into elements
    if (data.message) {
        infoBoxElement.style.opacity = 0.4;

        responseElement.innerHTML = errUserNotFound;
    } else {
        infoBoxElement.style.opacity = 1;

        await put_values(data);
    }
}