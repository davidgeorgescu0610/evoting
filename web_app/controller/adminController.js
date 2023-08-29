const DbService = require('../services/dbService');
const BlockchainService = require('../services/blockchainService');
const formidable = require('formidable');
const fs = require('fs');
const crypto = require('crypto');

var dbService = DbService.getDbServiceInstance();
var blockchainService = BlockchainService.getBlockchainServiceInstance();
const form = new formidable.IncomingForm();

exports.addVotingSession = async (req, res) => {
    const person = await dbService.getPersonById(req.person_id);
    if(!person.admin){
        return res.sendStatus(401);
    }
    
    let name = '';
    let candidates = null;

    form.parse(req, async (error, fields, files) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to process form data.' });
        } else {
            name = fields.name;

            const filePath = files.file.filepath;
            const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
            candidates = fileContent.trim().split('\n').map(row => row.trim());

            await handleCandidatesAndName(candidates, name);
        }
    });


    const handleCandidatesAndName = async (candidates, name) => {
        const votingSession = await dbService.addVotingSession(name);
    
        for(const candidate of candidates){
            const hmac1 = crypto.createHmac('sha256', process.env.CREDENTIALS_SECRET);
            hmac1.update(candidate);
            const hashedCnp = hmac1.digest('hex');

            const result = await dbService.addCandidateForVotingSession(votingSession, hashedCnp);

            if(result == null){
                await dbService.deleteVotingSession(votingSession);
                return res.status(400).json({'message': 'CNP-uri invalide!'});
            }
        }

        await blockchainService.createSession(votingSession.id);
        return res.sendStatus(200);
    }
}

exports.startVote = async (req, res) => {
    const person = await dbService.getPersonById(req.person_id);
    if(!person.admin){
        return res.sendStatus(401);
    }

    const { votingSessionId } = req.body;

    const sessionTerminated = await dbService.sessionIsTerminated(votingSessionId);
    if(sessionTerminated)
        return res.sendStatus(400);

    const candidates = await dbService.getAllCandidatesOfVotingSession(votingSessionId);
    const addressesOfCandidates = [];
    for(const candidate of candidates){
        const p = await dbService.getPersonById(candidate.person_id);
        addressesOfCandidates.push(p.address);
    }
    
    await dbService.updateIsSessionActive(votingSessionId);

    const votersAddresses = await dbService.getAllPersonAddresses();
    const electionId = parseInt(votingSessionId);

    await blockchainService.startVote(electionId, addressesOfCandidates);
    await blockchainService.addVoters(electionId, votersAddresses);

    return res.sendStatus(200);
}

exports.stopVote = async (req, res) => {
    const person = await dbService.getPersonById(req.person_id);
    if(!person.admin){
        return res.sendStatus(401);
    }

    const { votingSessionId } = req.body;

    const sessionTerminated = await dbService.sessionIsTerminated(votingSessionId);
    if(sessionTerminated)
        return res.sendStatus(400);

    await dbService.terminateVote(votingSessionId);
    await dbService.updateIsSessionNotActive(votingSessionId);
    await blockchainService.stopVote(votingSessionId);

    return res.sendStatus(200);
}