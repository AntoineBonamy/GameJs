const canvas = document.querySelector("#game-container");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

//+--------------------------------------------------------------------------+
//|                            DOM elements                                  |
//+--------------------------------------------------------------------------+

const menu = document.getElementById("menu");
const affichageScoreBox = document.getElementById("affichage-score");
const affichageScore = document.getElementById("score");
const bigScore = document.getElementById("big-score");
const startGameButton = document.getElementById("start-button");
const title = document.getElementById("title-box");
const body = document.querySelector("body");
const music = document.querySelector("audio");

//+--------------------------------------------------------------------------+
//|                        Création des classes                              |
//+--------------------------------------------------------------------------+

class Entity {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = "white";
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Player extends Entity {
  constructor(x, y, radius, color) {
    super(x, y, radius);
    this.color = color;
  }
}

class Projectile extends Player {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color);
    this.velocity = velocity;
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy extends Projectile {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
  }
}

class Particle extends Enemy {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

//+--------------------------------------------------------------------------+
//|        Création de l'élément joueur et des tableaux des éléments         |
//+--------------------------------------------------------------------------+

let player = new Player(canvas.width / 2, canvas.height / 2, 10, "white");
console.log(player);
let projectiles = [];
let enemies = [];
let particles = [];

let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;

function init() {
  player = new Player(canvas.width / 2, canvas.height / 2, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  affichageScore.innerText = score;
  bigScore.innerText = score;
  canvas.style.opacity = 1;
}

//+--------------------------------------------------------------------------+
//|                Au click, listener qui tire un projectile                 |
//+--------------------------------------------------------------------------+

window.addEventListener("click", (event) => {
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  const projectile = new Projectile(player.x, player.y, 5, "lightgreen", velocity);
  projectile.draw();
  projectiles.push(projectile);
});

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);


function keyDownHandler (e) {
  if (e.keyCode == 81) {
    leftPressed = true;
  } else if (e.keyCode == 68) {
    rightPressed = true;
  } else if (e.keyCode == 90) {
    upPressed = true;
  } else if (e.keyCode == 83) {
    downPressed = true;
  }
}

function keyUpHandler (e) {
  if (e.keyCode == 81) {
    leftPressed = false;
  } else if (e.keyCode == 68) {
    rightPressed = false;
  } else if (e.keyCode == 90) {
    upPressed = false;
  } else if (e.keyCode == 83) {
    downPressed = false;
  }
}

//+--------------------------------------------------------------------------+
//|                   Gestion de toutes les animations                       |
//+--------------------------------------------------------------------------+

let animationId;
let animationPlayer;
let score = 0;

function animatePlayer() {
    if (rightPressed && player.x < canvas.width) {
      player.x += 2;
    } else if (leftPressed && player.x > 0) {
      player.x -= 2;
    } else if (upPressed && player.y > 0) {
      player.y -= 2;
    } else if (downPressed && player.y < canvas.height) {
      player.y += 2;
    }
}

function animate() {
  animationId = requestAnimationFrame(animate);
  animationPlayer = requestAnimationFrame(animatePlayer)

  player.draw();

  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });

  projectiles.forEach((projectile, index) => {
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x + projectile.radius > canvas.width ||
      projectile.y - projectile.radius < 0 ||
      projectile.y + projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1);
    }
    projectile.update();
  });

  enemies.forEach((enemy, enemyIndex) => {
    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );
      if (distance - projectile.radius - enemy.radius <= 0) {
        for (let i = 0; i < 8; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * (3 - 1) + 1,
              enemy.color,
              {
                x: (Math.random() - 0.5) * 3,
                y: (Math.random() - 0.5) * 3,
              }
            )
          );
        }
        if (enemy.radius - 10 > 5) {
          score += 100;
          affichageScore.innerText = score;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          score += 250;
          affichageScore.innerText = score;
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            projectiles.splice(projectileIndex, 1);
          }, 1);
        }
      }
    });

    const distPlayerEnemy = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (distPlayerEnemy - enemy.radius - player.radius <= 0) {
      cancelAnimationFrame(animationId);
      bigScore.innerText = score;
      startGameButton.innerText = "Restart ?";
      menu.style.display = "initial";
      music.src = "";
      canvas.style.opacity = 0.25;
      body.style.backgroundColor = "black";
      body.style.backgroundImage = "none";
    }
    enemy.update();
  });
}

//+--------------------------------------------------------------------------+
//|                        Apparition des ennemis                            |
//+--------------------------------------------------------------------------+

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4;

    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const color = `rgb(${r}, ${g}, ${b})`;

    const randomValue = Math.random();

    let x, y;
    if (randomValue < 0.25) {
      x = 0 - radius;
      y = Math.random() * canvas.height;
    } else if (randomValue >= 0.25 && randomValue <= 0.5) {
      x = canvas.width + radius;
      y = Math.random() * canvas.height;
    } else if (randomValue >= 0.5 && randomValue <= 0.75) {
      x = Math.random() * canvas.width;
      y = 0 - radius;
    } else if (randomValue >= 0.75) {
      x = Math.random() * canvas.width;
      y = canvas.height + radius;
    }

    const angle = Math.atan2(player.y - y, player.x - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

startGameButton.addEventListener("click", () => {
  init();
  affichageScoreBox.style.display = "flex";
  menu.style.display = "none";
  title.style.display = "none";
  music.src = "./Meta Ridley.mp3";
  animate();
  spawnEnemies();
});
