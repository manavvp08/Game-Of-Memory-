"use strict";

// DOM Elements
const setupSection = document.querySelector(".setup__section");
const gameBoardSection = document.querySelector(".game__board__section");
const selectMode = document.querySelector(".select__theme__box");
const selectPlayers = document.querySelector(".select__player__box");
const selectGameTypeEL = document.querySelector(".select__grid__box");
const gameContainer = document.querySelector(".game__board");
const playerCount = document.querySelectorAll(".players");
const soloScoreBoard = document.querySelector(".solo__score__board");
const multiScoreBoard = document.querySelector(".multi__score__board");
const playerTime = soloScoreBoard.querySelector(".player__time");
const playerMove = soloScoreBoard.querySelector(".player__move");
const beginGameEl = document.querySelector(".start__game");

// Initialize the game board with default values
updateGameBoard(4, 4);

// Event Listeners
selectGameTypeEL.addEventListener("click", chooseGameType);
selectMode.addEventListener("click", chooseGameTheme);
selectPlayers.addEventListener("click", choosePlayers);
beginGameEl.addEventListener("click", startGame);

// Function to clear specific classes from elements
function clearClasses(elements, className) {
  elements.forEach((element) => {
    element.classList.remove(className);
  });
}

// Function to handle choosing a game theme
function chooseGameTheme(e) {
  const themesEl = document.querySelectorAll(".themes");
  clearClasses(themesEl, "themes__active");
  clearClasses(themesEl, "hover");

  const clickedElement = e.target.closest(".themes");
  if (clickedElement) {
    clickedElement.classList.add("themes__active");
    const theme = clickedElement.dataset.theme;
    gameContainer.className = `game__board ${theme}`;
  }

  themesEl.forEach((element) => {
    if (!element.classList.contains("themes__active")) {
      element.classList.add("hover");
    }
  });
}

// Function to handle choosing a game type
function chooseGameType(e) {
  const gridsEl = document.querySelectorAll(".grids");
  clearClasses(gridsEl, "grids__active");
  clearClasses(gridsEl, "hover");

  const clickedElement = e.target.closest(".grids");
  if (clickedElement) {
    clickedElement.classList.add("grids__active");
    const gridSize = clickedElement.dataset.gridSize;
    const [rows, cols] = gridSize.split("x").map(Number);
    updateGameBoard(rows, cols);
  }

  gridsEl.forEach((element) => {
    if (!element.classList.contains("grids__active")) {
      element.classList.add("hover");
    }
  });
}

// Function to handle choosing the number of players
function choosePlayers(e) {
  const playersEl = document.querySelectorAll(".players");

  clearClasses(playersEl, "players__active");
  clearClasses(playersEl, "hover");

  const clickedElement = e.target.closest(".players");
  if (clickedElement) {
    clickedElement.classList.add("players__active");
  }

  playersEl.forEach((element) => {
    if (!element.classList.contains("players__active")) {
      element.classList.add("hover");
    }
  });
}

// Function to generate an array of random numbers
function generateRandomNumbers(totalPairs) {
  const numbers = [];
  for (let i = 1; i <= totalPairs; i++) {
    numbers.push(i);
  }
  // Shuffle the numbers array to randomize the order
  numbers.sort(() => Math.random() - 0.5);
  return numbers;
}

// Function to shuffle an array randomly
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Function to update the game board with new rows and columns
function updateGameBoard(rows, cols) {
  // Clear the existing content
  gameContainer.innerHTML = "";
  gameContainer.classList.remove("game__board__4x4", "game__board__6x6");

  // Add the appropriate class to the game board container
  gameContainer.classList.add(`game__board__${rows}x${cols}`);

  // Calculate the total number of pairs needed
  const totalPairs = (rows * cols) / 2;

  const randomNumbers = generateRandomNumbers(totalPairs);
  const numberPairs = [];
  for (const number of randomNumbers) {
    numberPairs.push(number, number);
  }
  shuffleArray(numberPairs);

  // Generate the new game board
  for (let i = 0; i < numberPairs.length; i++) {
    const gameCircle = document.createElement("div");
    gameCircle.classList.add("game-circle");

    // Add the circle content element for revealing
    const circleContent = document.createElement("div");
    circleContent.classList.add("circle-content");
    circleContent.textContent = numberPairs[i];
    gameCircle.appendChild(circleContent);

    gameContainer.appendChild(gameCircle);
  }
}

// Function to start the game
function startGame(e) {
  e.preventDefault();
  setupSection.classList.add("none");
  gameBoardSection.classList.remove("none");
  let playerMoves = 0;
  startTimer();

  const circles = document.querySelectorAll(".game-circle");
  let revealedCircles = [];

  circles.forEach((circle) => {
    circle.addEventListener("click", function () {
      handleCircleClick(circle, revealedCircles, playerMoves);
    });
  });
}

// Function to handle circle clicks during the game
function handleCircleClick(circle, revealedCircles, playerMoves) {
  if (
    circle.classList.contains("settled") ||
    circle.classList.contains("revealed")
  ) {
    return;
  }

  circle.classList.add("revealed");
  revealedCircles.push(circle);

  if (revealedCircles.length === 2) {
    processRevealedCircles(revealedCircles, playerMoves);
    revealedCircles = [];
  }
}

// Function to process two revealed circles
function processRevealedCircles(revealedCircles, playerMoves) {
  const [circle1, circle2] = revealedCircles;
  playerMoves++;
  playerMove.textContent = playerMoves;

  const number1 = circle1.querySelector(".circle-content").textContent;
  const number2 = circle2.querySelector(".circle-content").textContent;

  if (number1 === number2) {
    setTimeout(() => {
      settleMatchingCircles(circle1, circle2);
      if (document.querySelectorAll(".settled").length === circles.length) {
        stopTimer();
      }
    }, 1000);
  } else {
    setTimeout(() => {
      hideCircles(circle1, circle2);
    }, 1000);
  }
}

// Function to settle matching circles
function settleMatchingCircles(circle1, circle2) {
  circle1.classList.add("settled");
  circle2.classList.add("settled");
  circle1.classList.remove("revealed");
  circle2.classList.remove("revealed");
}

// Function to hide non-matching circles
function hideCircles(circle1, circle2) {
  circle1.classList.remove("revealed");
  circle2.classList.remove("revealed");
}

// Timer variables
let startTime = 0;
let timerInterval = null;

// Function to start the timer
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

// Function to stop the timer
function stopTimer() {
  clearInterval(timerInterval);
}

// Function to update the timer display
function updateTimer() {
  const currentTime = Date.now();
  const elapsedTime = Math.floor((currentTime - startTime) / 1000);

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  playerTime.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
