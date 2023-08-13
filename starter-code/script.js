"use strict";

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

// const chooseGameType = function (e) {
//   const gridsEl = document.querySelectorAll(".grids");
//   gridsEl.forEach((e) => {
//     e.classList.remove("grids__active");
//     e.classList.remove("hover");
//   });
//   const clickedElement = e.target.closest(".grids");
//   if (clickedElement) {
//     clickedElement.classList.add("grids__active");
//   }
//   gridsEl.forEach((element) => {
//     if (!element.classList.contains("grids__active")) {
//       element.classList.add("hover");
//     }
//   });
// };
const chooseGameTheme = function (e) {
  const themesEl = document.querySelectorAll(".themes");
  themesEl.forEach((element) => {
    element.classList.remove("themes__active");
    element.classList.remove("hover");
  });

  const clickedElement = e.target.closest(".themes");
  if (clickedElement) {
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
};
const chooseGameType = function (e) {
  const gridsEl = document.querySelectorAll(".grids");
  gridsEl.forEach((element) => {
    element.classList.remove("grids__active");
    element.classList.remove("hover");
  });

  const clickedElement = e.target.closest(".grids");
  if (clickedElement) {
    clickedElement.classList.add("grids__active");

    // Determine the grid size based on the clicked element
    const gridSize = clickedElement.dataset.gridSize;
    const [rows, cols] = gridSize.split("x").map(Number);
    console.log(gridSize);
    console.log(rows, cols);

    // Update the game board based on the selected grid size
    updateGameBoard(rows, cols);
  }

  gridsEl.forEach((element) => {
    if (!element.classList.contains("grids__active")) {
      element.classList.add("hover");
    }
  });
};

const choosePlayers = function (e) {
  const playersEl = document.querySelectorAll(".players");

  playersEl.forEach((element) => {
    element.classList.remove("players__active");
    element.classList.remove("hover");
  });

  const clickedElement = e.target.closest(".players");
  if (clickedElement) {
    clickedElement.classList.add("players__active");
  }

  playersEl.forEach((element) => {
    if (!element.classList.contains("players__active")) {
      element.classList.add("hover");
    }
  });
};

playerCount.forEach((player) => {
  player.addEventListener("click", function (e) {
    const selectedPlayerCount = parseInt(player.dataset.players);
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

const shuffleArray = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const updateGameBoard = function (rows, cols) {
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

    // Assign the random number from the array to the data-number attribute
    // gameCircle.dataset.number = numberPairs[i];
    // console.log(numberPairs);

    // Add the circle content element for revealing
    const circleContent = document.createElement("div");
    circleContent.classList.add("circle-content");
    circleContent.textContent = numberPairs[i];
    gameCircle.appendChild(circleContent);

    gameContainer.appendChild(gameCircle);
  }
};

const startGame = function (e) {
  e.preventDefault();
  setupSection.classList.add("none");
  gameBoardSection.classList.remove("none");
  let playerMoves = 0;
  startTimer();

  const circles = document.querySelectorAll(".game-circle");
  let revealedCircles = [];

  circles.forEach((circle) => {
    circle.addEventListener("click", function () {
      // If the circle has the "settled" class or is already revealed, return (prevent further clicks)
      if (
        circle.classList.contains("settled") ||
        circle.classList.contains("revealed")
      ) {
        return;
      }

      // Add the "revealed" class to the circle
      circle.classList.add("revealed");

      // Push the revealed circle to the array
      revealedCircles.push(circle);

      // If two circles are revealed, check for a match
      if (revealedCircles.length === 2) {
        const [circle1, circle2] = revealedCircles;
        playerMoves++; // Increment the player's move count
        playerMove.textContent = playerMoves;

        // Get the numbers from the revealed circles
        const number1 = circle1.querySelector(".circle-content").textContent;
        const number2 = circle2.querySelector(".circle-content").textContent;

        // If the numbers match, add the "settled" class
        if (number1 === number2) {
          setTimeout(() => {
            circle1.classList.add("settled");
            circle2.classList.add("settled");
            circle1.classList.remove("revealed");
            circle2.classList.remove("revealed");

            if (
              document.querySelectorAll(".settled").length === circles.length
            ) {
              stopTimer();
            }
          }, 1000);
        } else {
          // If the numbers don't match, hide the circles after a delay
          setTimeout(() => {
            circle1.classList.remove("revealed");
            circle2.classList.remove("revealed");
          }, 1000);
        }

        // Clear the revealed circles array
        revealedCircles = [];
      }
      // If the game is over (all pairs are settled), stop the timer

      // if (document.querySelectorAll(".settled").length === circles.length) {
      //   stopTimer();
      // }
    });
  });
};

// Timer variables
let startTime = 0;
let timerInterval = null;

// Function to start the timer
const startTimer = function () {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
};

// Function to stop the timer
const stopTimer = function () {
  clearInterval(timerInterval);
};

// Function to update the timer display
const updateTimer = function () {
  const currentTime = Date.now();
  const elapsedTime = Math.floor((currentTime - startTime) / 1000);

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  const timerElement = document.querySelector(".player__time");
  timerElement.textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
  console.log();
};
const generateRandomNumbers = function (totalPairs) {
  const numbers = [];
  for (let i = 1; i <= totalPairs; i++) {
    numbers.push(i);
  }
  // Shuffle the numbers array to randomize the order
  numbers.sort(() => Math.random() - 0.5);
  return numbers;
};
// Call the chooseGameType function or any other function that starts the game
// chooseGameType();

// Remember to

// const generateRandomNumbers = function (totalPairs) {
//   const numbers = [];
//   for (let i = 1; i <= totalPairs; i++) {
//     numbers.push(i, i);
//   }
//   // Shuffle the numbers array to randomize the order
//   numbers.sort(() => Math.random() - 0.5);
//   return numbers;
// };

selectGameTypeEL.addEventListener("click", chooseGameType);
selectMode.addEventListener("click", chooseGameTheme);
selectPlayers.addEventListener("click", choosePlayers);
beginGameEl.addEventListener("click", startGame);
updateGameBoard(4, 4);
