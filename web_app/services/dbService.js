const Persons = require('../models').persons
const Candidates = require('../models').candidates
const VotingSessions = require('../models').voting_sessions
const EmailTokens = require('../models').email_tokens

let instance = null
class DbService{
    static getDbServiceInstance(){
        if(instance == null)
            return new DbService();

        return instance;
    }

    async getPersonById(id){
        const person = await Persons.findOne({where: {id: id}});
        return person;
    }

    async updateVerifiedEmail(person_id){
        const res = await Persons.update(
            {verified: true},
            {where: {id: person_id}}
        );
    }

    async updateRefreshToken(person_id, refresToken){
        await Persons.update(
            {refresh_token: refresToken},
            {where: {id: person_id}}
        );
    }

    async getEmailTokenByPersonId(person_id){
        const emailToken = await EmailTokens.findOne({where: {person_id: person_id}});
        return emailToken;
    }

    async removeEmailToken(token_id){
        const res = await EmailTokens.destroy({
            where: {id: token_id}
        });
    }

    personAlreadyRegistered(cnp){
        return Persons.findOne({where: {cnp: cnp}}).then(person => {
            if(person)
                return true;
            
            return false;
        });
    }

    async addPerson(name, mail, admin, cnp, pass){
        const dataToInsert = {
            name: name,
            mail: mail,
            admin: admin,
            cnp: cnp,
            pass: pass
        };

        const person = await Persons.create(dataToInsert);
        return person;
    }

    async addToken(person_id, token){
        const dataToInsert = {
            person_id: person_id,
            token: token,
            createdAt: Date.now(),
            expiresAt: Date.now() + (60 * 60 * 1000)
        };

        const emailToken = await EmailTokens.create(dataToInsert);
        return emailToken;
    }

    async getUserByCnpAndPass(cnp, pass){
        const person = await Persons.findOne({where: {cnp: cnp, pass, pass}});
        return person;
    }

    async getEmailTokenByPersonId(person_id){
        const token = EmailTokens.findOne({where: {person_id: person_id}});
        return token;
    }

    async getPersonByRefreshToken(refreshToken){
        const person = await Persons.findOne({where: {refresh_token: refreshToken}});
        return person;
    }

    async getAllVotingSessions(){
        return await VotingSessions.findAll();
    }

    async getAllCandidatesOfVotingSession(session_id){
        return await Candidates.findAll({where: {voting_session_id: session_id}});
    }

    async addPersonsAddress(address, person_id){
        await Persons.update(
            {address: address},
            {where: {id: person_id}}
        );
    }

    async getPersonByCandidateId(candidateID){
        const candidate = await Candidates.findOne({where: {id: candidateID}});
        const person = this.getPersonById(candidate.person_id);
        return person;
    }

    async isAdmin(person_id){
        const person = await this.getPersonById(person_id);
        if(person.admin)
            return true;

        return false;
    }

    async addVotingSession(name){
        const dataToInsert = {
            name: name,
            date: Date.now(),
            isActive: false,
            terminated: false
        };

        const votingSession = await VotingSessions.create(dataToInsert);
        return votingSession;
    }

    async addCandidateForVotingSession(votingSession, candidateCNP){
        const person = await Persons.findOne({where: {cnp: candidateCNP}});
        if(!person)
            return null;

        const dataToInsert = {
            person_id: person.id,
            voting_session_id: votingSession.id
        }

        const res = await Candidates.create(dataToInsert);
        return res;
    }

    async deleteVotingSession(votingSession){
        const candidates = await Candidates.findAll({where: {voting_session_id: votingSession.id}});
        for(const candidate of candidates){
            await Candidates.destroy({where: {id: candidate.id}});
        }
        await VotingSessions.destroy({where: {id: votingSession.id}});
    }

    async getAllPersonAddresses(){
        const persons = await Persons.findAll();
        const addresses = [];
        for(const person of persons){
            addresses.push(person.address);
        }

        return addresses;
    }

    async updateIsSessionActive(votingSessionId){
        await VotingSessions.update(
            {isActive: true},
            {where: {id: votingSessionId}}
        );
    }

    async updateIsSessionNotActive(votingSessionId){
        await VotingSessions.update(
            {isActive: false},
            {where: {id: votingSessionId}}
        );
    }

    async terminateVote(votingSessionId){
        await VotingSessions.update(
            {terminated: true},
            {where: {id: votingSessionId}}
        );
    }

    async sessionIsTerminated(votingSessionId){
        const votingSession = await VotingSessions.findOne({where: {id: votingSessionId}});
        if(votingSession.terminated)
            return true;

        return false;
    }

    async isVotingSessionActive(votingSessionId){
        const votingSession = await VotingSessions.findOne({where: {id: votingSessionId}});
        if(votingSession.isActive)
            return true;

        return false;
    }
}

module.exports = DbService