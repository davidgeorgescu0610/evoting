function writeTableBody(data){
    const list = document.getElementById('table-body');

    for(const elem of data){
        const tr = document.createElement('tr');
        tr.onclick = function(){
            rowClicked(this);
        }

        const td0 = document.createElement('td');
        td0.style.display = 'none';
        td0.innerText = elem.id;

        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        let icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-circle');

        if(elem.isActive)
            icon.style.color = 'green';
        else
            icon.style.color = 'red';

        td1.innerText = elem.name;
        td2.innerText = elem.date;
        td3.appendChild(icon);

        tr.appendChild(td0);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);

        list.appendChild(tr);
    }
}

function rowClicked(row){
    const rowContent = row.querySelectorAll('td');

    const votingSessionId = document.createElement('p');
    votingSessionId.style.display = 'none';
    votingSessionId.setAttribute('id', 'voting-session-id');
    votingSessionId.innerText = rowContent[0].textContent;

    const name = rowContent[1].textContent;
    const active = rowContent[3].children[0].cloneNode(true);

    const popup = document.getElementById("pop-up1");
    popup.style.display = 'block';

    const boxNav = document.getElementById("box-nav-bar1");

    const boxHeader = document.createElement('h2');
    boxHeader.setAttribute('id', 'box-header');
    boxHeader.innerText = name;

    boxNav.appendChild(active);
    boxNav.appendChild(boxHeader);

    popup.appendChild(votingSessionId);
}

function exitPopup1(){
    const popup = document.getElementById("pop-up1");
    const boxHeader = document.getElementById('box-header');
    const votingSessionId = document.getElementById('voting-session-id');
    const wanring = document.getElementById('empty1');

    wanring.style.display = 'none';
    votingSessionId.remove();
    boxHeader.remove();
    popup.style.display = 'none';
}

function manageLoggedinBlocks(){
    const notLoggedin = document.getElementById("not-loggedin-content");
    const votingSessions = document.getElementById("voting-sessions");
    const loginRef = document.getElementById("login");
    const logoutRef = document.getElementById("logout");

    votingSessions.style.display = 'block';
    notLoggedin.style.display = 'none';
    loginRef.style.display = 'none';
    logoutRef.style.display = 'inline-block';
}

function manageNOTLoggedinBlocks(){
    const notLoggedin = document.getElementById("not-loggedin-content");
    const votingSessions = document.getElementById("voting-sessions");
    const loginRef = document.getElementById("login");
    const logoutRef = document.getElementById("logout");

    votingSessions.style.display = 'none';
    notLoggedin.style.display = 'block'
    loginRef.style.display = 'inline-block';
    logoutRef.style.display = 'none';
}

function refreshToken(){
    fetch('https://10.13.0.61/api/auth/refresh', {
            method: 'GET'
    }).then(response => {
        if(response.status === 401 || response.status === 403){
            window.location.href = '/login';
        }

        if(response.status === 200){
            response.json().then(data => {
                localStorage.setItem('accessToken', data.accessToken);
                window.location.href = '/admin';
            });
        }
    });
}

function sendNewVotingSession(){
    const accessToken = localStorage.getItem('accessToken');
    const name = document.getElementById('name').value;
    const file = document.getElementById('file').files[0];
    const wanring = document.getElementById('empty');

    if(!file && name === ""){
        wanring.style.display = 'block';
        return;
    }
    else{
        wanring.style.display = 'none';
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    const loadingContainer = document.getElementById("loading-container");
    loadingContainer.style.display = "block";

    fetch('https://10.13.0.61/api/admin/addVotingSession', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + accessToken
        },
        body: formData
    }).then(response => {
        loadingContainer.style.display = "none";

        if(response.status === 200){
            window.location.href = '/admin';
        }
        
        if(response.status === 400){
            response.json().then(data => {
                wanring.innerText = data.message;
                wanring.style.display = 'block';
            });
        }

        if(response.status === 401){
            wanring.innerText = "Nu ești admin!";
            wanring.style.display = 'block';
        }

        if(response.status === 403){
            refreshToken();
        }
    });
}

function addVotingSession(){
    const popup = document.getElementById("pop-up");
    const wanring = document.getElementById('empty');

    popup.style.display = 'block';
    wanring.style.display = 'none';
}

function exitPopup(){
    const popup = document.getElementById("pop-up");
    popup.style.display = 'none';
}

function startVoting(){
    const accessToken = localStorage.getItem('accessToken');
    const votingSessionId = document.getElementById('voting-session-id').textContent;
    const wanring = document.getElementById('empty1');

    const data = {
        votingSessionId: votingSessionId
    }

    const loadingContainer = document.getElementById("loading-container1");
    loadingContainer.style.display = "block";

    fetch('https://10.13.0.61/api/admin/startVote', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            loadingContainer.style.display = "none";

            if(response.status === 200){
                window.location.href = '/admin';
            }

            if(response. status === 400){
                wanring.innerText = "Sesiunea este deja încheiată! Nu poți da START vot!";
                wanring.style.display = 'block';
            }
            
            if(response.status === 401){
                wanring.innerText = "Nu ești admin!";
                wanring.style.display = 'block';
            }

            if(response.status === 403){
                refreshToken();
            }
        });
}

function finishVoting(){
    const accessToken = localStorage.getItem('accessToken');
    const votingSessionId = document.getElementById('voting-session-id').textContent;
    const wanring = document.getElementById('empty1');

    const data = {
        votingSessionId: votingSessionId
    }

    const loadingContainer = document.getElementById("loading-container1");
    loadingContainer.style.display = "block";

    fetch('https://10.13.0.61/api/admin/stopVote', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            loadingContainer.style.display = "none";

            if(response.status === 200){
                window.location.href = '/admin';
            }
            
            if(response.status === 401){
                wanring.innerText = "Nu ești admin!";
                wanring.style.display = 'block';
            }

            if(response. status === 400){
                wanring.innerText = "Sesiunea este deja încheiată! Nu poți da STOP vot!";
                wanring.style.display = 'block';
            }

            if(response.status === 403){
                refreshToken();
            }
        });
}

document.addEventListener("DOMContentLoaded", function() {
    const accessToken = localStorage.getItem('accessToken');
    
    if(accessToken){
        manageLoggedinBlocks();

        fetch('https://10.13.0.61/api/voting/getVotingSessions', {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        }).then(response => {
            if(response.status === 200){
                response.json().then(data => {
                    writeTableBody(data);
                });
            }
            if(response.status === 403){
                refreshToken();
            }
        });
    }
    else{
        manageNOTLoggedinBlocks();
    }
    
});

function goHome(){
    window.location.href = '/';
}

function stayHere(){
    window.location.href = '/voting';
}

function login(){
    window.location.href = '/login';
}

function logout(){
    localStorage.removeItem('accessToken');

    fetch('https://10.13.0.61/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => { window.location.href = '/admin'; });
}
