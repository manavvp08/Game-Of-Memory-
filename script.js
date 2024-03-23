"use strict";

const body = document.querySelector("body");
const setupSection = document.querySelector(".setup__section");
const gameBoardSection = document.querySelector(".game__board__section");
const selectMode = document.querySelector(".select__theme__box");
const selectPlayers = document.querySelector(".select__player__box");
const selectGameTypeEL = document.querySelector(".select__grid__box");
const gameContainer = document.querySelector(".game__board");
const playersBoard = document.querySelector(".players__board");
const playerCount = document.querySelectorAll(".players");
const soloScoreBoard = playersBoard.querySelector(".solo__score__board");
const multiScoreBoard = playersBoard.querySelector(".multi__score__board");
const playerTime = soloScoreBoard.querySelector(".player__time");
const playerMove = soloScoreBoard.querySelector(".player__move");
const beginGameEl = document.querySelector(".start__game");
const playerBoxes = document.querySelectorAll(".player__box");
const multiplayerWinnerContainer = document.querySelector(".winner__container");
const soloWinnerContainer = document.querySelector(".solo__winner__container");
const overlay = document.querySelector(".overlay");
const soloWinnerTime = document.querySelector(".solo__winner__time");
const soloWinnerMove = document.querySelector(".solo__winner__moves");
const restartButton = document.querySelector(".restart");
const restartBtn = document.querySelectorAll(".winner__restart");
const newGameButton = document.querySelector(".new__game");
const newGameBtn = document.querySelectorAll(".winner__new__game");
const resumeGame = document.querySelector(".resume__game");
const menu = document.querySelector(".menu");
const decisionContainer = document.querySelector(".decision__container");

// Initial game variables
let activePlayerIndex = 0;
let selectedPlayerCount = 1;
let playerMoves = 0;
let revealedCircles = [];
// Timer variables
let startTime = 0;
let timerInterval = null;

// Array of icons' file paths
const icons = [
  "assets/icons/calculator.svg",
  "assets/icons/calendar.svg",
  "assets/icons/car-simple.svg",
  "assets/icons/car.svg",
  "assets/icons/club.svg",
  "assets/icons/google-drive.svg",
  "assets/icons/run.svg",
  "assets/icons/seal-check.svg",
  "assets/icons/shield-star.svg",
  "assets/icons/skull.svg",
  "assets/icons/spiral.svg",
  "assets/icons/unite.svg",
  "assets/icons/walk.svg",
  "assets/icons/wall.svg",
  "assets/icons/wallet.svg",
  "assets/icons/webhooks.svg",
  "assets/icons/wind.svg",
  "assets/icons/wine.svg",
];

// Display the menu when clicked
const displayMenu = function () {
  decisionContainer.style.display = "block";
  overlay.classList.remove("none");
  body.classList.add("mobile");
};

// Close the menu when needed
const closeMenu = function () {
  decisionContainer.style.display = "none";
  overlay.classList.add("none");
};

// Select game theme (numbers or icons) and update the game board
const chooseGameTheme = function (e) {
  const themesEl = document.querySelectorAll(".themes");

  const clickedElement = e.target.closest(".themes");

  if (!clickedElement) return;
  if (clickedElement) {
    themesEl.forEach((element) => {
      element.classList.remove("themes__active");
      element.classList.remove("hover");
    });
    clickedElement.classList.add("themes__active");

    const theme = clickedElement.dataset.theme;
    gameContainer.classList.remove("numbers", "icons");
    gameContainer.classList.add(`${theme}`);
  }

  themesEl.forEach((element) => {
    if (!element.classList.contains("themes__active")) {
      element.classList.add("hover");
    }
  });

  const gridSizeClass = Array.from(gameContainer.classList).find((className) =>
    className.startsWith("game__board__")
  );

  if (gridSizeClass) {
    const gridSize = gridSizeClass.replace("game__board__", "");
    const [rows, cols] = gridSize.split("x").map(Number);
    updateGameBoard(rows, cols);
    // startGame();
  }
};

// Select game grid type (4x4 or 6x6) and update the game board
const chooseGameType = function (e) {
  const gridsEl = document.querySelectorAll(".grids");

  const clickedElement = e.target.closest(".grids");
  if (clickedElement) {
    gridsEl.forEach((element) => {
      element.classList.remove("grids__active");
      element.classList.remove("hover");
    });
    clickedElement.classList.add("grids__active");

    // Determine the grid size based on the clicked element
    const gridSize = clickedElement.dataset.gridSize;
    const [rows, cols] = gridSize.split("x").map(Number);

    // Update the game board based on the selected grid size
    updateGameBoard(rows, cols);
  }

  gridsEl.forEach((element) => {
    if (!element.classList.contains("grids__active")) {
      element.classList.add("hover");
    }
  });
};

