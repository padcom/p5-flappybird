class Bird {
  alive = true
  x = 20
  y = 30
  radius = 10
  velocity = 0
  acceleration = 0.2

  flap() {
    if (this.alive && this.velocity >= 0) {
      this.velocity = -3
    }
  }

  die() {
    this.alive = false
  }

  update() {
    if (this.alive) {
      this.velocity += this.acceleration
      this.y += this.velocity
    }
  }

  draw() {
    if (this.alive) {
      fill(255)
      ellipseMode(RADIUS)
      ellipse(this.x, this.y, this.radius, this.radius)
    }
  }
}

class Gate {
  width = 20
  height = random(50, 150)
  x: number
  y: number

  constructor() {
    this.x = width + this.width
    this.y = random(5, height - this.height - 5)
  }

  get topRect() {
    return { x1: this.x, y1: 0, x2: this.x + this.width, y2: this.y }
  }

  get bottomRect() {
    return { x1: this.x, y1: this.y + this.height, x2: this.x + this.width, y2: height }
  }

  update() {
    this.x -= 1
  }

  draw() {
    stroke(255)
    fill(255)
    rectMode(CORNERS)
    rect(this.topRect.x1, this.topRect.y1, this.topRect.x2, this.topRect.y2)
    rect(this.bottomRect.x1, this.bottomRect.y1, this.bottomRect.x2, this.bottomRect.y2)
  }
}

class Game {
  gates: Gate[] = []

  constructor(public readonly bird: Bird = new Bird()) {
    this.init()
  }

  get nearest() {
    return this.gates[0]
  }

  init() {
    this.gates = [new Gate()]
  }

  private shouldCreateNewGate(max = 200) {
    return this.gates[this.gates.length - 1].x < width - this.gates[this.gates.length - 1].width - max
  }

  private addNewGate() {
    this.gates.push(new Gate())
  }

  private shouldRemoveOldGate() {
    return this.gates[0].x < -this.gates[0].width
  }

  private removeOldestGate() {
    this.gates.shift()
  }

  run() {
    this.gates.forEach(gate => {
      gate.update()
      gate.draw()
    })

    // create new gate if the previous is already 50px into the arena
    if (this.shouldCreateNewGate()) this.addNewGate()
    // remove the first gate if its completely removed from view
    if (this.shouldRemoveOldGate()) this.removeOldestGate()
  }
}

class CollisionDetector {
  checkBirdCollidesWithGate(bird: Bird, gate: Gate) {
    if (detector.intersects(bird, gate.topRect)) bird.die()
    if (detector.intersects(bird, gate.bottomRect)) bird.die()
  }

  checkOffScreen(bird: Bird) {
    if (bird.y < bird.radius) bird.die()
    if (bird.y > height - bird.radius) bird.die()
  }

  private intersects(
    circle: { x: number, y: number, radius: number },
    rect: { x1: number, y1: number, x2: number, y2: number },
  ) {
    // Find the closest point to the circle within the rectangle
    const closestX = constrain(circle.x, rect.x1, rect.x2)
    const closestY = constrain(circle.y, rect.y1, rect.y2)

    // Calculate the distance between the circle's center and this closest point
    const distanceX = circle.x - closestX
    const distanceY = circle.y - closestY

    // If the distance is less than the circle's radius, an intersection occurs
    const distanceSquared = distanceX * distanceX + distanceY * distanceY
    const radiusSquared = circle.radius * circle.radius

    return distanceSquared < radiusSquared
  }
}

let bird: Bird
let game: Game
let detector: CollisionDetector

export function setup() {
  createCanvas(400, 400)
  bird = new Bird()
  game = new Game()
  detector = new CollisionDetector()
}

export function draw() {
  background(0)

  game.run()

  bird.update()
  bird.draw()
  detector.checkOffScreen(bird)
  game.gates.forEach(gate => detector.checkBirdCollidesWithGate(bird, gate))

  // restart if bird dies
  if (!bird.alive) {
    bird = new Bird()
    game.init()
  }
}

export function keyPressed() {
  bird.flap()
}
