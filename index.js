const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 576;
let scoreEl = document.getElementById("scoreEl");
const playerDeathAudio = document.getElementById("playerDeathAudio");
const backgroundMusic = document.getElementById("backgroundMusic");
const btnPlay = document.getElementById("reload");
const EndGame = document.querySelector(".end");
let endNo = document.getElementById("endNo");

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.rotation = 0;
    this.opacity = 1;
    const image = new Image();
    image.src = "spaceship.png";
    image.onload = () => {
      this.image = image;
      this.width = image.width * 0.15;
      this.height = image.height * 0.15;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 40,
      };
    };
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(
      player.position.x + player.width / 2,
      player.position.y + player.height / 2
    );
    ctx.rotate(this.rotation);
    ctx.translate(
      -player.position.x - player.width / 2,
      -player.position.y - player.height / 2
    );

    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    ctx.restore();
  }
  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

class Villain {
  constructor({ position }) {
    this.velocity = {
      x: 0,
      y: 0,
    };
    const image = new Image();
    image.src = "invader.png";
    image.onload = () => {
      this.image = image;
      this.width = image.width * 1;
      this.height = image.height * 1;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  shoot(invaderProjectiles) {
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 5,
        },
      })
    );
  }
}

let game = {
  over: false,
  active: true,
};
class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };
    this.velocity = {
      x: 3,
      y: 0,
    };
    this.invaders = [];

    let rows = Math.floor(Math.random() * 5 + 1);
    let cols = Math.floor(Math.random() * 7 + 2);
    this.width = cols * 30;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        this.invaders.push(
          new Villain({
            position: {
              x: i * 30,
              y: j * 30,
            },
          })
        );
      }
    }
  }
  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.y = 0;
    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30;
    }
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = 5;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Particles {
  constructor({ position, velocity, radius, color, fades }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.fades) {
      this.opacity -= 0.01;
    }
  }
}

class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.width = 3;
    this.height = 6;
  }
  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

const player = new Player();
const Projectiles = [];
const grids = [];
let invaderProjectiles = [];
let partcles = [];
function createAnimation({ object, color, fades }) {
  for (let m = 0; m < 15; m++) {
    partcles.push(
      new Particles({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * 3,
        color: color || "#9146ff",
        fades,
      })
    );
  }
}

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
};

let frames = 0;
let randomValues = Math.floor(Math.random() * 500) + 500;
let score = 0;
for (let m = 0; m < 100; m++) {
  partcles.push(
    new Particles({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },
      velocity: {
        x: 0,
        y: 0.5,
      },
      radius: Math.random() * 3,
      color: "white",
    })
  );
}

function animate() {
  if (!game.active) {
    return;
  }

  requestAnimationFrame(animate);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  partcles.forEach((particle, k) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = -particle.radius;
    }
    if (particle.opacity < 0) {
      setTimeout(() => {
        partcles.splice(k, 1);
      }, 0);
    } else {
      particle.update();
    }
  });
  invaderProjectiles.forEach((invaderP, j) => {
    if (invaderP.position.y + invaderP.height >= canvas.height) {
      setTimeout(() => {
        invaderProjectiles.splice(j, 1);
      }, 0);
    } else {
      invaderP.update();
    }

    if (
      invaderP.position.y + invaderP.height >= player.position.y &&
      invaderP.position.x + invaderP.width >= player.position.x &&
      invaderP.position.x <= player.position.x + player.width
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(j, 1);
        player.opacity = 0;
        game.over = true;
        playerDeathAudio.play();
      }, 0);
      setTimeout(() => {
        game.active = false;
        EndGame.style.display = "flex";
      }, 2000);
      createAnimation({
        object: player,
        color: "#fff",
        fades: true,
      });
    }
  });

  Projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius <= 0) {
      setTimeout(() => {
        Projectiles.splice(index, 1);
      }, 0);
    }
    projectile.update();
  });

  grids.forEach((grid, gridIndex) => {
    grid.update();
    if (frames % 40 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      );
    }
    grid.invaders.forEach((invader, index) => {
      invader.update({ velocity: grid.velocity });

      Projectiles.forEach((projectile, i) => {
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <=
            invader.position.x + invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find((invader2) => {
              return invader2 === invader;
            });
            const projectilesFind = Projectiles.find((projectile2) => {
              return projectile2 === projectile;
            });
            if (invaderFound && projectilesFind) {
              score += 10;
              scoreEl.innerHTML = score;
              endNo.innerHTML=score
              grid.invaders.splice(index, 1);
              Projectiles.splice(i, 1);
              createAnimation({
                object: invader,
                fades: true,
              });

              if (grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0];
                const lastInvader = grid.invaders[grid.invaders.length - 1];

                grid.width =
                  lastInvader.position.x -
                  firstInvader.position.x +
                  lastInvader.width;
                grid.position.x = firstInvader.position.x;
              } else {
                grids.splice(gridIndex, 1);
              }
            }
          }, 0);
        }
      });
    });
  });

  if (keys.a.pressed && player.position.x >= 0) {
    player.velocity.x = -5;
    player.rotation = -0.15;
  } else if (
    keys.d.pressed &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = 5;
    player.rotation = 0.15;
  } else {
    player.velocity.x = 0;
    player.rotation = -0.0;
  }

  if (frames % randomValues === 0) {
    grids.push(new Grid());
    frames = 0;
    randomValues = Math.floor(Math.random() * 500) + 500;
  }

  frames++;
}

animate();
backgroundMusic.play();

addEventListener("keydown", ({ key }) => {
  if (game.over) {
    return;
  }
  switch (key) {
    case "a":
      keys.a.pressed = true;
      break;
    case "d":
      keys.d.pressed = true;
      break;
    case "s":
      keys.s.pressed = true;
      break;
    case "w":
      keys.w.pressed = true;
      break;
    case " ":
      Projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -5,
          },
        })
      );
      break;
    default:
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
      keys.a.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "w":
      keys.w.pressed = false;
      break;
    case " ":
      keys.space.pressed = false;
      break;
    default:
      break;
  }
});

btnPlay.addEventListener("click", () => {
  window.location.reload();
});
