const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ---------------- INPUT FIX ---------------- */
canvas.focus();

const keys = Object.create(null);

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) {
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

/* ---------------- BACKGROUND ---------------- */
let bgImg = new Image();
bgImg.src = "mountain.png";
let bgOffset = 0;

/* ---------------- GAME STATE ---------------- */
let player, platforms, cameraY = 0;
let bestHeight = 0;

/* ---------------- COYOTE JUMP ---------------- */
let coyoteTimer = 0;
const COYOTE_TIME = 0.2;

/* ---------------- RESET ---------------- */
function reset() {
  platforms = [];
  cameraY = 0;
  bestHeight = 0;

  let ground = {
    x: 0,
    y: 650,
    w: canvas.width,
    h: 40
  };

  platforms.push(ground);

  player = {
    x: 150,
    y: ground.y - 30,
    w: 30,
    h: 30,
    vx: 0,
    vy: 0,
    onGround: true
  };

  coyoteTimer = COYOTE_TIME;

  for (let i = 0; i < 18; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - 120),
      y: 600 - i * 90,
      w: 120,
      h: 15
    });
  }
}

reset();

/* ---------------- COLLISION ---------------- */
function hit(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/* ---------------- UPDATE ---------------- */
function update(dt) {

  if (player.onGround) coyoteTimer = COYOTE_TIME;
  else coyoteTimer = Math.max(0, coyoteTimer - dt);

  if (keys["KeyA"] || keys["ArrowLeft"]) player.vx -= 0.8;
  if (keys["KeyD"] || keys["ArrowRight"]) player.vx += 0.8;

  player.vx *= 0.92;

  if ((keys["Space"] || keys["KeyW"] || keys["ArrowUp"]) && coyoteTimer > 0) {
    player.vy = -15;
    player.onGround = false;
    coyoteTimer = 0;
  }

  player.vy += 0.5;

  player.vx = Math.max(-6, Math.min(6, player.vx));
  player.vy = Math.min(18, player.vy);

  player.x += player.vx;
  player.y += player.vy;

  player.onGround = false;

  for (let p of platforms) {
    if (hit(player, p) && player.vy > 0) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  cameraY += (player.y - cameraY - 200) * 0.08;

  let h = Math.floor(600 - player.y);
  if (h > bestHeight) bestHeight = h;

  if (player.y > cameraY + canvas.height + 200) {
    reset();
  }
}

/* ---------------- DRAW ---------------- */
function draw() {

  bgOffset += 0.3;
  let x = -(bgOffset % canvas.width);

  for (let i = -1; i < 3; i++) {
    ctx.drawImage(bgImg, x + i * canvas.width, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = "#b56bff";
  for (let p of platforms) {
    ctx.fillRect(p.x, p.y - cameraY, p.w, p.h);
  }

  ctx.fillStyle = "#00e5ff";
  ctx.fillRect(player.x, player.y - cameraY, player.w, player.h);

  ctx.font = "24px Arial";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";

  ctx.strokeText("Score: " + bestHeight, 20, 40);
  ctx.fillText("Score: " + bestHeight, 20, 40);
}

/* ---------------- LOOP ---------------- */
let last = 0;

function loop(t) {
  let dt = (t - last) / 1000;
  last = t;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

loop(0);
