function inputFieldIsEmpty(){
    const inputs = document.querySelectorAll("input");
    const inputFields = document.querySelectorAll(".input-field");
    const exclamation = document.querySelectorAll(".input-field div");
    const warning = document.getElementById("empty");

    let empty = false;
    for(let i = 0; i < inputs.length; i++){
        if(inputs[i].value === ""){
            inputFields[i].style.border = "2px solid red";
            exclamation[i].style.display = "block";
            empty = true;
        } else {
            inputFields[i].style.border = "";
            exclamation[i].style.display = "none";
        }
    }

    if(empty){
        warning.style.display = "block";
    }
    else{
        warning.style.display = "none";
    }

    return empty;
}

function login(){
    const warning = document.getElementById("response");
    warning.innerText = "";
    warning.style.display = "none";

    if(inputFieldIsEmpty())
        return;

    var cnp = document.getElementById("cnp").value;
    var pass = document.getElementById("pass").value;

    var data = {
        cnp: cnp,
        pass: pass
    };

    fetch('https://10.13.0.61/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        if(response.status === 200){
            response.json().then(data => {
                localStorage.setItem('accessToken', data.accessToken);
                window.location.href = '/';
            });        
        }
        else {
            const warning = document.getElementById("response");
            response.json().then(data => { warning.innerText = data.message; });
            warning.style.display = "block";
        }
    });
}
