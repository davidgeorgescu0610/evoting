const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const DbService = require('../services/dbService');
const BlockchainService = require('../services/blockchainService');
const { isEligibleToVote, isCnpValid, isMailValid } = require('../utils/auth');
const sendEmail = require('../utils/sendEmail');

var dbService = DbService.getDbServiceInstance();
var blockchainService = BlockchainService.getBlockchainServiceInstance();

exports.register = async (req, res) => {
    const { name, mail, cnp, pass } = req.body;

    if(!name || !mail || !cnp || !pass )
        return res.status(400).json({'message': 'Toate câmpurile sunt obligatorii'});

    if(!isCnpValid(cnp))
        return res.status(400).json({'message': 'CNP invalid'});

    if(!isEligibleToVote(cnp))
        return res.status(400).json({'message': 'Nu te poți înregistra dacă ești minor'});

    if(!isMailValid(mail))
        return res.status(400).json({'message': 'Adresa de mail are un format invalid!'});

    const hmac1 = crypto.createHmac('sha256', process.env.CREDENTIALS_SECRET);
    hmac1.update(cnp);
    const hashedCnp = hmac1.digest('hex');
    const hmac2 = crypto.createHmac('sha256', process.env.CREDENTIALS_SECRET);
    hmac2.update(pass);
    const hashedPass = hmac2.digest('hex');
    
    let isRegistered = await dbService.personAlreadyRegistered(hashedCnp);
    if(isRegistered)
        return res.status(409).json({'message': 'Utilizatorul cu acest CNP are deja un cont!'});

    //const newAccount = await blockchainService.createAccount();
    const person = await dbService.addPerson(name, mail, 0, hashedCnp, hashedPass);
    const emailToken = await dbService.addToken(person.id, crypto.randomBytes(32).toString('hex'));

    const url = 'https://10.13.0.61/api/auth/email/'+ person.id + '/verify/' + emailToken.token;
    await sendEmail(person.mail, "Verifică email-ul", url);

    return res.status(200).json({'message': 'Contul a fost creat cu succes!'});
}

exports.email_verification = async (req, res) => {
    const person = await dbService.getPersonById(req.params.id);
    if(!person)
        return res.redirect('/invalid_token');

    if(person.verified){
        return res.redirect('/login');
    }
    
    const token = await dbService.getEmailTokenByPersonId(person.id);
    if(!token)
        return res.redirect('/login');

    if(token.token != req.params.token){
        return res.redirect('/invalid_token');
    }
    else{
        if(token.expiresAt >= Date.now()){
            await dbService.updateVerifiedEmail(person.id);
            await dbService.removeEmailToken(token.id);

            const newAccount = await blockchainService.createAccount();
            await dbService.addPersonsAddress(newAccount.address, person.id);
            await sendEmail(person.mail, "Secret", "Aceasta este cheia privată: " + newAccount.privateKey + "\nEa va fi folosită în procesul de votare.\nPĂSTRAȚI ACEASTĂ CHEIE ÎN SIGUTANȚĂ!!!");

            return res.redirect('/login');
        }
        else{
            await dbService.removeEmailToken(token.id);
            const emailToken = await dbService.addToken(person.id, crypto.randomBytes(32).toString('hex'));
            const url = 'https://10.13.0.61/api/auth/email/'+ person.id + '/verify/' + emailToken.token;
            await sendEmail(person.mail, "Verifică email-ul", url);
            return res.redirect('/link_expired');
        }
    }
}

exports.login = async (req, res) => {
    const { cnp, pass } = req.body;

    if(!cnp || !pass )
        return res.status(400).json({'message': 'Toate câmpurile sunt obligatorii'});

    const hmac1 = crypto.createHmac('sha256', process.env.CREDENTIALS_SECRET);
    hmac1.update(cnp);
    const hashedCnp = hmac1.digest('hex');
    const hmac2 = crypto.createHmac('sha256', process.env.CREDENTIALS_SECRET);
    hmac2.update(pass);
    const hashedPass = hmac2.digest('hex');

    const person = await dbService.getUserByCnpAndPass(hashedCnp, hashedPass);
    if(!person)
        return res.status(401).json({'message': 'CNP sau parolă invalide!'});

    if(!person.verified){
        res.redirect('/verify_email');
    }

    const accessToken = jwt.sign(
        { "person_id": person.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m'}
    );

    const refreshToken = jwt.sign(
        { "person_id": person.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d'}
    );

    dbService.updateRefreshToken(person.id, refreshToken);
    return res.status(200).cookie('jwt', refreshToken, {httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000}).json({'accessToken': accessToken});
}

exports.logout = async (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt){
        return res.sendStatus(204);
    }
    const refreshToken = cookies.jwt;

    const person = await dbService.getPersonByRefreshToken(refreshToken);
    if(!person){
        res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true});
        return res.sendStatus(204)
    }

    await dbService.updateRefreshToken(person.id, '');
    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true});
    return res.sendStatus(204);
}

exports.refresh = async (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) 
        return res.status(401);
;
    const refreshToken = cookies.jwt;
    const person = await dbService.getPersonByRefreshToken(refreshToken);

    if(!person)
        return res.status(403);
    
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || decoded.person_id !== person.id)
                return res.status(403);

            const accessToken = jwt.sign(
                { "person_id": decoded.person_id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m'}
            );

            res.status(200).json({'accessToken': accessToken});
        }
    );
}
