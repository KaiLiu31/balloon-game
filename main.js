const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const shootSound = document.getElementById("shootSound");
const restartBtn = document.getElementById("restartBtn");

const assets = {
  bg: "assets/bg.png",
  red: "assets/red.png",
  blue: "assets/blue.png",
  yellow: "assets/yellow.png",
  black: "assets/black.png",
  explosion: "assets/explosion.png"
};

const balloonTypes = {
  red: { score: 1, speed: 1 },
  blue: { score: 2, speed: 2 },
  yellow: { score: 3, speed: 3 },
  black: { score: -1, speed: 2 }
};

let bgImg, balloonImgs = {}, explosionImg;
let balloons = [], explosions = [];
let score = 0, highScore = 0;
let gameDuration = 60, remaining = gameDuration;
let startTime, gameOver = false;

function loadImages(paths, callback) {
  let loaded = 0, total = Object.keys(paths).length;
  for (const key in paths) {
    const img = new Image();
    img.src = paths[key];
    img.onload = () => {
      if (key === "bg") bgImg = img;
      else if (key === "explosion") explosionImg = img;
      else balloonImgs[key] = img;
      loaded++;
      if (loaded === total) callback();
    };
  }
}

function spawnBalloon() {
  const keys = Object.keys(balloonTypes);
  const type = keys[Math.floor(Math.random() * keys.length)];
  const { score, speed } = balloonTypes[type];
  balloons.push({
    x: Math.random() * 700 + 50,
    y: 600,
    dx: Math.random() * 2 - 1,
    dy: -speed,
    type,
    score
  });
}

function restartGame() {
  score = 0;
  balloons = [];
  explosions = [];
  remaining = gameDuration;
  startTime = Date.now();
  gameOver = false;
  restartBtn.style.display = "none";
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", (e) => {
  if (gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (let i = balloons.length - 1; i >= 0; i--) {
    const b = balloons[i];
    const img = balloonImgs[b.type];
    const r = 32;
    if (Math.hypot(x - b.x, y - b.y) < r) {
      score += b.score;
      explosions.push({ x: b.x, y: b.y, timer: 10 });
      balloons.splice(i, 1);
      shootSound.currentTime = 0;
      shootSound.play();
      break;
    }
  }
});

restartBtn.onclick = () => restartGame();

function gameLoop() {
  const now = Date.now();
  remaining = Math.max(0, gameDuration - Math.floor((now - startTime) / 1000));
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // 新氣球
  if (Math.random() < 0.03) spawnBalloon();

  // 更新氣球
  for (let i = balloons.length - 1; i >= 0; i--) {
    const b = balloons[i];
    b.x += b.dx;
    b.y += b.dy;
    if (b.y < -50) balloons.splice(i, 1);
    else ctx.drawImage(balloonImgs[b.type], b.x - 32, b.y - 32, 64, 64);
  }

  // 爆炸
  for (let i = explosions.length - 1; i >= 0; i--) {
    const e = explosions[i];
    ctx.drawImage(explosionImg, e.x - 32, e.y - 32, 64, 64);
    e.timer--;
    if (e.timer <= 0) explosions.splice(i, 1);
  }

  // 分數顯示
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText(`分數: ${score}`, 20, 30);
  ctx.fillText(`倒數: ${remaining}`, 350, 30);
  ctx.fillText(`最高分: ${highScore}`, 650, 30);

  if (remaining <= 0) {
    gameOver = true;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
    restartBtn.style.display = "block";
  }

  if (!gameOver) requestAnimationFrame(gameLoop);
}

// 初始化
highScore = parseInt(localStorage.getItem("highScore") || "0");
loadImages(assets, restartGame);
