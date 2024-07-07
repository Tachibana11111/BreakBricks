// Khai báo biến canvas và context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Kích thước canvas
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Biến cho paddle
const paddleHeight = 10;
const paddleWidth = 100;
let paddleX = (canvasWidth - paddleWidth) / 2;

// Biến cho ball
let ballRadius = 10;
let ballX = canvasWidth / 2;
let ballY = canvasHeight - 30;
let dx = 4;
let dy = -4;

// Biến cho bricks
const brickRowCount = 5;
const brickColumnCount = 15;
const brickWidth = 50;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Mảng lưu trữ bricks
let bricks = [];

// Điểm số và mạng số
let score = 0;
let lives = 5;

// Hàm tạo màu ngẫu nhiên cho gạch
function getRandomBrickColor() {
  const random = Math.random();
  if (random < 0.5) {
    return "#0095DD"; // Màu xanh
  } else {
    return "#FF6347"; // Màu đỏ
  }
}

// Hàm khởi tạo bricks
function initBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      let brickColor;
      if (Math.random() < 0.1) {
        brickColor = "#A9A9A9"; // Tỉ lệ xuất hiện gạch màu xám thấp hơn
      } else {
        brickColor = getRandomBrickColor();
      }
      bricks[c][r] = {
        x: 0,
        y: 0,
        hits: r % 2 === 0 ? 2 : 1,
        color: brickColor,
      };
    }
  }
}

// Hàm vẽ paddle
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvasHeight - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// Hàm vẽ ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// Hàm vẽ bricks
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
        ctx.closePath();
      }
    }
  }
}

// Hàm vẽ điểm số
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Score: " + score, 8, 20);
}

// Hàm vẽ số mạng còn lại
function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Lives: " + lives, canvasWidth - 65, 20);
}

/// Hàm kiểm tra va chạm bi với gạch
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.hits > 0) {
        // Kiểm tra va chạm với gạch màu xanh
        if (
          b.color === "#0095DD" &&
          ballX > b.x &&
          ballX < b.x + brickWidth &&
          ballY > b.y &&
          ballY < b.y + brickHeight
        ) {
          dy = -dy;
          b.hits = 0; // Vỡ ngay sau một lần va chạm
          score += 5;
          if (bricks.every((row) => row.every((brick) => brick.hits === 0))) {
            gameOver("Congratulations! You won!");
          }
          return;
        }

        // Kiểm tra va chạm với gạch màu đỏ
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
            if (bricks.every((row) => row.every((brick) => brick.hits === 0))) {
              gameOver("Congratulations! You won!");
            }
          }
          return;
        }

        // Kiểm tra va chạm với gạch màu xám
        if (
          b.color === "#A9A9A9" &&
          ballX > b.x &&
          ballX < b.x + brickWidth &&
          ballY > b.y &&
          ballY < b.y + brickHeight
        ) {
          // Xử lý phản xạ khi bóng va chạm với gạch màu xám
          if (
            ballY + ballRadius > b.y &&
            ballY - ballRadius < b.y + brickHeight
          ) {
            dy = -dy;
          }
          if (
            ballX + ballRadius > b.x &&
            ballX - ballRadius < b.x + brickWidth
          ) {
            dx = -dx;
          }
          return;
        }
      }
    }
  }
}

// Hàm xử lý game over
function gameOver(message) {
  alert(message);
  document.location.reload();
}

// Hàm vẽ trò chơi
let ballReleased = false; // Biến để xác định bóng đã được phóng hay chưa

// Hàm vẽ trò chơi
function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  collisionDetection();

  // Xử lý di chuyển paddle
  if (rightPressed && paddleX < canvasWidth - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  // Nếu bóng chưa được phóng (lives còn > 0 và !ballReleased) thì bóng sẽ nằm yên trên ván
  if (lives > 0 && !ballReleased) {
    ballX = paddleX + paddleWidth / 2;
    ballY = canvasHeight - paddleHeight - ballRadius;
  }

  // Xử lý di chuyển bóng khi đã phóng (nếu ballReleased là true)
  if (ballReleased) {
    moveBall();

    // Điều chỉnh hướng di chuyển khi bóng gần các biên của canvas
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
          gameOver("Game Over");
        } else {
          ballReleased = false; // Reset trạng thái bóng đã được phóng
          ballX = paddleX + paddleWidth / 2;
          ballY = canvasHeight - paddleHeight - ballRadius;
          dx = 4;
          dy = -4;
        }
      }
    }

    // Kiểm tra và xử lý đoạn lặp vô tận
    checkAndFixInfiniteLoop();
  }

  requestAnimationFrame(draw);
}

// Hàm kiểm tra và xử lý đoạn lặp vô tận
function checkAndFixInfiniteLoop() {
  // Điều kiện để xử lý đoạn lặp: bóng di chuyển quá nhanh hoặc vị trí bị khóa
  if (Math.abs(dx) > canvasWidth / 2 || Math.abs(dy) > canvasHeight / 2) {
    // Thay đổi hướng di chuyển để thoát khỏi đoạn lặp
    dx = -dx;
    dy = -dy;
  }
}

// Hàm di chuyển bóng
function moveBall() {
  ballX += dx;
  ballY += dy;
}

// Xử lý sự kiện phím bàn phím để di chuyển paddle
let rightPressed = false;
let leftPressed = false;
let spacePressed = false;

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  } else if (e.key === " ") {
    if (!ballReleased) {
      ballReleased = true; // Kích hoạt bóng khi phím cách được nhấn lần đầu
    }
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

// Bắt sự kiện phím bàn phím
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Khởi tạo bricks và bắt đầu vẽ trò chơi
initBricks();
draw();
