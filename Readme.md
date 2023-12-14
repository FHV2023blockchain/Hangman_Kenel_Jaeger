Hangman Smartcontract
By Rafael Jaeger and Christoph Kenel

Frontend:
https://fhv2023blockchain.github.io/Hangman_Kenel_Jaeger/

In this smartcontract you can pay to play a game of hangman. If you win you get a reward but if you lose your ETH is gone.
Contract Address:
0x885187A8FAa11A1Ef959bAB73f34455d5d14c3e5

How to use:
const abi = require("./build/contracts/Hangman.json");
var hangman = new web3.eth.Contract(abi['abi'],"0x885187A8FAa11A1Ef959bAB73f34455d5d14c3e5")

startGame(uint256 stake)
Starts a new game. The stake is 0.1.

Example:
hangman.startGame(web3.utils.toWei("0.1", "ether"), {from: playerAddress, value: web3.utils.toWei("0.1", "ether")});
hangman.methods.startGame(web3.utils.toWei("0.1", "ether")).send({from: playerAddress, value: web3.utils.toWei("0.1")})


guessLetter(bytes1 letter)
Guess a single letter. After 5 wrong guesses you lose.

Example:
hangman.guessLetter(web3.utils.asciiToHex("a"), {from: playerAddress});
hangman.methods.guessLetter(web3.utils.asciiToHex("a")).send({from: playerAddress});


guessWord(string memory guess)
Guess the word. If you are wrong you lose. If you are right you win.

Example:
hangman.guessWord("blockchain", {from: playerAddress});
hangman.methods.guessWord("blockchain").send({from: playerAddress});


getCurrentWordState()
Returns the current state of the word with all guessed letters revealed.

Example:
hangman.getCurrentWordState({from: playerAddress});
hangman.methods.getCurrentWordState().call({from: playerAddress});


getTriesLeft()
Returns the number of wrong guesses left.

Example:
hangman.getTriesLeft({from: playerAddress});
hangman.methods.getTriesLeft().call({ from: playerAddress })


isGameActive()
Checks if a game is active for the player.

Example:
hangman.isGameActive({from: playerAddress});
hangman.methods.isGameActive().call({ from: playerAddress })


deposit()
To deposit Ether on the contract.

Example:
hangman.deposit({from: depositorAddress, value: web3.utils.toWei("1", "ether")});
hangman.methods.deposit().send({ from: depositorAddress, value: web3.utils.toWei("1", "ether") });


withdrawFees()
Allows the owner to withdraw the Ether stored in the contract.

Example:
hangman.withdrawFees({from: ownerAddress});
hangman.methods.withdrawFees().send({ from: ownerAddress });
