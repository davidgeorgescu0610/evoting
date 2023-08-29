document.addEventListener("DOMContentLoaded", function() {
    const loginRef = document.getElementById("login");
    const logoutRef = document.getElementById("logout");
    if(localStorage.getItem('accessToken')){
        loginRef.style.display = 'none';
        logoutRef.style.display = 'inline-block';
    }
    else{

        loginRef.style.display = 'inline-block';
        logoutRef.style.display = 'none';
    }
  
    
});

function login(){
    window.location.href = '/login';
}

function stayHere(){
    window.location.href = '/';
}

function logout(){
    localStorage.removeItem('accessToken');

    fetch('https://10.13.0.61/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        window.location.href = '/';
    });
}

function goToAdmin(){
    window.location.href = '/admin';
}

function goToVoting(){
    window.location.href = '/voting';
}
