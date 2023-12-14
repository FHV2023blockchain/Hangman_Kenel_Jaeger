const contractAddress = "0x885187A8FAa11A1Ef959bAB73f34455d5d14c3e5";

let contract;
let userAccount;

window.addEventListener('load', async () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
            // Request account access
            await ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = ethereum.selectedAddress;
            // Load the contract ABI
            fetch("../build/contracts/Hangman.json")
                .then(response => response.json())
                .then(data => {
                    const contractABI = data.abi; // Make sure this matches the structure of your JSON file
                    contract = new web3.eth.Contract(contractABI, contractAddress);
                    console.log(contract);
                });
        } catch (error) {
            console.error("Access to your Ethereum account denied.");
        }
    } else {
        alert('Please install MetaMask!');
    }

    createLetterButtons();
    const guessWordButton = document.getElementById('guessWordButton');
    guessWordButton.onclick = guessWord;
    const startGameButton = document.getElementById('startGame');
    startGameButton.onclick = () => startGame(0.1);
});

function createLetterButtons() {
    const letterButtonsDiv = document.getElementById('letterButtons');
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    letters.split('').forEach(letter => {
        const button = document.createElement('button');
        button.className = 'letter-button';
        button.textContent = letter;
        button.onclick = () => guessLetter(letter);
        button.disabled = true; // Initially disable the buttons
        letterButtonsDiv.appendChild(button);
    });
}

function enableLetterButtons(enable) {
    const buttons = document.querySelectorAll('.letter-button');
    buttons.forEach(button => {
        button.disabled = !enable;
    });
}


// Contract interactions
async function startGame(stakeEther) {
    const stakeWei = web3.utils.toWei(stakeEther.toString(), 'ether');

    try {
        await contract.methods.startGame(stakeWei).send({from: userAccount, value: stakeWei})
        console.log("Game started");
        enableLetterButtons(true);
        await updateCurrentWordState();
    } catch (error) {
        console.error("Error starting the game:", error);
    }
}

function guessLetter(letter) {
    contract.methods.guessLetter(web3.utils.asciiToHex(letter.toLowerCase())).send({ from: userAccount })
        .then(result => {
            console.log("Letter guessed:", letter, result);
        })
        .catch(error => {
            console.error("Error guessing letter:", error);
        });
    updateCurrentWordState();
}

function guessWord() {
    let guess = document.getElementById('wordGuessInput').value;
    guess = guess.trim().toLowerCase();

    // Check if the input is not empty
    if (guess === "") {
        alert("Please enter a word to guess.");
        return;
    }

    // Call the guessWord function of the smart contract
    contract.methods.guessWord(guess).send({ from: userAccount })
        .then(result => {
            console.log("Word guessed: ", guess, result);
        })
        .catch(error => {
            console.error("Error guessing the word:", error);
        });
}

async function updateCurrentWordState() {
    try {
        const currentWordState = await contract.methods.getCurrentWordState().call({ from: userAccount });
        document.querySelector('.word-state').innerText = currentWordState.toUpperCase();
    } catch (error) {
        console.error("Error retrieving the current word state:", error);
    }
}








