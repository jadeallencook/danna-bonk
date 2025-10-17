const canvas = document.getElementById("container");
const ctx = canvas.getContext("2d");

// Set up canvas resize functionality
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

// Initial resize
resizeCanvas();

// Listen for window resize
window.addEventListener("resize", resizeCanvas);

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 11.7, // 20 * 0.65 * 0.9
  speed: 2.925, // 5 * 0.65 * 0.9
  invincible: false,
  invincibilityTimer: 0,
  invincibilityDuration: 120, // 2 seconds at 60fps
};

const dan = {
  x: canvas.width * 0.25,
  y: canvas.height * 0.3,
  radius: 11.7, // 20 * 0.65 * 0.9
  speed: 1.17, // 2 * 0.65 * 0.9
  baseSpeed: 1.17, // 2 * 0.65 * 0.9
  directionX: 1,
  directionY: 1,
  state: "alive",
  invincible: false,
  invincibilityTimer: 0,
  invincibilityDuration: 120, // 2 seconds at 60fps
  policeTimer: 0,
  policeCooldown: 1200, // 20 seconds initially
  moneyTimer: 0,
  moneyCooldown: 900, // 15 seconds initially
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
  KeyR: false,
};

let bonkCount = 0;
let health = 100;
let money = 0;
let gameOver = false;
let gamePaused = false;

const messageSystem = {
  current: "Bonk Dan!",
  timer: 0,
  duration: 180, // 3 seconds at 60fps
};

const less = {
  x: canvas.width * 0.15,
  y: canvas.height * 0.2,
  size: 8.775, // 15 * 0.65 * 0.9
  speed: 0.8775, // 1.5 * 0.65 * 0.9
  name: "Les",
  state: "following", // "following" or "knockback"
  knockbackDirection: { x: 0, y: 0 },
};

const landon = {
  x: canvas.width * 0.85,
  y: canvas.height * 0.7,
  size: 8.775, // 15 * 0.65 * 0.9
  speed: 0.8775, // 1.5 * 0.65 * 0.9
  name: "Landon",
  state: "following", // "following" or "knockback"
  knockbackDirection: { x: 0, y: 0 },
};

const christopher = {
  x: canvas.width * 0.7,
  y: canvas.height * 0.15,
  size: 8.775, // 15 * 0.65 * 0.9
  speed: 0.8775, // 1.5 * 0.65 * 0.9
  name: "Christopher",
  babies: [
    { x: canvas.width * 0.65, y: canvas.height * 0.18, size: 5.85 }, // 10 * 0.65 * 0.9
  ],
  trail: [],
  directionX: 1,
  directionY: 1,
};

let fingers = [];
let policeCars = [];
let moneyDrops = [];

const fist = {
  active: false,
  angle: 0,
  radius: 23.4, // 40 * 0.65 * 0.9
  size: 11.7, // 20 * 0.65 * 0.9
  rotationSpeed: 0.2,
};

const drBigFinger = {
  x: 0,
  y: 0,
  radius: 14.625, // 25 * 0.65 * 0.9
  visible: false,
  spawnTimer: 0,
  spawnCooldown: 600,
  visibilityTimer: 0,
  visibilityDuration: 180,
};

const lj = {
  x: 0,
  y: 0,
  size: 8.775, // Same size as other characters
  visible: false,
  spawnTimer: 0,
  spawnCooldown: 600, // 10 seconds initially
  visibilityTimer: 0,
  visibilityDuration: 120, // 2 seconds at 60fps
  name: "LJ",
};

document.addEventListener("keydown", (e) => {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = false;
  }
});

// Mobile controls - wait for DOM to be loaded
document.addEventListener("DOMContentLoaded", function () {
  updateActionButtons(); // Set initial button state

  document.querySelectorAll("[data-key]").forEach((button) => {
    button.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const key = button.getAttribute("data-key");
      if (keys.hasOwnProperty(key)) {
        keys[key] = true;
      }
    });

    button.addEventListener("touchend", (e) => {
      e.preventDefault();
      const key = button.getAttribute("data-key");
      if (keys.hasOwnProperty(key)) {
        keys[key] = false;
      }
    });

    button.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const key = button.getAttribute("data-key");
      if (keys.hasOwnProperty(key)) {
        keys[key] = true;
      }
    });

    button.addEventListener("mouseup", (e) => {
      e.preventDefault();
      const key = button.getAttribute("data-key");
      if (keys.hasOwnProperty(key)) {
        keys[key] = false;
      }
    });

    // Also handle mouse leave to prevent stuck keys
    button.addEventListener("mouseleave", (e) => {
      const key = button.getAttribute("data-key");
      if (keys.hasOwnProperty(key)) {
        keys[key] = false;
      }
    });
  });
});

