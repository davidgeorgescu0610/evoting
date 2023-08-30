# evoting

Here it is described the online electronic voting system.

The repo contains the web application code which can be found in web_app directory and the smart contract (Voting.sol)

Steps to create a private blockchain network using Geth (each node runs on a separate Linux vm):

1. Download an archive containing helpful tools from https://geth.ethereum.org/downloads. The tools i used from the archive are *geth* and *puppeth*. Visit https://geth.ethereum.org/docs/fundamentals/private-network for more explanations.
2. Let's say the network contains 3 sealer node. You need to create an Ethereun account for each. So, on each machine execute *geth account new --datadir data*. Very important, you will recive public key(address) and private key of each account. Save them!
3. Now you have to create the genesis file. So, only on one vm run just *puppeth*. This command will run a program which helps you to create the genesis file. Step 4 explains the creation.
4. Firstly, you have to provide the name of the network. Then choose option 2 *Configure new genesis*, then option 1 *Create new genesis from scratch*. After that, choose 2 for PoA consensus. At the next step you can let the default. Now you have to introduce the public key (step 2) of each node in order to allow them to be sealer nodes. After that you have to prefund the sealer nodes, so again you have to introduce the address of each node. Next step, write "no" and the specify the chain id/network id (e.g. 100).
5. Now the genesis file is created, you need to export it. Run *puppeth* again if you stopped it and provide the name of the network. Now choose option 2 *Manage existing genesis* and option 2 again *Export genesis configurations*. Just press *enter* and now you can find the genesis file in the current directory.
6. Share the genesis file to all nodes.
7. Initialize each node using command *geth init --datadir data genesis.json* (genesis.json is an example name, probably your genesis has another name)
8. Start the first node: *geth --datadir data --networkid 100 --nat extip:10.13.0.61 --port 30303 --ipcdisable –syncmode full --http --allow-insecure-unlock --http.corsdomain “*” –http.addr 127.0.0.1 –http.port 8545 --unlock 0xB974F3F3B8fb8afE3dCD82cEf804f06b447342cc --password pass.txt --mine console* (first node will be bootstrap node, nat param is used to aware the node that it is bootstrap node and that is its IP).
9. Check https://geth.ethereum.org/docs/fundamentals/private-network#setting-up-networking for learning how to find the bootnode record. This helps you to run the other nodes
10. Start the other nodes: *geth --datadir data --networkid 100 --bootnodes enr:-KO4QPvU2KoM8M9c2AH9E2X9S0usDwJCn3VzChHOTgY7399pQI6xldNWRbr6gFgWY8hy54JbUzNXv5QFN6imEhWmdVSGAYjh9ef9g2V0aMfGhLiX_cSAgmlkgnY0gmlwhAoNAD2Jc2VjcDI1NmsxoQKKbQLBemE76JPjTkXnKDOjICJXPNrypxSrL83s6KeC54RzbmFwwIN0Y3CCdl-DdWRwgnZf --port 30304 --ipcdisable --syncmode full --http --allow-insecure-unlock --http.corsdomain "*" --http.addr 127.0.0.1 --http.port 8545 --unlock 0x4f7550D58fAe752727F9AD8c60e5090d482816B9 --password pass.txt --mine console*

NOW THE NETWORK IS RUNNING.
BONUS: steps to deploy a smart contract on the network.

12. Truffle installation -> https://trufflesuite.com/docs/truffle/how-to/install/
13. create a directory and move to it then run *truffle init*. Some files and directories will be created.
14. Put your smart contract in the directory named *contracts*.
15. Create a file named *1_deploy_contracts.js* and write this code in it:
const contract = artifacts.require('ContractName.sol');

module.exports = function (deployer) {
            deployer.deploy(contract);
}

16. In *truffle-config.js* replace with this:
    networks: {
        private: {
                host: "127.0.0.1",
                port: 8545,
                network_id: 100,
        }
    },
17. run *truffle migrate --network private*

NOW YOU HAVE A RUNNING PRIVATE BLOCKCHAIN NETWORK AND A SMART CONTRACT DEPLOYED ON IT.