// Select number of players and update the scoreboards
const choosePlayers = function (e) {
  const playersEl = document.querySelectorAll(".players");

  const clickedElement = e.target.closest(".players");
  if (clickedElement) {
    playersEl.forEach((element) => {
      element.classList.remove("players__active");
      element.classList.remove("hover");
    });
    clickedElement.classList.add("players__active");
  }

  playersEl.forEach((element) => {
    if (!element.classList.contains("players__active")) {
      element.classList.add("hover");
    }
  });
};
// Handle player count selection and update scoreboards accordingly
playerCount.forEach((player) => {
  player.addEventListener("click", function (e) {
    selectedPlayerCount = parseInt(player.dataset.players);
    const allPlayerElements = playersBoard.querySelectorAll(".players__box");

    // Show/hide the appropriate score boards based on the selected player count
    if (selectedPlayerCount === 1) {
      soloScoreBoard.classList.remove("none");
      multiScoreBoard.classList.add("none");
    } else {
      soloScoreBoard.classList.add("none");
      multiScoreBoard.classList.remove("none");
    }

    allPlayerElements.forEach((element, index) => {
      if (index < selectedPlayerCount) {
        element.classList.remove("none");
      } else {
        element.classList.add("none");
      }
    });
  });
});

// Handle switching between active players' turns
const handlePlayerTurn = function () {
  setTimeout(() => {
    const currentPlayer = playerBoxes[activePlayerIndex];

    // Calculate the index of the next active player in a cyclic manner and update activePlayerIndex
    activePlayerIndex = (activePlayerIndex + 1) % selectedPlayerCount;
    const nextPlayer = playerBoxes[activePlayerIndex];

    if (!nextPlayer) return;

    currentPlayer.classList.remove("player__box__active");
    currentPlayer.nextElementSibling.classList.add("hidden");
    nextPlayer.classList.add("player__box__active");
    nextPlayer.nextElementSibling.classList.remove("hidden");
  }, 1000);
};

// Update the active player's score
const updatePlayerScore = function () {
  setTimeout(() => {
    const currentPlayerScore = parseInt(
      playerBoxes[activePlayerIndex]?.querySelector(".players__scores")
        .textContent
    );

    playerBoxes[activePlayerIndex].querySelector(
      ".players__scores"
    ).textContent = currentPlayerScore + 1;
  }, 950);
};

// Shuffles the elements in an array using the Fisher-Yates shuffle algorithm
const shuffleArray = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// Update the game board with the specified number of rows and columns
const updateGameBoard = function (rows, cols) {
  // Clear the existing content
  gameContainer.innerHTML = "";

  // Remove any previous grid size class and add the new one
  gameContainer.classList.remove("game__board__4x4", "game__board__6x6");
  gameContainer.classList.add(`game__board__${rows}x${cols}`);

  // Calculate the total number of pairs needed for the game
  const totalPairs = (rows * cols) / 2;

  // Determine which content generator function to use based on the game mode
  const contentGenerator = gameContainer.classList.contains("numbers")
    ? generateRandomNumbers
    : generateRandomIcons;

  // Generate an array of pairs using the content generator function
  const pairs = contentGenerator(totalPairs);

  // Duplicate the pairs to create a matching pair for each element
  const contentArray = [];
  for (const content of pairs) {
    contentArray.push(content, content);
  }

  // Shuffle the array to randomize the placement of content on the game board
  shuffleArray(contentArray);

  // Generate the game board by creating circles with appropriate content
  for (let i = 0; i < contentArray.length; i++) {
    const gameCircle = document.createElement("div");
    gameCircle.classList.add("game-circle");

    // Create a content element within the circle for revealing
    const circleContent = document.createElement("div");
    circleContent.classList.add("circle-content");

    // Set content based on the game mode (numbers or icons)
    if (gameContainer.classList.contains("numbers")) {
      circleContent.textContent = contentArray[i];
    } else if (gameContainer.classList.contains("icons")) {
      circleContent.style.backgroundImage = `url(${contentArray[i]})`;
    }

    // Append the content element to the circle and add to the game container
    gameCircle.appendChild(circleContent);
    gameContainer.appendChild(gameCircle);
  }
};

// Start the game
const startGame = function (e) {
  // e.preventDefault();
  setupSection.classList.add("none");
  gameBoardSection.classList.remove("none");
  startTimer();
  const circles = document.querySelectorAll(".game-circle");

  circles.forEach((circle) => {
    circle.addEventListener("click", () => handleCircleClick(circle, circles));
  });
};

