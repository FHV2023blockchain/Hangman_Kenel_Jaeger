// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Hangman {

  address public owner;

  constructor() {
    owner = msg.sender;
  }

  struct Game {
    string word;
    bytes32 hashedWord;
    mapping(bytes1 => bool) guessedLetters;
    uint256 wrongGuessCount;
    bool isActive;
    uint256 stake;
  }

  string[] private wordList = [
    "explanation",
    "signature",
    "department",
    "literature",
    "assumption",
    "committee",
    "chemistry",
    "manufacturer",
    "investment",
    "celebration",
    "impression",
    "inspector",
    "difference",
    "refrigerator",
    "restaurant",
    "attention",
    "community",
    "philosophy",
    "importance",
    "economics",
    "government",
    "marketing",
    "efficiency",
    "foundation",
    "initiative",
    "environment",
    "distribution",
    "excitement",
    "secretary",
    "temperature",
    "revolution",
    "supermarket",
    "expression",
    "perception",
    "negotiation",
    "independence",
    "boyfriend",
    "description",
    "criticism",
    "percentage",
    "replacement",
    "consequence",
    "atmosphere",
    "reflection",
    "classroom",
    "population",
    "maintenance",
    "possession",
    "direction",
    "contribution"
  ];

  uint256 public constant MAX_TRIES = 5;
  uint256 public feePercentage = 10; // 10% fee
  mapping(address => Game) private games;

  // Event declarations
  event GameStarted(address indexed player, uint256 stake);
  event LetterGuessed(address indexed player, bytes letter, bool correct);
  event GameOver(address indexed player, bool won);

  function startGame(uint256 stake) public payable {
    require(msg.value == stake, "Stake amount not correct");
    require(!games[msg.sender].isActive, "Game already in progress");

    Game storage game = games[msg.sender];

    resetGuessedLetters(game);

    uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % wordList.length;
    string memory randomWord = wordList[randomIndex];

    game.word = randomWord;
    game.hashedWord = keccak256(abi.encodePacked(randomWord));
    game.wrongGuessCount = 0;
    game.isActive = true;
    game.stake = stake;

    emit GameStarted(msg.sender, stake);
  }


  function guessLetter(bytes1 letter) public {
    Game storage game = games[msg.sender];
    require(game.isActive, "No active game");
    require(!game.guessedLetters[letter], "Letter already guessed");

    game.guessedLetters[letter] = true;

    // Check if the guessed letter is in the word
    bool isCorrect = false;
    for (uint i = 0; i < bytes(game.word).length; i++) {
      if (bytes(game.word)[i] == letter) {
        isCorrect = true;
        break;
      }
    }

    if (!isCorrect) {
      game.wrongGuessCount++;
    }

    emit LetterGuessed(msg.sender, bytes(abi.encodePacked(letter)), isCorrect);

    if (game.wrongGuessCount >= MAX_TRIES) {
      endGame(false);
    }
  }

  function getCurrentWordState() public view returns (string memory) {
    Game storage game = games[msg.sender];
    require(game.isActive, "No active game");

    bytes memory wordBytes = bytes(game.word);
    bytes memory currentState = new bytes(wordBytes.length);

    for (uint i = 0; i < wordBytes.length; i++) {
      if (game.guessedLetters[wordBytes[i]]) {
        currentState[i] = wordBytes[i];
      } else {
        currentState[i] = "_";
      }
    }

    return string(currentState);
  }

  function getTriesLeft() public view returns (uint256) {
    Game storage game = games[msg.sender];
    require(game.isActive, "No active game");
    return MAX_TRIES - game.wrongGuessCount;
  }

  function isGameActive() public view returns (bool) {
    return games[msg.sender].isActive;
  }


  function guessWord(string memory guess) public {
    Game storage game = games[msg.sender];
    require(game.isActive, "No active game");
    
    if (keccak256(abi.encodePacked(guess)) == game.hashedWord) {
      endGame(true);
    } else {
      endGame(false);
    }
  }

  function endGame(bool won) internal {
    Game storage game = games[msg.sender];
    game.isActive = false;

    if (won) {
      uint256 reward = game.stake + ((game.stake * (100 - feePercentage)) / 100);
      (bool sent, ) = payable(msg.sender).call{value: reward}("");
      require(sent, "Failed to send Ether");
    }

    emit GameOver(msg.sender, won);
  }

  function resetGuessedLetters(Game storage game) private {
    bytes memory alphabet = "abcdefghijklmnopqrstuvwxyz";
    for (uint i = 0; i < alphabet.length; i++) {
      game.guessedLetters[bytes1(alphabet[i])] = false;
    }
  }


  function deposit() public payable {
    // Funds will be stored in the contract
  }

  function withdrawFees() public {
    require(msg.sender == owner, "Only the owner can withdraw fees");
    payable(owner).transfer(address(this).balance);
  }
}
