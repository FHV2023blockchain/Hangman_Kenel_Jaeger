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
            fetch("./build/contracts/Hangman.json")
                .then(response => response.json())
                .then(data => {
                    const contractABI = data.abi; // Make sure this matches the structure of your JSON file
                    contract = new web3.eth.Contract(contractABI, contractAddress);
                    listenForGameOver();
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
    startGameButton.onclick = startGame;
});

document.addEventListener('DOMContentLoaded', function() {
    const stakeInput = document.getElementById('stakeAmount');
    const startGameButton = document.getElementById('startGame');

    stakeInput.addEventListener('input', function() {
        const stakeValue = parseFloat(stakeInput.value);
        startGameButton.disabled = isNaN(stakeValue) || stakeValue <= 0 || stakeValue >= 0.5;
    });

    startGameButton.onclick = startGame;
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

function enableGame(enable) {
    const buttons = document.querySelectorAll('.letter-button');
    buttons.forEach(button => {
        button.disabled = !enable;
    });
    document.getElementById('wordGuessInput').disabled = !enable;
    document.getElementById('guessWordButton').disabled = !enable;
}


async function startGame() {
    const stakeInput = document.getElementById('stakeAmount');
    const stakeEther = stakeInput.value;

    if (!stakeEther || isNaN(stakeEther) || parseFloat(stakeEther) <= 0 || parseFloat(stakeEther) >= 0.5) {
        alert("Please enter a valid stake amount between 0 and 0.5.");
        return;
    }

    const stakeWei = web3.utils.toWei(stakeEther.toString(), 'ether');
    
    document.getElementById('startGame').disabled = true;
    document.getElementById('stakeAmount').disabled = true;

    try {
        await contract.methods.startGame(stakeWei).send({from: userAccount, value: stakeWei});
        console.log("Game started");
        updateCurrentWordState();
        enableGame(true);
        updateCurrentWordState();
        updateTriesLeft();
    } catch (error) {
        console.error("Error starting the game:", error);
        document.getElementById('startGame').disabled = false;
        document.getElementById('stakeAmount').disabled = false;
    }
}

async function guessLetter(letter) {
    enableGame(false);
    try {
        const result = await contract.methods.guessLetter(web3.utils.asciiToHex(letter.toLowerCase())).send({ from: userAccount });
        console.log("Letter guessed:", letter, result);
        updateCurrentWordState();
        updateTriesLeft();
    } catch (error) {
        console.error("Error guessing letter:", error);
    }
    enableGame(true);
}

async function guessWord() {
    enableGame(false);
    let guess = document.getElementById('wordGuessInput').value;
    guess = guess.trim().toLowerCase();

    // Check if the input is not empty
    if (guess === "") {
        alert("Please enter a word to guess.");
        enableGame(true);
        return;
    }

    // Call the guessWord function of the smart contract
    try {
        const result = await contract.methods.guessWord(guess).send({ from: userAccount });
        console.log("Word guessed: ", guess, result);
    } catch (error) {
        console.error("Error guessing the word:", error);
    }
    enableGame(true);
}

async function updateCurrentWordState() {
    try {
        const currentWordState = await contract.methods.getCurrentWordState().call({ from: userAccount });
        document.querySelector('.word-state').innerText = formatWordState(currentWordState.toUpperCase());
    } catch (error) {
        console.error("Error retrieving the current word state:", error);
    }
}

async function updateTriesLeft() {
    try {
        const triesLeft = await contract.methods.getTriesLeft().call({ from: userAccount });
        document.getElementById('triesLeft').innerText = triesLeft.toString();
    } catch (error) {
        console.error("Error retrieving tries left:", error);
    }
}

function formatWordState(wordState) {
    return wordState.split('').join(' ');
}

function listenForGameOver() {
    contract.events.GameOver({
        filter: { player: userAccount },
        fromBlock: 'latest'
    })
    .on('data', async function(event) {
        const { won } = event.returnValues;
        displayGameOverMessage(won);
    })
    .on('error', console.error);
}

function displayGameOverMessage(won, reward) {
    const message = won ? `Congratulations! You won!` : "Sorry, you lost. Try again!";
    alert(message);

    // Re-enable the 'Start Game' button and the stake input field
    document.getElementById('startGame').disabled = false;
    document.getElementById('stakeAmount').disabled = false;

    // Disable the game
    enableGame(false);

    // Reset the word state and tries left
    document.querySelector('.word-state').innerText = "_";
    document.getElementById('triesLeft').innerText = "5";
}