// Handle clicking on a game circle
const handleCircleClick = function (circle, circles) {
  // Check if the circle is already settled or revealed
  if (
    circle.classList.contains("settled") ||
    circle.classList.contains("revealed")
  ) {
    return; // Ignore clicks on settled or revealed circles
  }

  // Mark the clicked circle as revealed and add it to the revealedCircles array
  circle.classList.add("revealed");
  revealedCircles.push(circle);

  // If two circles are revealed, check for a match
  if (revealedCircles.length === 2) {
    // Destructure the two revealed circles
    const [circle1, circle2] = revealedCircles;

    // Increment the player's move count and update the move display
    playerMoves++;
    playerMove.textContent = playerMoves;

    // Handle the change of player's turn
    handlePlayerTurn();

    // Extract the content from the revealed circles
    const number1 = circle1.querySelector(".circle-content").textContent;
    const number2 = circle2.querySelector(".circle-content").textContent;

    const icon1 =
      circle1.querySelector(".circle-content").style.backgroundImage;
    const icon2 =
      circle2.querySelector(".circle-content").style.backgroundImage;

    // Check if the content matches based on the game mode (numbers or icons)
    if (gameContainer.classList.contains("numbers")) {
      if (number1 === number2) {
        handlePairMatch(circle1, circle2, circles);
        updatePlayerScore();
      } else {
        handlePairMismatch(circle1, circle2);
      }
    } else if (gameContainer.classList.contains("icons")) {
      if (icon1 === icon2) {
        handlePairMatch(circle1, circle2, circles);
        updatePlayerScore();
      } else {
        handlePairMismatch(circle1, circle2);
      }
    }

    // Clear the revealedCircles array for the next turn
    revealedCircles = [];
  }
};

// Handle a matching pair of circles
const handlePairMatch = function (circle1, circle2, circles) {
  setTimeout(() => {
    circle1.classList.add("settled");
    circle2.classList.add("settled");
    circle1.classList.remove("revealed");
    circle2.classList.remove("revealed");

    displaySoloResults(circles);
    displayMultiResults(circles);
  }, 1000);
};

// Handle a mismatched pair of circles
const handlePairMismatch = function (circle1, circle2) {
  // If the numbers don't match, hide the circles after a delay
  setTimeout(() => {
    circle1.classList.remove("revealed");
    circle2.classList.remove("revealed");
  }, 1000);
};

// Display results for single-player mode
const displaySoloResults = function (circles) {
  // Check if all circles are settled (all pairs are matched)
  if (document.querySelectorAll(".settled").length === circles.length) {
    stopTimer();

    // Display the winner container and overlay for single-player mode
    if (selectedPlayerCount === 1) {
      soloWinnerContainer.classList.remove("none");
      overlay.classList.remove("none");
      soloWinnerTime.textContent = playerTime.textContent;
      soloWinnerMove.textContent = `${playerMove.textContent} Moves`;
    }
  }
};

// Start the timer
const startTimer = function () {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
};

// Stop the timer
const stopTimer = function () {
  clearInterval(timerInterval);
};

