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

function mailNotValid(){
    const emailInput = document.getElementById("mail");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const exclamation = document.querySelectorAll(".input-field div");
    const inputFields = document.querySelectorAll(".input-field");
    const warning = document.getElementById("invalid-mail");

    const emailValue = emailInput.value.trim();
    if (!emailRegex.test(emailValue)) {
        inputFields[1].style.border = "2px solid red";
        exclamation[1].style.display = "block";
        warning.style.display = "block";
        return true;
    } else {
        inputFields[1].style.border = "";
        exclamation[1].style.display = "none";
        warning.style.display = "none";
        return false;
    }
}

function passConfirmationNotMatch(){
    const pass = document.getElementById("pass").value;
    const pass_confirm = document.getElementById("pass-confirm").value;
    const inputFields = document.querySelectorAll(".input-field");
    const exclamation = document.querySelectorAll(".input-field div");
    const warning = document.getElementById("pass-match");

    if(pass != pass_confirm){
        inputFields[3].style.border = "2px solid red";
        exclamation[3].style.display = "block";
        inputFields[4].style.border = "2px solid red";
        exclamation[4].style.display = "block";
        warning.style.display = "block";
        return true;
    }
    else{
        inputFields[3].style.border = "";
        exclamation[3].style.display = "none";
        inputFields[4].style.border = "";
        exclamation[4].style.display = "none";
        warning.style.display = "none";
        return false;
    }
}

function register(){

    const warning = document.getElementById("response");
    warning.innerText = "";
    warning.style.display = "none";

    if(inputFieldIsEmpty())
        return;

    if(mailNotValid())
        return;

    if(passConfirmationNotMatch())
        return;

    var cnp = document.getElementById("cnp").value;
    var pass = document.getElementById("pass").value;
    var name = document.getElementById("name").value;
    var mail = document.getElementById("mail").value;

    var data = {
        name: name,
        mail: mail,
        cnp: cnp,
        pass: pass
    };

    fetch('https://10.13.0.61/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        if(response.status === 200){
            window.location.href = 'https://10.13.0.61/verify_email';
        }
        else {
            const warning = document.getElementById("response");
            response.json().then(data => { warning.innerText = data.message; });
            warning.style.display = "block";
        }
    });
}
