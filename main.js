//================================================================================================================================
        //==============================================Checking Internet Connection======================================================
        //================================================================================================================================
        // window.addEventListener("offline", function() {
        //     document.getElementById("message").innerHTML = "Error in Internet Connection";
        // })
        // window.addEventListener("online", function() {
        //     if (document.getElementById("message").innerHTML == "Error in Internet Connection") {
        //         document.getElementById("message").innerHTML = "";
        //     }
        //
        // })
        //================================================================================================================================
        //================================================================================================================================
        //================================================================================================================================

        //================================================================================================================================
        //==========================================The function for saving data as cookies===============================================
        //================================================================================================================================
        function setCookie(cname, cvalue, exdays) {
            // The function for saving data as cookies-------------
            const d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            let expires = "expires="+ d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
            document.getElementById("message").innerHTML = "";
        }
        //================================================================================================================================
        //==========================================The function for reading data from cookies============================================
        //================================================================================================================================
        function getCookie(cname) {
            // The function for reading data from cookies--------------
            let name = cname + "=";
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
        //================================================================================================================================
        //==========================================The function for saving data in local storage=========================================
        //================================================================================================================================
        function save_to_local(username, data){
            // The function for saving data in local storage-------
            localStorage.setItem(username, data);
        }
        //================================================================================================================================
        //==========================================The function for reading data from local storage======================================
        //================================================================================================================================
        function read_from_local(username){
            // The function for reading data from local storage--------
            let data = localStorage.getItem(username);
            return data;
        }

        //================================================================================================================================
        //=======================function to call for the user from either local_storage/cookies or github api============================
        //================================================================================================================================
        async function getUser(){
            // function to call for the user from either local_storage/cookies or github api.
            let username = document.getElementById("username").value


            //================================================================================================================================
            //================================================================================================================================
            // Comment out the code block below if you don't want to use LOCAL_STORAGE
            //--------------------------------------------------------------------------------------------------------------------------------
            if (localStorage.getItem(username) == null) {
                console.log("Saving to Local Storage");
                let response = await fetch(`https://api.github.com/users/${username}`);

                var data = await response.json();

                let s_data = JSON.stringify(data);
                save_to_local(username, s_data);
                document.getElementById("message").innerHTML = "";
            } else {
                console.log("Reading from Local Storage");
                let s_data = read_from_local(username);
                var data = JSON.parse(s_data);
                document.getElementById("message").innerHTML = "Data Loaded from Local Storage";
            }
            //================================================================================================================================
            //================================================================================================================================
            //--------------------------------------------------------------------------------------------------------------------------------
            //--------------------------------------------------------------------------------------------------------------------------------
            //--------------------------------------------------------------------------------------------------------------------------------
            //================================================================================================================================
            //================================================================================================================================
            // Comment out the code block below if you don't want to use COOKIES
            //================================================================================================================================
            //================================================================================================================================
            if (getCookie(username) == "") {
                console.log("Setting to Cookies");
                console.log(getCookie(username) == "");
                let response = await fetch(`https://api.github.com/users/${username}`);

                var data = await response.json();

                let s_data = JSON.stringify(data);

                setCookie(username, s_data, 1);
                document.getElementById("message").innerHTML = "";
            } else {
                console.log("Getting from Cookies");
                let s_data = getCookie(username);
                var data = JSON.parse(s_data);
                document.getElementById("message").innerHTML = "Data Loaded from Cookies";
            }
            //================================================================================================================================
            //================================================================================================================================
            //================================================================================================================================
            //==============================Requesting Data from Github Apis, since Nothing Found in Locally==================================
            //======================================and Setting Each Data into its Appropriate Place==========================================
            //================================================================================================================================
            if (data.message) {
                document.getElementById("info-box").style.opacity = 0.35;
                document.getElementById("message").innerHTML = "User Not Found | Try Again";
            } else {
                if (document.getElementById("message").innerHTML == "User Not Found | Try Again"){
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
            }
            // ================================================================================================================================
            // ================================================================================================================================
            // ==================================Code Block Below Evaluate the Favourite Programming Language==================================
            // ===================================================of the Searched User=========================================================
            if (data.repos_url) {
                let langs = [];
                const response = fetch(data.repos_url);
                response
                .then((response) => response.json())
                .then((repos) => {
                    for (let index = 0;  index < repos.length; index++){
                        let repo = repos[index];
                        if (repo.language) {
                            langs.push(repo.language);
                        }
                    }
                    let count = {};
                    langs.forEach(function(i) { count[i] = (count[i]||0) + 1;});
                    let max = 0;
                    let fav_lang = null;
                    for (lang in count) {
                        if (count[lang] > max) {
                            max = count[lang];
                            fav_lang = lang;
                        }
                    }
                    if (fav_lang) {
                        document.getElementById("fav_lang").innerHTML = fav_lang;
                    } else {
                        document.getElementById("fav_lang").innerHTML = 'Not Specified';
                    }
                });
            }
            // ================================================================================================================================
            // ================================================================================================================================
        }