// Update the timer display
const updateTimer = function () {
  const currentTime = Date.now();
  const elapsedTime = Math.floor((currentTime - startTime) / 1000);

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  const timerElement = document.querySelector(".player__time");
  timerElement.textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

// Generate an array of random numbers for the game
const generateRandomNumbers = function (totalPairs) {
  const numbers = [];
  for (let i = 1; i <= totalPairs; i++) {
    numbers.push(i);
  }
  // Shuffle the numbers array to randomize the order
  numbers.sort(() => Math.random() - 0.5);
  return numbers;
};

// Generate an array of random icons for the game
const generateRandomIcons = function (totalPairs) {
  const shuffledIcons = [...icons];

  shuffleArray(shuffledIcons);

  // Return a slice of the shuffled icons array containing the required number of pairs
  return shuffledIcons.slice(0, totalPairs);
};

// Display results for multiplayer mode
const displayMultiResults = function (circles) {
  // Check if all circles are settled (all pairs are matched)
  if (document.querySelectorAll(".settled").length === circles.length) {
    // Check if the game is being played in multiplayer mode
    if (selectedPlayerCount > 1) {
      // Display the multiplayer winner container and overlay
      multiplayerWinnerContainer.classList.remove("none");
      overlay.classList.remove("none");

      // Get the multi-score board and all player boxes
      const multiScoreBoard = playersBoard.querySelector(
        ".multi__score__board"
      );
      const allPlayerBoxes = multiScoreBoard.querySelectorAll(".players__box");

      // Create an array to store player data (name and score)
      const playerData = [];

      // Gather player data from player boxes
      allPlayerBoxes.forEach((element, index) => {
        if (index < selectedPlayerCount) {
          const playerName =
            element.querySelector(".multi__players").textContent;
          const playerScore = parseInt(
            element.querySelector(".players__scores").textContent
          );
          playerData.push({
            name: playerName.trim(),
            score: playerScore,
            index: index,
          });
        }
      });

      // Sort players by score in descending order
      playerData.sort((a, b) => b.score - a.score);

      // Get the winning score and decision text element
      const winningScore = playerData[0].score;
      const decisionText =
        multiplayerWinnerContainer.querySelector(".winner__text");

      // Update "winner__box" elements with sorted player data
      const winnerBoxes = document.querySelectorAll(".winner__box");
      winnerBoxes.forEach((winnerBox, index) => {
        const winnerPlayer = winnerBox.querySelector(".winner__player");
        const winnerMoves = winnerBox.querySelector(".winner__moves");

        if (index < playerData.length) {
          // Extract data from the current player's entry in playerData
          const { name, score, index: playerIndex } = playerData[index];

          // Set the text content of winnerPlayer based on the player's position and score
          winnerPlayer.textContent = `${name} ${
            index === 0 || (index > 0 && score === winningScore)
              ? "(Winner!)"
              : ""
          }`;

          // Set the text content of winnerMoves to display the player's score in pairs
          winnerMoves.textContent = `${score} Pairs`;
          winnerBox.classList.remove("none");

          // If the player's score matches the winning score, highlight the winnerBox
          if (score === winningScore) {
            winnerBox.classList.add("winner__box__active");
          } else {
            winnerBox.classList.remove("winner__box__active");
          }

          // If there is more than one player with the winning score, display a tie message
          if (
            playerData.filter((player) => player.score === winningScore)
              .length > 1
          ) {
            decisionText.textContent = `It’s a tie!`;
          } else {
            // Display the name of the winning player
            decisionText.textContent = `${
              playerData.find((player) => player.score === winningScore).name
            } wins!`;
          }
        } else {
          winnerBox.classList.add("none");
        }
      });

      // Display the winner container
      multiplayerWinnerContainer.classList.remove("none");
      overlay.classList.remove("none");
    }
  }
};

// Restart the game
const restartGame = function () {
  const playerBoxes = document.querySelectorAll(".player__box");
  const circles = document.querySelectorAll(".game-circle");
  // Hide winner containers and reset UI elements
  multiplayerWinnerContainer.classList.add("none");
  soloWinnerContainer.classList.add("none");
  overlay.classList.add("none");
  if (window.innerWidth < 460) {
    decisionContainer.style.display = "none";
  }

  // Reset player scores and moves
  playerBoxes.forEach((element, index) => {
    if (index < selectedPlayerCount) {
      element.querySelector(".players__scores").textContent = 0;
    }
  });
  playerMove.textContent = 0;
  playerMoves = 0;

  // Reset revealed circles or settled circles
  circles.forEach((circle) => {
    circle.classList.remove("revealed", "settled");
  });

  // Remove active player class from current player box
  const currentPlayer = playerBoxes[activePlayerIndex];
  activePlayerIndex = (activePlayerIndex + 1) % selectedPlayerCount;
  const nextPlayer = playerBoxes[activePlayerIndex];
  if (!nextPlayer) return;

  currentPlayer.classList.remove("player__box__active");
  currentPlayer.nextElementSibling.classList.add("hidden");

  // Add "player__box__active" class to the first player box
  playerBoxes[0].classList.add("player__box__active");
  playerBoxes[0].nextElementSibling.classList.remove("hidden");

  // Reset active player index
  activePlayerIndex = 0;

  // Generate new numbers/icons for circles based on selected grid size
  const gridSizeClass = Array.from(gameContainer.classList).find((className) =>
    className.startsWith("game__board__")
  );

  if (gridSizeClass) {
    const gridSize = gridSizeClass.replace("game__board__", "");
    const [rows, cols] = gridSize.split("x").map(Number);
    updateGameBoard(rows, cols);
    startGame();
  }
};

// Start a new game
const newGame = function () {
  location.reload();
};

// Event listeners for restarting and starting new games
restartButton.addEventListener("click", restartGame);
restartBtn.forEach((btn) => btn.addEventListener("click", restartGame));
newGameButton.addEventListener("click", newGame);
newGameBtn.forEach((btn) => btn.addEventListener("click", newGame));

// Event listeners for selecting game type, theme, and players
selectGameTypeEL.addEventListener("click", chooseGameType);
selectMode.addEventListener("click", chooseGameTheme);
selectPlayers.addEventListener("click", choosePlayers);
beginGameEl.addEventListener("click", startGame);
menu.addEventListener("click", displayMenu);
resumeGame.addEventListener("click", closeMenu);

// Initialize the game with a 4x4 grid
updateGameBoard(4, 4);
