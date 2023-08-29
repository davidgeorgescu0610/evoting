const fs = require('fs');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(process.env.PRIVATE_BLOCKCHAIN);
const web3 = new Web3(provider);

const admin = "0x6Fe1922f9e8F42851a01b75745FF92E4E7535DbE";
const contractAbi = require('../../../abi.json');
const contractAddress = "0x371B3A5f80Fa9bF38b63dB031AE61dca87CE3813"
console.log(contractAddress);
const myContract = new web3.eth.Contract(contractAbi, contractAddress);

let instance = null;

class BlockchainService{
    static getBlockchainServiceInstance(){
        if(instance == null)
            return new BlockchainService();

        return instance;
    }

    async createAccount(){
        const newAccount = await web3.eth.accounts.create();
    
        console.log(newAccount);

        const transaction = await web3.eth.sendTransaction({
            from: admin,
            to: newAccount.address,
            value: web3.utils.toWei('100', 'ether')
        })

        console.log(transaction);

        const balance = await web3.eth.getBalance(newAccount.address);

        console.log(balance);

        return newAccount;
    }

    async privateKeyToAccount(privateKey){
        return await web3.eth.accounts.privateKeyToAccount(privateKey);
    }

    async sendSignedVote(votingSessionId, voterAddress, candidateAddress, privateKey){
        const contractInstance = new web3.eth.Contract(contractAbi, contractAddress);
        const functionName = 'vote';
        const functionArgs = [parseInt(votingSessionId), voterAddress, candidateAddress];
        const txObject = contractInstance.methods[functionName](...functionArgs);

        console.log(functionArgs);

        const nonce = await web3.eth.getTransactionCount(voterAddress);
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 2000000;
        const txParams = {
            nonce: web3.utils.toHex(nonce),
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit),
            to: contractAddress,
            data: txObject.encodeABI(),
        };

        const signedTx = await web3.eth.accounts.signTransaction(txParams, privateKey);

        try{
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log(receipt);
        } catch(err){
            console.log(err);
            console.log("Already voted");
            return false;
        }

        return true;
    }

    async getResults(votingSessionId, candidates) {
        const results = []

        for(const candidate of candidates){
            const result = await myContract.methods.getCandidateResult(votingSessionId, candidate.address).call();
            results.push({
                name: candidate.name,
                result: result
            });
        }

        return results;
    }

    async createSession(votingSessionId){
        const result = await myContract.methods.createElection(votingSessionId, admin).send({from: admin});
        console.log(result);
    }

    async startVote(votingSessionId, candidates){
        const result = await myContract.methods.startElection(votingSessionId, candidates).send({from: admin});
        console.log(result);
    }

    async addVoters(votingSessionId, voters){
        const result = await myContract.methods.addVotersInElection(votingSessionId, voters).send({from: admin});
        console.log(result);
    }

    async stopVote(votingSessionId){
        const result = await myContract.methods.endElection(votingSessionId).send({from: admin});
        console.log(result);
    }
}

module.exports = BlockchainService
