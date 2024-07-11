document.addEventListener("DOMContentLoaded", () => {
  const playerNameInput = document.getElementById("playerName");
  const startButton = document.getElementById("startButton");
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  let currentLanguage = "en";
  let canvasWidth;
  let canvasHeight = 600;

  const nameAlertMessage = {
    vi: "Vui lòng nhập tên người chơi.",
    en: "Please enter your name.",
    ja: "お名前を入力してください。",
    cn: "请输入你的名字",
  };

  const validAlertMessage = {
    vi: "Vui lòng nhập số hàng và số cột hợp lệ.",
    en: "Please enter valid numbers for rows and columns.",
    ja: "行と列に有効な数字を入力してください。",
    cn: "请输入有效的行和列数字。",
  };

  // Paddle variables
  const paddleHeight = 10;
  const paddleWidth = 100;
  let paddleX;

  // Ball variables
  let ballRadius = 10;
  let ballX;
  let ballY;
  let dx = 4;
  let dy = -4;
  let ballOnPaddle = false; // New variable to track ball state

  // Brick variables
  let brickRowCount;
  let brickColumnCount;
  const brickWidth = 50;
  const brickHeight = 20;
  const brickPadding = 0;
  const brickOffsetTop = 30;
  const brickOffsetLeft = 30;

  let bricks = [];
  let score = 0;
  let lives = 5;

  // Function to initialize bricks
  function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        let brickColor;
        do {
          brickColor = Math.random() < 0.05 ? "#A9A9A9" : getRandomBrickColor();
        } while (brickColor === "#A9A9A9" && isAdjacentGray(c, r));
        bricks[c][r] = {
          x: 0,
          y: 0,
          hits: r % 2 === 0 ? 2 : 1,
          color: brickColor,
        };
      }
    }
  }

  function isAdjacentGray(c, r) {
    if (c > 0 && bricks[c - 1][r] && bricks[c - 1][r].color === "#A9A9A9") {
      return true;
    }
    if (r > 0 && bricks[c][r - 1] && bricks[c][r - 1].color === "#A9A9A9") {
      return true;
    }
    return false;
  }

  // Function to get a random brick color
  function getRandomBrickColor() {
    const random = Math.random();
    return random < 0.5 ? "#0095DD" : "#FF6347";
  }

  // Function to draw paddle
  function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvasHeight - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();
  }

  // Function to draw ball
  function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
  }

  // Function to draw bricks
  function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].hits > 0) {
          let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
          let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = bricks[c][r].color;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#000";
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
  }

  // Function to draw score
  function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#FF6347";
    ctx.fillText(strings.score + ": " + score, 8, canvasHeight - 40);
  }

  // Function to draw lives
  function drawLives() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#FF6347";
    ctx.fillText(
      strings.lives + ": " + lives,
      canvasWidth - 75,
      canvasHeight - 40
    );
  }

  // Function for collision detection
  function collisionDetection() {
    let blueBricksRemaining = 0;
    let redBricksRemaining = 0;

    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        let b = bricks[c][r];
        if (b.hits > 0) {
          if (
            b.color === "#0095DD" &&
            ballX > b.x &&
            ballX < b.x + brickWidth &&
            ballY > b.y &&
            ballY < b.y + brickHeight
          ) {
            dy = -dy;
            b.hits = 0;
            score += 5;
            blueBricksRemaining--;
          }
          if (
            b.color === "#FF6347" &&
            ballX > b.x &&
            ballX < b.x + brickWidth &&
            ballY > b.y &&
            ballY < b.y + brickHeight
          ) {
            dy = -dy;
            b.hits--;
            score += 5;
            if (b.hits === 0) {
            }
          }
          if (b.color === "#0095DD" && b.hits > 0) {
            blueBricksRemaining++;
          } else if (b.color === "#FF6347" && b.hits > 0) {
            redBricksRemaining++;
          }
          if (
            b.color === "#A9A9A9" &&
            ballX > b.x &&
            ballX < b.x + brickWidth &&
            ballY > b.y &&
            ballY < b.y + brickHeight
          ) {
            // Check if ball is stuck in a corner with gray bricks
            let cornerStuck = false;

            // Check if stuck in horizontal gap
            if (
              ballY + ballRadius > b.y &&
              ballY - ballRadius < b.y + brickHeight
            ) {
              dy = -dy; // Reverse vertical direction
              cornerStuck = true;
            }

            // Check if stuck in vertical gap
            if (
              ballX + ballRadius > b.x &&
              ballX - ballRadius < b.x + brickWidth
            ) {
              dx = -dx; // Reverse horizontal direction
              cornerStuck = true;
            }

            // If stuck in both directions, adjust the ball's position
            if (cornerStuck) {
              ballX += dx;
              ballY += dy;
            }

            return;
          }
        }
      }
    }
    if (blueBricksRemaining === 0 && redBricksRemaining === 0) {
      displayGameOverOverlay();
    }
  }

  function gameOver() {
    displayGameOverOverlay();
  }
  // Function to draw everything
  function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if (!ballOnPaddle) {
      if (ballX + dx > canvasWidth - ballRadius || ballX + dx < ballRadius) {
        dx = -dx;
      }
      if (ballY + dy < ballRadius) {
        dy = -dy;
      } else if (ballY + dy > canvasHeight - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
          dy = -dy;
        } else {
          lives--;
          if (!lives) {
            gameOver("Game Over!");
          } else {
            ballOnPaddle = true;
            ballX = paddleX + paddleWidth / 2;
            ballY = canvasHeight - paddleHeight - ballRadius;
            dx = 4;
            dy = -4;
          }
        }
      }
      ballX += dx;
      ballY += dy;
    }

    requestAnimationFrame(draw);
  }

  // Event listener for mouse movement to control the paddle
  canvas.addEventListener("mousemove", function (event) {
    let relativeX = event.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvasWidth) {
      paddleX = relativeX - paddleWidth / 2;
      if (ballOnPaddle) {
        ballX = paddleX + paddleWidth / 2;
      }
    }
  });

  // Event listener for mouse click to release the ball
  canvas.addEventListener("click", function () {
    if (ballOnPaddle) {
      ballOnPaddle = false;
    }
  });

  //Function to display the game over overlay
  function displayGameOverOverlay() {
    const gameOverTitle = document.getElementById("gameOverTitle");
    const scoreDisplay = document.getElementById("scoreDisplay");
    scoreDisplay.textContent = score;

    gameOverTitle.textContent = lives > 0 ? "You Win!" : "Game Over!";

    const gameOverOverlay = document.getElementById("gameOverOverlay");
    gameOverOverlay.style.display = "flex"; // Assuming you want to display it as flex

    // Add event listener for play again button
    const playAgainButton = document.getElementById("playAgainButton");
    playAgainButton.addEventListener("click", () => {
      gameOverOverlay.style.display = "none"; // Hide the game over overlay
      const startOverlay = document.getElementById("startOverlay");
      startOverlay.style.display = "flex"; // Show the start overlay
    });
  }

  function displayGameOverOverlay() {
    const playerName = playerNameInput.value.trim();

    playerNameDisplay.innerText = strings.playerNameDisplay + " " + playerName;
    finalScore.innerText = strings.finalScore + " " + score;
    document.getElementById("gameOverOverlay").style.display = "block";
    canvas.style.display = "none";
  }

  function resetGame() {
    score = 0;
    lives = 5;
    document.getElementById("gameOverOverlay").style.display = "none";
    ballOnPaddle = true;
    ballRadius = 10;
    dx = 4;
    dy = -4;
    initBricks();
    draw();
  }

  document
    .getElementById("playAgainButton")
    .addEventListener("click", function () {
      resetGame();
      document.getElementById("startOverlay").style.display = "flex";
      document.getElementById("startOverlay").style.flexDirection = "column"; // Show the start overlay
    });

  // Start game function
  startButton.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();

    if (playerName === "") {
      document.getElementById("nameAlert").style.display = "block";
      document.getElementById("nameAlertMessage").textContent =
        nameAlertMessage[currentLanguage];
      return;
    } else {
      document.getElementById("nameAlert").style.display = "none";
    }

    // Get brick row and column count
    brickRowCount = parseInt(document.getElementById("rows").value, 10);
    brickColumnCount = parseInt(document.getElementById("cols").value, 10);

    if (
      isNaN(brickRowCount) ||
      isNaN(brickColumnCount) ||
      brickRowCount <= 2 ||
      brickColumnCount <= 4 ||
      brickRowCount >= 26 ||
      brickColumnCount >= 26
    ) {
      document.getElementById("validAlert").style.display = "block";
      document.getElementById("validAlertMessage").textContent =
        validAlertMessage[currentLanguage];
      return;
    } else {
      document.getElementById("validAlert").style.display = "none";
    }

    canvasWidth =
      brickColumnCount * (brickWidth + brickPadding) + brickOffsetLeft * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    paddleX = (canvasWidth - paddleWidth) / 2;
    ballX = paddleX + paddleWidth / 2;
    ballY = canvasHeight - paddleHeight - ballRadius;

    initBricks();
    draw();
    document.getElementById("startOverlay").style.display = "none";
    canvas.style.display = "block";
  });

  const toggleLanguageButton = document.getElementById("toggleLanguageButton");

  toggleLanguageButton.addEventListener("click", () => {
    // Toggle language logic
    const currentLanguage = document.documentElement.lang;

    switch (currentLanguage) {
      case "en":
        switchToJapanese();
        break;
      case "ja":
        switchToVietnamese();
        break;
      case "vi":
        switchToChinese();
        break;
      case "cn":
        switchToEnglish();
        break;
      default:
        switchToEnglish(); // Default to English if language is undefined
        break;
    }
  });

  const enStrings = {
    gameTitle: "BreakBricks Game",
    rows: "Insert amount of rows :",
    cols: "Insert amount of cols :",
    gameOverTitle: "Game Over !",
    finalScore: "Final Score : ",
    playerNameDisplay: "Player : ",
    score: "Score",
    lives: "Lives",
  };

  const viStrings = {
    gameTitle: "Game Phá Gạch",
    rows: "Nhập số hàng của gạch :",
    cols: "Nhập số cột của gạch :",
    gameOverTitle: "Kết thúc !",
    finalScore: "Điểm : ",
    playerNameDisplay: "Người chơi : ",
    score: "Điểm",
    lives: "Mạng",
  };

  const jaStrings = {
    gameTitle: "ブレイクブリック・ゲーム",
    rows: "行数を挿入する：",
    cols: "列数を挿入する：",
    gameOverTitle: "終了！",
    finalScore: "スコア: ",
    playerNameDisplay: "プレーヤー: ",
    score: "スコア",
    lives: "生活",
  };

  const cnStrings = {
    gameTitle: "打砖块游戏",
    rows: "插入行数：",
    cols: "插入列数：",
    gameOverTitle: "游戏结束!",
    finalScore: "分数 : ",
    playerNameDisplay: "玩家: ",
    score: "分数",
    lives: "生活",
  };
  let strings = enStrings;

  function switchLanguage(language) {
    currentLanguage = language;
    switch (language) {
      case "vi":
        strings = viStrings;
        break;
      case "ja":
        strings = jaStrings;
        break;
      case "cn":
        strings = cnStrings;
        break;
      default:
        strings = enStrings;
    }
    drawScore();
    drawLives();

    document.documentElement.lang = language;
    document.getElementById("startOverlay").querySelector("h2").innerText =
      strings.gameTitle;
    document.getElementById("rows").previousElementSibling.innerText =
      strings.rows;
    document.getElementById("cols").previousElementSibling.innerText =
      strings.cols;
    document.getElementById("gameOverTitle").innerText = strings.gameOverTitle;
    document.getElementById("finalScore").innerText = strings.finalScore;
    document.getElementById("playerNameDisplay").innerText =
      strings.playerNameDisplay;
    document.getElementById("score").innerText = strings.score;
    document.getElementById("lives").innerText = strings.lives;
  }

  function switchToEnglish() {
    document.documentElement.lang = "en";
    document.title = "BreakBricks Game";
    document.getElementById("startButton").innerText = "Start !";
    document.getElementById("toggleLanguageButton").innerText =
      "Change language";
    document.getElementById("playAgainButton").innerText = "Restart";
    document.getElementById("returnButton").innerText = "Return GameHub";
    switchLanguage("en");
  }

  function switchToJapanese() {
    document.documentElement.lang = "ja";
    document.title = "ブレイクブリック・ゲーム";
    document.getElementById("startButton").innerText = "ゲームを始める";
    document.getElementById("toggleLanguageButton").innerText =
      "言語を切り替える";
    document.getElementById("playAgainButton").innerText = "リスタート";
    document.getElementById("returnButton").innerText = "ゲームハブ戻る";
    switchLanguage("ja");
  }

  function switchToVietnamese() {
    document.documentElement.lang = "vi";
    document.title = "Game Phá Gạch";
    document.getElementById("startButton").innerText = "Bắt đầu !";
    document.getElementById("toggleLanguageButton").innerText = "Đổi ngôn ngữ";
    document.getElementById("playAgainButton").innerText = "Chơi lại";
    document.getElementById("returnButton").innerText = "Quay về GameHub";
    switchLanguage("vi");
  }

  function switchToChinese() {
    document.title = "打砖块游戏";
    document.documentElement.lang = "cn";
    document.getElementById("startButton").innerText = "开始!";
    document.getElementById("toggleLanguageButton").innerText = "改变语言";
    document.getElementById("playAgainButton").innerText = "重新开始";
    document.getElementById("returnButton").innerText = "返回游戏汇";
    switchLanguage("cn");
  }
});
