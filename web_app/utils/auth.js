function isDate(dateStr){
    date = new Date(dateStr.substring(0,2) + '-' + dateStr.substring(2,4) + '-' + dateStr.substring(4,6));
    if(isNaN(date.getTime()))
        return false;

    return true;
}

function isRegionValid(regionStr){
    regionInt = parseInt(regionStr);
    
    if((regionInt >= 1 && regionInt <= 48) || regionInt == 51 || regionInt == 52)
        return true;

    return false;
}

function isEligibleToVote(cnp){
    birthDateStr = cnp.substring(1, 7);
    
    let year = "";
    let month = birthDateStr.substring(2,4);
    let day = birthDateStr.substring(4,6);

    if(cnp[0] === "1" || cnp[0] === "2")
        year = "19" + birthDateStr.substring(0,2);
    else
        year = "20" + birthDateStr.substring(0,2);

    birthDate = new Date(year + "-" + month + "-" + day);

    if(new Date().getFullYear() - birthDate.getFullYear() >= 18)
        return true;
    
    return false;
}

function isCnpValid(cnp){
    if(cnp.length != 13)
        return false;

    if(cnp.charAt(0) != '5' && cnp.charAt(0) != '6' && cnp.charAt(0) != '1' && cnp.charAt(0) != '2')
        return false;
        
    if(!isDate(cnp.substring(1, 7)))
        return false;

    if(!isRegionValid(cnp.substring(7,9)))
        return false;

    return true;
}

function isMailValid(mail){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if(!emailRegex.test(mail.trim()))
        return false;

    return true;
}

module.exports = { isEligibleToVote, isCnpValid, isMailValid };