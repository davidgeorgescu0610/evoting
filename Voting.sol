//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

contract Voting {

    struct Voter {
        address voterAddress;
        bool voted;
    }

    struct Candidate {
        address candidateAddress;
        uint candidateVoteCount;
    }

    struct Election {
        uint electionId;
        bool isActive;
        address electionChief;
        mapping (address => Candidate) candidates;
        mapping (address => Voter) voters;
    }

    mapping(uint => Election) elections;


    function createElection(uint _electionId, address _electionChief) external {
        require(_electionChief == msg.sender);
        elections[_electionId].electionId = _electionId;
        elections[_electionId].electionChief = _electionChief;
        elections[_electionId].isActive = false;
    }

    function startElection(uint _electionId, address[] memory _candidatesAddresses) external {
        require(elections[_electionId].electionChief == msg.sender);
        elections[_electionId].isActive = true;
        for(uint i = 0; i < _candidatesAddresses.length; i++) {
            elections[_electionId].candidates[_candidatesAddresses[i]].candidateAddress = _candidatesAddresses[i];
            elections[_electionId].candidates[_candidatesAddresses[i]].candidateVoteCount = 0;
        }
    }

    function endElection(uint _electionId) external {
        require(elections[_electionId].electionChief == msg.sender);
        elections[_electionId].isActive = false;
    }

    function addVotersInElection(uint _electionId, address[] memory _votersAddresses) external {
        require(elections[_electionId].electionChief == msg.sender);
        for(uint i = 0; i < _votersAddresses.length; i++){
            elections[_electionId].voters[_votersAddresses[i]].voterAddress = _votersAddresses[i];
            elections[_electionId].voters[_votersAddresses[i]].voted = false;
        }
    }

    function vote(uint _electionId, address _voterAddress, address _choice) external {
        require(elections[_electionId].isActive == true);
        require(_voterAddress == msg.sender);
        require(elections[_electionId].voters[_voterAddress].voted == false);
        elections[_electionId].voters[_voterAddress].voted = true;
        elections[_electionId].candidates[_choice].candidateVoteCount++;
    }

    function getCandidateResult(uint _electionId, address _candidateAddress) external view returns (uint) {
        return elections[_electionId].candidates[_candidateAddress].candidateVoteCount;
    }
}
