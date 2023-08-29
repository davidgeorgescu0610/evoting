const DbService = require('../services/dbService');
const BlockchainService = require('../services/blockchainService');

var dbService = DbService.getDbServiceInstance();
var blockchainService = BlockchainService.getBlockchainServiceInstance();

exports.getVotingSessions = async (req, res) => {
    const votingSessions = await dbService.getAllVotingSessions();
    const nameDateAndActive = votingSessions.map(session => ({
        id: session.id,
        name: session.name,
        date: session.date,
        isActive: session.isActive
    }));
    return res.status(200).json(nameDateAndActive);
}

exports.getCandidates = async (req, res) => {
    const { votingSessionId } = req.body;
    const candidates = await dbService.getAllCandidatesOfVotingSession(votingSessionId);
    const nameOfPersons = [];
    for(const candidate of candidates){
        const person = await dbService.getPersonById(candidate.person_id);
        nameOfPersons.push({
            id: candidate.id,
            name: person.name
        });
    }

    return res.status(200).json(nameOfPersons);
}

exports.sendVote = async (req, res) => {
    const { votingSessionId, candidateId, privateKey } = req.body;

    const isVotingSessionActive = await dbService.isVotingSessionActive(votingSessionId);
    if(!isVotingSessionActive){
        return res.status(400).json({'message': 'Puteți vota doar la sesiuni active!'});
    }

    const voter = await dbService.getPersonById(req.person_id);

    if(!/^0x([a-fA-F0-9]{64})$/.test(privateKey))
        return res.status(400).json({'message': 'Cheia privată este invalidă!'});

    const accountToCheck = await blockchainService.privateKeyToAccount(privateKey);
    
    if(accountToCheck.address != voter.address)
        return res.status(400).json({'message': 'Cheia privată este invalidă!'});
    
    const candidate = await dbService.getPersonByCandidateId(candidateId);
    const ok = await blockchainService.sendSignedVote(votingSessionId, voter.address, candidate.address, privateKey);
    if(!ok)
        return res.status(400).json({'message': 'Deja ai votat la această sesiune de votare!'});

    return res.status(200).json(candidate);
}

exports.getResults = async (req, res) => {
    const {votingSessionId} = req.body;

    const sessionTerminated = await dbService.sessionIsTerminated(votingSessionId);
    if(!sessionTerminated)
        return res.sendStatus(400);

    const candidates = await dbService.getAllCandidatesOfVotingSession(votingSessionId);
    const addressesOfCandidates = [];
    for(const candidate of candidates){
        const person = await dbService.getPersonById(candidate.person_id);
        addressesOfCandidates.push({
            name: person.name,
            address: person.address
        });
    }

    const results = await blockchainService.getResults(votingSessionId, addressesOfCandidates);

    return res.status(200).json(results);
}