function resetGame() {
  bonkCount = 0;
  health = 100;
  money = 0;
  gameOver = false;
  gamePaused = false;

  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.invincible = false;
  player.invincibilityTimer = 0;

  dan.x = canvas.width * 0.25;
  dan.y = canvas.height * 0.3;
  dan.speed = dan.baseSpeed;
  dan.state = "alive";
  dan.invincible = false;
  dan.invincibilityTimer = 0;
  dan.directionX = 1;
  dan.directionY = 1;
  dan.policeTimer = 0;
  dan.policeCooldown = Math.random() * (1800 - 1200) + 1200; // 20-30 seconds
  dan.moneyTimer = 0;
  dan.moneyCooldown = Math.random() * (1200 - 900) + 900; // 15-20 seconds

  less.x = canvas.width * 0.15;
  less.y = canvas.height * 0.2;
  less.state = "following";
  less.knockbackDirection = { x: 0, y: 0 };

  landon.x = canvas.width * 0.85;
  landon.y = canvas.height * 0.7;
  landon.state = "following";
  landon.knockbackDirection = { x: 0, y: 0 };

  christopher.x = canvas.width * 0.7;
  christopher.y = canvas.height * 0.15;
  christopher.babies = [
    { x: canvas.width * 0.65, y: canvas.height * 0.18, size: 5.85 }, // 10 * 0.65 * 0.9
  ];
  christopher.trail = [];
  christopher.directionX = 1;
  christopher.directionY = 1;

  fingers = [];
  policeCars = [];
  moneyDrops = [];

  drBigFinger.visible = false;
  drBigFinger.spawnTimer = 0;
  drBigFinger.visibilityTimer = 0;

  lj.visible = false;
  lj.spawnTimer = 0;
  lj.visibilityTimer = 0;
  lj.spawnCooldown = Math.random() * (1200 - 600) + 600; // 10-20 seconds

  fist.active = false;
  fist.angle = 0;

  messageSystem.current = "Bonk Dan!";
  messageSystem.timer = 0;

  updateActionButtons();
}

function setMessage(text) {
  messageSystem.current = text;
  messageSystem.timer = 0;
}

function updateActionButtons() {
  const bonkBtn = document.getElementById("bonk-btn");
  const restartBtn = document.getElementById("restart-btn");

  if (gameOver) {
    bonkBtn.style.display = "none";
    restartBtn.style.display = "block";
  } else {
    bonkBtn.style.display = "block";
    restartBtn.style.display = "none";
  }
}

function takeDamage(amount, message) {
  if (!player.invincible) {
    health = Math.max(0, health - amount);
    player.invincible = true;
    player.invincibilityTimer = 0;
    setMessage(message);
  }
}

