const canvas = document.querySelector("#game-container");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Entity {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = "red";
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

const player = new Player(canvas.width / 2, canvas.height / 2, 10, "red");
player.draw();

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

const projectiles = [];

window.addEventListener("click", (event) => {
    const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    );
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    };
    const projectile = new Projectile(player.x, player.y, 5, "white", velocity);
    projectile.draw();
    projectiles.push(projectile);
})

function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.draw();

    projectiles.forEach((projectile) => projectile.update());
}animate();