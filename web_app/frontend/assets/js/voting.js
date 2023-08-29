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
                window.location.href = '/voting';
            });
        }
    });
}

function rowClicked(row){
    const rowContent = row.querySelectorAll('td');

    const votingSessionId = document.createElement('p');
    votingSessionId.style.display = 'none';
    votingSessionId.setAttribute('id', 'voting-session-id');
    votingSessionId.innerText = rowContent[0].textContent;
    
    const name = rowContent[1].textContent;
    const active = rowContent[3].children[0].cloneNode(true);

    const popup = document.getElementById("pop-up");
    popup.style.display = 'block';

    const boxNav = document.getElementById("box-nav-bar");

    const boxHeader = document.createElement('h2');
    boxHeader.setAttribute('id', 'box-header');
    boxHeader.innerText = name;
    
    boxNav.appendChild(active);
    boxNav.appendChild(boxHeader)
    popup.appendChild(votingSessionId)
}

function displayCandidatesList(data, votingSessionId){
    const candidatesList = document.getElementById('candidates-list');
    
    for(const elem of data){
        const li = document.createElement('li');
        const p1 = document.createElement('h3');
        const p2 = document.createElement('p');
        const sendVoteButton = document.createElement('button');
        sendVoteButton.innerText = 'VOTEAZĂ';
        sendVoteButton.onclick = function() {
            sendVote(li, votingSessionId);
        }

        p1.innerText = elem.name;
        p2.innerText = elem.id;

        p2.style.display = 'none';
        li.appendChild(p1);
        li.appendChild(p2);
        li.appendChild(sendVoteButton);
        candidatesList.appendChild(li);
    }
}

function sendVote(li, votingSessionId){
    
    const name = li.children[0].innerText;
    const id = li.children[1].innerText;
    
    exitPopup();

    const votePopUp = document.getElementById("vote-pop-up");
    votePopUp.style.display = 'block';

    const candidateName = document.getElementById("candidate-name");
    candidateName.innerText = name;

    const data = {
        votingSessionId: votingSessionId,
        candidateId: id
    }

    const yesBtn = document.getElementById("yes");
    yesBtn.onclick = function(){
        yes(data);
    }
}

function yes(data){
    const accessToken = localStorage.getItem('accessToken');
    const warning = document.getElementById("warning");
    if(document.getElementById("pass").value === ""){
        warning.innerText = 'Este obligatoriu sa introduceți cheia privată!'
        warning.style.display = 'block';
        return;
    }
    else{
        warning.style.display = 'none';
    }

    const privateKey = document.getElementById("pass").value;
    data.privateKey = privateKey;

   const loadingContainer = document.getElementById("loading-container");
   loadingContainer.style.display = "block";

    fetch('https://10.13.0.61/api/voting/sendVote', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
    }).then(response => {
        loadingContainer.style.display = "none";

        if(response.status === 200){
            window.location.href = '/voting';
        }

        if(response.status === 400){
            response.json().then(data => {
                warning.innerText = data.message;
                warning.style.display = 'block';
            });
        }

        if(response.status === 403){
            refreshToken();
        }
    }).catch(err => {
        console.log('Error:', err);
    })
}

function no(){
    window.location.href = '/voting';
}

function displayResults(data){
    const list = document.getElementById('results-list');

    for(const elem of data){
        const tr = document.createElement('tr');

        const td1 = document.createElement('td');
        const td2 = document.createElement('td');

        td1.innerText = elem.name;
        td2.innerText = elem.result;

        tr.appendChild(td1);
        tr.appendChild(td2);

        list.appendChild(tr);
    }
}

function showResults(){
    const accessToken = localStorage.getItem('accessToken');
    const votingSessionId = document.getElementById('voting-session-id').textContent;
    const boxButtons = document.getElementById('box-buttons');
    const results = document.getElementById('results');
    const warning = document.getElementById('empty1');

    

    const data = {
        votingSessionId: votingSessionId
    };

    fetch('https://10.13.0.61/api/voting/getResults', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
    }).then(response => {
        if(response.status === 200){
            response.json().then(data => {
                results.style.display = 'block';
                boxButtons.style.display = 'none';
                displayResults(data)
            })
        }

        if(response.status === 400){
            warning.innerText = 'Nu poți vedea rezultatele până nu se încheie sesiunea de votare!';
            warning.style.display = 'block';
        }

        if(response.status === 403){
            refreshToken();
        }
    })
}

function vote(){
    const accessToken = localStorage.getItem('accessToken');
    const boxButtons = document.getElementById('box-buttons');
    const candidates = document.getElementById('candidates');

    const votingSessionId = document.getElementById('voting-session-id').textContent;
    const data = {
        votingSessionId: votingSessionId
    };

    candidates.style.display = 'block';
    boxButtons.style.display = 'none';

    fetch('https://10.13.0.61/api/voting/getCandidates', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
    }).then(response => {
        if(response.status === 200){
            response.json().then(data => {
                displayCandidatesList(data, votingSessionId);
            });
        }
        if(response.status === 403){
            refreshToken();
        }
    })
}

function goBack(){
    const candidates = document.getElementById('candidates');
    const boxButtons = document.getElementById('box-buttons');
    const results = document.getElementById('results');
    const candidatesList = document.querySelectorAll('ul#candidates-list li');
    const resultsList = document.querySelectorAll('tbody#results-list tr');

    for(const candidate of candidatesList){
        candidate.remove();
    }

    for(const result of resultsList){
        result.remove();
    }
    
    results.style.display = 'none';
    candidates.style.display = 'none';
    boxButtons.style.display = 'flex';
}

function exitPopup(){
    const popup = document.getElementById("pop-up");
    const boxHeader = document.getElementById('box-header');
    const votingSessionId = document.getElementById('voting-session-id');
    const boxButtons = document.getElementById('box-buttons');
    const candidates = document.getElementById('candidates');
    const results = document.getElementById('results');
    const candidatesList = document.querySelectorAll('ul#candidates-list li');
    const resultsList = document.querySelectorAll('tbody#results-list tr');
    const wanring = document.getElementById('empty1');

    for(const candidate of candidatesList){
        candidate.remove();
    }

    for(const result of resultsList){
        result.remove();
    }

    wanring.style.display = 'none';
    votingSessionId.remove();
    boxHeader.remove();
    results.style.display = 'none';
    boxButtons.style.display = 'flex';
    popup.style.display = 'none';
    candidates.style.display = 'none';
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

function goToAdmin(){
    window.location.href = '/admin';
}

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
    }).then(response => { window.location.href = '/voting'; });
}