function update() {
  if (gameOver) {
    if (keys.KeyR) {
      resetGame();
      keys.KeyR = false;
    }
    return;
  }

  // Update message timer
  messageSystem.timer++;
  if (messageSystem.timer >= messageSystem.duration) {
    messageSystem.current = "Bonk Dan!";
    messageSystem.timer = 0;
  }

  // Update invincibility timer
  if (player.invincible) {
    player.invincibilityTimer++;
    if (player.invincibilityTimer >= player.invincibilityDuration) {
      player.invincible = false;
      player.invincibilityTimer = 0;
    }
  }

  // Update Dan's invincibility timer
  if (dan.invincible) {
    dan.invincibilityTimer++;
    if (dan.invincibilityTimer >= dan.invincibilityDuration) {
      dan.invincible = false;
      dan.invincibilityTimer = 0;
    }
  }

  if (keys.Space && !fist.active) {
    fist.active = true;
    fist.angle = 0;
  }

  if (fist.active) {
    fist.angle += fist.rotationSpeed;
    if (fist.angle >= Math.PI * 2) {
      fist.active = false;
      fist.angle = 0;
    }
  }

  if (health <= 0) {
    gameOver = true;
    updateActionButtons();
    return;
  }
  if (keys.ArrowUp && player.y - player.radius > 0) {
    player.y -= player.speed;
  }
  if (keys.ArrowDown && player.y + player.radius < canvas.height - 80) {
    player.y += player.speed;
  }
  if (keys.ArrowLeft && player.x - player.radius > 0) {
    player.x -= player.speed;
  }
  if (keys.ArrowRight && player.x + player.radius < canvas.width) {
    player.x += player.speed;
  }

  function followPlayer(enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const moveX = (dx / distance) * enemy.speed;
      const moveY = (dy / distance) * enemy.speed;

      enemy.x += moveX;
      enemy.y += moveY;

      enemy.x = Math.max(
        enemy.size / 2,
        Math.min(canvas.width - enemy.size / 2, enemy.x)
      );
      enemy.y = Math.max(
        enemy.size / 2,
        Math.min(canvas.height - enemy.size / 2 - 80, enemy.y)
      );
    }
  }

  // Handle Les movement (following or knockback)
  if (less.state === "following") {
    followPlayer(less);
  } else if (less.state === "knockback") {
    // Move in knockback direction
    const moveX = less.knockbackDirection.x * less.speed * 2; // Faster knockback
    const moveY = less.knockbackDirection.y * less.speed * 2;

    less.x += moveX;
    less.y += moveY;

    // Check if hit a wall
    if (less.x - less.size / 2 <= 0 || less.x + less.size / 2 >= canvas.width ||
        less.y - less.size / 2 <= 0 || less.y + less.size / 2 >= canvas.height - 80) {
      less.state = "following";
    }

    // Keep within bounds
    less.x = Math.max(less.size / 2, Math.min(canvas.width - less.size / 2, less.x));
    less.y = Math.max(less.size / 2, Math.min(canvas.height - less.size / 2 - 80, less.y));
  }

  // Handle Landon movement (following or knockback)
  if (landon.state === "following") {
    followPlayer(landon);
  } else if (landon.state === "knockback") {
    // Move in knockback direction
    const moveX = landon.knockbackDirection.x * landon.speed * 2; // Faster knockback
    const moveY = landon.knockbackDirection.y * landon.speed * 2;

    landon.x += moveX;
    landon.y += moveY;

    // Check if hit a wall
    if (landon.x - landon.size / 2 <= 0 || landon.x + landon.size / 2 >= canvas.width ||
        landon.y - landon.size / 2 <= 0 || landon.y + landon.size / 2 >= canvas.height - 80) {
      landon.state = "following";
    }

    // Keep within bounds
    landon.x = Math.max(landon.size / 2, Math.min(canvas.width - landon.size / 2, landon.x));
    landon.y = Math.max(landon.size / 2, Math.min(canvas.height - landon.size / 2 - 80, landon.y));
  }

  christopher.x += christopher.speed * christopher.directionX;
  christopher.y += christopher.speed * christopher.directionY;

  if (
    christopher.x + christopher.size / 2 >= canvas.width ||
    christopher.x - christopher.size / 2 <= 0
  ) {
    christopher.directionX *= -1;
  }
  if (
    christopher.y + christopher.size / 2 >= canvas.height - 80 ||
    christopher.y - christopher.size / 2 <= 0
  ) {
    christopher.directionY *= -1;
  }

  christopher.trail.unshift({ x: christopher.x, y: christopher.y });

  for (let i = 0; i < christopher.babies.length; i++) {
    const segmentIndex = (i + 1) * 25;
    if (segmentIndex < christopher.trail.length) {
      christopher.babies[i].x = christopher.trail[segmentIndex].x;
      christopher.babies[i].y = christopher.trail[segmentIndex].y;
    }
  }

  if (christopher.trail.length > christopher.babies.length * 25 + 50) {
    christopher.trail.pop();
  }

  for (let i = policeCars.length - 1; i >= 0; i--) {
    const police = policeCars[i];
    police.timer++;

    if (police.timer >= police.duration) {
      policeCars.splice(i, 1);
      continue;
    }

    const dx = player.x - police.x;
    const dy = player.y - police.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const moveX = (dx / distance) * police.speed;
      const moveY = (dy / distance) * police.speed;

      police.x += moveX;
      police.y += moveY;

      police.x = Math.max(
        police.size / 2,
        Math.min(canvas.width - police.size / 2, police.x)
      );
      police.y = Math.max(
        police.size / 2,
        Math.min(canvas.height - police.size / 2 - 80, police.y)
      );
    }
  }

  // Update money drops
  for (let i = moneyDrops.length - 1; i >= 0; i--) {
    const moneyDrop = moneyDrops[i];
    moneyDrop.timer++;

    if (moneyDrop.timer >= moneyDrop.duration) {
      moneyDrops.splice(i, 1);
      continue;
    }

    // Check if Danna picks up money
    const playerDistance = Math.sqrt(
      (player.x - moneyDrop.x) ** 2 + (player.y - moneyDrop.y) ** 2
    );
    if (playerDistance <= player.radius + moneyDrop.size / 2) {
      money += 5;
      setMessage("Picked up $5!");
      moneyDrops.splice(i, 1);
      continue;
    }

    // Check if enemies pick up money
    const enemies = [less, landon, christopher];
    let pickedUp = false;

    for (let enemy of enemies) {
      const enemyDistance = Math.sqrt(
        (enemy.x - moneyDrop.x) ** 2 + (enemy.y - moneyDrop.y) ** 2
      );
      if (enemyDistance <= enemy.size / 2 + moneyDrop.size / 2) {
        setMessage(`${enemy.name} stole the money!`);
        moneyDrops.splice(i, 1);
        pickedUp = true;
        break;
      }
    }

    if (pickedUp) continue;

    // Check if Christopher's babies pick up money
    for (let baby of christopher.babies) {
      const babyDistance = Math.sqrt(
        (baby.x - moneyDrop.x) ** 2 + (baby.y - moneyDrop.y) ** 2
      );
      if (babyDistance <= baby.size / 2 + moneyDrop.size / 2) {
        setMessage("Baby Christopher stole the money!");
        moneyDrops.splice(i, 1);
        break;
      }
    }
  }



  const enemies = [less, landon, christopher];
  const minDistance = 23.4; // 40 * 0.65 * 0.9

  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      const enemy1 = enemies[i];
      const enemy2 = enemies[j];

      const dx = enemy2.x - enemy1.x;
      const dy = enemy2.y - enemy1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance && distance > 0) {
        const pushX = (dx / distance) * (minDistance - distance) * 0.5;
        const pushY = (dy / distance) * (minDistance - distance) * 0.5;

        enemy1.x -= pushX;
        enemy1.y -= pushY;
        enemy2.x += pushX;
        enemy2.y += pushY;

        enemy1.x = Math.max(
          enemy1.size / 2,
          Math.min(canvas.width - enemy1.size / 2, enemy1.x)
        );
        enemy1.y = Math.max(
          enemy1.size / 2,
          Math.min(canvas.height - enemy1.size / 2 - 80, enemy1.y)
        );
        enemy2.x = Math.max(
          enemy2.size / 2,
          Math.min(canvas.width - enemy2.size / 2, enemy2.x)
        );
        enemy2.y = Math.max(
          enemy2.size / 2,
          Math.min(canvas.height - enemy2.size / 2 - 80, enemy2.y)
        );
      }
    }
  }

  function checkEnemyCollision(enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= player.radius + enemy.size / 2;
  }

  if (checkEnemyCollision(less)) {
    takeDamage(5, "Les attacked! -5 HP");
  }

  if (checkEnemyCollision(landon)) {
    takeDamage(5, "Landon attacked! -5 HP");
  }

  if (checkEnemyCollision(christopher)) {
    if (!player.invincible) {
      health = Math.max(0, health - 5);
      money = Math.max(0, money - 1);
      player.invincible = true;
      player.invincibilityTimer = 0;
      setMessage("Christopher stole $1!");
    }
  }

  for (let baby of christopher.babies) {
    const dx = player.x - baby.x;
    const dy = player.y - baby.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= player.radius + baby.size / 2) {
      if (!player.invincible) {
        health = Math.max(0, health - 5);
        money = Math.max(0, money - 1);
        player.invincible = true;
        player.invincibilityTimer = 0;
        setMessage("Baby Christopher stole $1!");
      }
      break;
    }
  }

  // LJ healing interaction
  if (lj.visible && checkEnemyCollision(lj)) {
    health = Math.min(100, health + 5);
    setMessage("LJ gave you good vibes +5hp");
    lj.visible = false;
    lj.spawnCooldown = Math.random() * (1200 - 600) + 600; // 10-20 seconds
  }


  drBigFinger.spawnTimer++;
  if (
    drBigFinger.spawnTimer >= drBigFinger.spawnCooldown &&
    !drBigFinger.visible
  ) {
    drBigFinger.visible = true;
    drBigFinger.visibilityTimer = 0;
    setMessage("Dr Big Finger appears!");
    drBigFinger.x =
      Math.random() * (canvas.width - drBigFinger.radius * 2) +
      drBigFinger.radius;
    drBigFinger.y =
      Math.random() * (canvas.height - drBigFinger.radius * 2 - 100) +
      drBigFinger.radius;
    drBigFinger.spawnTimer = 0;
    drBigFinger.spawnCooldown = Math.random() * (1200 - 600) + 600;

    // Calculate angle from Dr Big Finger to Danna
    const dx = player.x - drBigFinger.x;
    const dy = player.y - drBigFinger.y;
    const angle = Math.atan2(dy, dx);

    const finger = {
      x: drBigFinger.x,
      y: drBigFinger.y,
      vx: Math.cos(angle) * 1.755, // 3 * 0.65 * 0.9
      vy: Math.sin(angle) * 1.755, // 3 * 0.65 * 0.9
      size: 11.7, // 20 * 0.65 * 0.9
    };
    fingers.push(finger);
  }

  if (drBigFinger.visible) {
    drBigFinger.visibilityTimer++;
    if (drBigFinger.visibilityTimer >= drBigFinger.visibilityDuration) {
      drBigFinger.visible = false;
    }
  }

  // LJ spawn mechanics
  lj.spawnTimer++;
  if (lj.spawnTimer >= lj.spawnCooldown && !lj.visible) {
    lj.visible = true;
    lj.visibilityTimer = 0;
    lj.x = Math.random() * (canvas.width - lj.size * 2) + lj.size;
    lj.y = Math.random() * (canvas.height - lj.size * 2 - 80) + lj.size;
    lj.spawnTimer = 0;
    setMessage("LJ appears with good vibes!");
  }

  if (lj.visible) {
    lj.visibilityTimer++;
    if (lj.visibilityTimer >= lj.visibilityDuration) {
      lj.visible = false;
      lj.spawnCooldown = Math.random() * (1200 - 600) + 600; // 10-20 seconds
    }
  }

  for (let i = fingers.length - 1; i >= 0; i--) {
    const finger = fingers[i];
    finger.x += finger.vx;
    finger.y += finger.vy;

    const fingerCenterX = finger.x + finger.size / 2;
    const fingerCenterY = finger.y + finger.size / 2;
    const distance = Math.sqrt(
      (player.x - fingerCenterX) ** 2 + (player.y - fingerCenterY) ** 2
    );

    if (distance <= player.radius + finger.size / 2) {
      takeDamage(5, "Hit by finger! -5 HP");
      fingers.splice(i, 1);
      continue;
    }

    if (
      finger.x < -finger.size ||
      finger.x > canvas.width ||
      finger.y < -finger.size ||
      finger.y > canvas.height
    ) {
      fingers.splice(i, 1);
    }
  }

  if (dan.state === "alive") {
    dan.x += dan.speed * dan.directionX;
    dan.y += dan.speed * dan.directionY;

    if (dan.x + dan.radius >= canvas.width || dan.x - dan.radius <= 0) {
      dan.directionX *= -1;
    }
    if (dan.y + dan.radius >= canvas.height - 80 || dan.y - dan.radius <= 0) {
      dan.directionY *= -1;
    }

    // Dan randomly calls police every 20-30 seconds
    dan.policeTimer++;
    if (dan.policeTimer >= dan.policeCooldown) {
      for (let i = 0; i < 3; i++) {
        const policeCar = {
          x: Math.random() * (canvas.width - 23.4) + 11.7, // scaled down 10%
          y: Math.random() * (canvas.height - 23.4 - 80) + 11.7, // scaled down 10%
          size: 11.7, // 20 * 0.65 * 0.9
          speed: 0.8775, // 1.5 * 0.65 * 0.9
          timer: 0,
          duration: 300,
        };
        policeCars.push(policeCar);
      }
      dan.policeTimer = 0;
      dan.policeCooldown = Math.random() * (1800 - 1200) + 1200; // 20-30 seconds
      setMessage("Dan called the cops!");
    }

    // Dan drops money every 15-20 seconds
    dan.moneyTimer++;
    if (dan.moneyTimer >= dan.moneyCooldown) {
      const moneyDrop = {
        x: dan.x,
        y: dan.y,
        size: 11.7, // 20 * 0.65 * 0.9
        timer: 0,
        duration: 120, // 2 seconds at 60fps
      };
      moneyDrops.push(moneyDrop);
      dan.moneyTimer = 0;
      dan.moneyCooldown = Math.random() * (1200 - 900) + 900; // 15-20 seconds
      setMessage("Dan dropped money!");
    }

    if (fist.active) {
      const fistX = player.x + Math.cos(fist.angle) * fist.radius;
      const fistY = player.y + Math.sin(fist.angle) * fist.radius;
      const distance = Math.sqrt((fistX - dan.x) ** 2 + (fistY - dan.y) ** 2);

      if (distance <= fist.size / 2 + dan.radius && !dan.invincible) {
        bonkCount++;
        health = Math.min(100, health + 5);
        money += 5;
        dan.speed = dan.baseSpeed + bonkCount * 0.5;
        dan.invincible = true;
        dan.invincibilityTimer = 0;
        setMessage("BONK! +$5!");
        fist.active = false;
        fist.angle = 0;

        christopher.babies.push({
          x: christopher.x,
          y: christopher.y,
          size: 8.775, // 15 * 0.65 * 0.9
        });
      }

      // Check for bonking Les and Landon
      const lessDistance = Math.sqrt((fistX - less.x) ** 2 + (fistY - less.y) ** 2);
      if (lessDistance <= fist.size / 2 + less.size / 2 && less.state === "following") {
        // Calculate knockback direction from player to Les
        const dx = less.x - player.x;
        const dy = less.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          less.knockbackDirection.x = dx / distance;
          less.knockbackDirection.y = dy / distance;
          less.state = "knockback";
        }
      }

      const landonDistance = Math.sqrt((fistX - landon.x) ** 2 + (fistY - landon.y) ** 2);
      if (landonDistance <= fist.size / 2 + landon.size / 2 && landon.state === "following") {
        // Calculate knockback direction from player to Landon
        const dx = landon.x - player.x;
        const dy = landon.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          landon.knockbackDirection.x = dx / distance;
          landon.knockbackDirection.y = dy / distance;
          landon.state = "knockback";
        }
      }
    }
  }
}

function render() {
  ctx.fillStyle = "#2F4F4F";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#FFD700";
  for (let i = 0; i < canvas.height; i += 100) {
    ctx.fillRect(395, i, 10, 40);
  }

  ctx.fillStyle = "#FFFFFF";
  for (let i = 0; i < canvas.height; i += 80) {
    ctx.fillRect(200, i, 3, 30);
    ctx.fillRect(600, i, 3, 30);
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(
      "Final Score: " + bonkCount + " bonks",
      canvas.width / 2,
      canvas.height / 2
    );
    ctx.fillText("Press Restart", canvas.width / 2, canvas.height / 2 + 50);
    return;
  }

  // Render player with flashing effect when invincible
  ctx.font = "30px Arial";
  ctx.textAlign = "center";

  if (player.invincible) {
    // Flash every 10 frames (roughly 6 times per second)
    const flashInterval = 10;
    const isVisible = Math.floor(player.invincibilityTimer / flashInterval) % 2 === 0;
    if (isVisible) {
      ctx.fillText("👩🏻‍🦰", player.x, player.y + 10);
    }
  } else {
    ctx.fillText("👩🏻‍🦰", player.x, player.y + 10);
  }

  // Render Dan with flashing effect when invincible
  ctx.font = "30px Arial";
  ctx.textAlign = "center";

  if (dan.invincible) {
    // Flash every 10 frames (roughly 6 times per second)
    const flashInterval = 10;
    const isVisible = Math.floor(dan.invincibilityTimer / flashInterval) % 2 === 0;
    if (isVisible) {
      ctx.fillText("👨🏻‍🦰", dan.x, dan.y + 10);
    }
  } else {
    ctx.fillText("👨🏻‍🦰", dan.x, dan.y + 10);
  }

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";

  // Flash player name when invincible
  if (player.invincible) {
    const flashInterval = 10;
    const isVisible = Math.floor(player.invincibilityTimer / flashInterval) % 2 === 0;
    if (isVisible) {
      ctx.fillText("Danna", player.x, player.y - player.radius - 15);
    }
  } else {
    ctx.fillText("Danna", player.x, player.y - player.radius - 15);
  }

  // Flash Dan's name when invincible
  if (dan.invincible) {
    const flashInterval = 10;
    const isVisible = Math.floor(dan.invincibilityTimer / flashInterval) % 2 === 0;
    if (isVisible) {
      ctx.fillText("Dan", dan.x, dan.y - dan.radius - 5);
    }
  } else {
    ctx.fillText("Dan", dan.x, dan.y - dan.radius - 5);
  }

  // Stats background
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText("Bonks: " + bonkCount, 10, canvas.height - 60);
  ctx.fillText("Money: $" + money, 10, canvas.height - 40);

  ctx.fillStyle = "red";
  ctx.fillRect(10, canvas.height - 30, 200, 20);

  ctx.fillStyle = "green";
  const healthWidth = (health / 100) * 200;
  ctx.fillRect(10, canvas.height - 30, healthWidth, 20);

  ctx.fillStyle = "white";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(health + "/100", 110, canvas.height - 15);

  // Message display on right side
  ctx.font = "16px Arial";
  ctx.textAlign = "right";
  ctx.fillText(messageSystem.current, canvas.width - 10, canvas.height - 50);

  ctx.font = "25px Arial";
  ctx.textAlign = "center";
  ctx.fillText("👦🏽", less.x, less.y + 8);
  ctx.fillText("👦🏽", landon.x, landon.y + 8);
  ctx.fillText("👨🏾‍🦱", christopher.x, christopher.y + 8);

  for (let baby of christopher.babies) {
    ctx.fillText("👶🏽", baby.x, baby.y + 8);
  }

  if (lj.visible) {
    ctx.fillText("🕺🏽", lj.x, lj.y + 8);
  }

  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Les", less.x, less.y - less.size / 2 - 5);
  ctx.fillText("Landon", landon.x, landon.y - landon.size / 2 - 5);
  ctx.fillText(
    "Christopher",
    christopher.x,
    christopher.y - christopher.size / 2 - 5
  );

  if (lj.visible) {
    ctx.fillText("LJ", lj.x, lj.y - lj.size / 2 - 15);
  }


  if (drBigFinger.visible) {
    ctx.font = "35px Arial";
    ctx.textAlign = "center";
    ctx.fillText("👨🏻‍⚕️", drBigFinger.x, drBigFinger.y + 12);

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Dr Big Finger",
      drBigFinger.x,
      drBigFinger.y - drBigFinger.radius - 5
    );
  }

  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  for (let finger of fingers) {
    ctx.fillText(
      "👉",
      finger.x + finger.size / 2,
      finger.y + finger.size / 2 + 7
    );
  }

  ctx.font = "25px Arial";
  ctx.textAlign = "center";
  for (let police of policeCars) {
    ctx.fillText("🚔", police.x, police.y + 8);
  }

  if (fist.active) {
    const fistX = player.x + Math.cos(fist.angle) * fist.radius;
    const fistY = player.y + Math.sin(fist.angle) * fist.radius;
    ctx.font = "25px Arial";
    ctx.textAlign = "center";
    ctx.fillText("✊🏻", fistX, fistY + 8);
  }
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();
