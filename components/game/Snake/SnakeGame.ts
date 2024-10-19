"use client";

import { AI_SPEED, GAME_SPEED } from "../constants";
import { Grid, gradientGrid } from "../Grid";
import { Apple } from "./Apple";
import {
  drawHamiltonianCycle,
  createHamiltonianCycle,
  getHamiltonianDirection,
} from "./hamiltonianCycle";
import { Snake } from "./Snake";

export class SnakeGame {
  // Snake Variables
  public grid!: Grid;
  public AI: boolean = true;
  public AI_directions: number[] = [];
  public AI_dead: boolean = false;
  public apple!: Apple;
  public snake!: Snake;
  public tickNumber!: number;
  public nextDirection: number | undefined;
  public subsequentDirection: number | undefined;
  public speed!: number;

  constructor() {
    this.initializeGame();
  }

  private initializeGame() {
    this.grid = new Grid(50, 10);
    this.apple = new Apple(this.grid);
    this.snake = new Snake(this.grid, this.apple, 0);
    this.tickNumber = 0;
    this.nextDirection = undefined;
    this.subsequentDirection = undefined;
    this.AI = true;
    this.speed = this.AI ? AI_SPEED : GAME_SPEED;
    this.AI_directions = [];
    this.AI_dead = false;

    createHamiltonianCycle(this);
  }

  resetGame() {
    this.initializeGame();
  }

  handleResize = () => {
    this.grid.drawGrid("snakeCanvas", 0.1, this.snake);
  };

  snakeTick() {
    this.tickNumber += 1;
    // Game over condition
    if (this.grid.active) {
      if (!this.snake.active) {
        this.grid.death();
        this.snake.apple!.active = false;
        this.grid.active = false;
        gradientGrid(this.grid);
        return;
      }

      this.apple.drawApple();
      // Manages snake movement
      this.managePlayerSnake();
    }

    this.grid.drawGrid("snakeCanvas", 0.1, this.snake);
    // drawHamiltonianCycle(this);
  }

  managePlayerSnake() {
    if (this.AI && this.AI_directions.length === 0 && !this.AI_dead) {
      // this.AI_directions = makeNewPath(this);
    }

    if (this.tickNumber % this.speed == 0) {
      if (this.AI) {
        this.snake.direction = getHamiltonianDirection(this);
        // const direction = this.AI_directions.shift();

        // if (direction !== undefined) {
        //   this.snake.direction = direction;
        // }
      } else {
        if (this.nextDirection !== undefined) {
          this.snake.direction = this.nextDirection;
          this.nextDirection = this.subsequentDirection;
          this.subsequentDirection = undefined;
        }
      }

      if (this.snake.isDangerAhead(this.snake.direction)) {
        if (!this.AI_dead) {
          this.AI_dead = true;
          console.warn("Looks like this is the end for me, cya");
        }
        setTimeout(() => {
          this.resetGame();
        }, 5000);
      }

      this.snake.moveSnake();
    }
  }

  handleClickMovement = (e: MouseEvent) => {
    console.log("click");
    if (this.AI) return;

    const clickX = e.clientX;
    const clickY = e.clientY;

    console.log(clickX, clickY);

    let newDirection1: number | undefined;
    let newDirection2: number | undefined;

    // if click in top 3rd of screen
    if (clickY < window.innerHeight / 3) {
      newDirection1 = Math.PI / 2;
      // if click in right 3rd of screen
      if (clickX > (2 * window.innerWidth) / 3) {
        newDirection2 = 0;
      } else if (clickX < window.innerWidth / 3) {
        newDirection2 = Math.PI;
      }
    }

    // if click in bottom 3rd of screen
    else if (clickY > (2 * window.innerHeight) / 3) {
      newDirection1 = (3 * Math.PI) / 2;
      // if click in right 3rd of screen
      if (clickX > (2 * window.innerWidth) / 3) {
        newDirection2 = 0;
      } else if (clickX < window.innerWidth / 3) {
        newDirection2 = Math.PI;
      }
    }

    // if click in left 3rd of screen
    else if (clickX < window.innerWidth / 3) {
      newDirection1 = Math.PI;
      // if click in top 3rd of screen
      if (clickY < window.innerHeight / 3) {
        newDirection2 = Math.PI / 2;
      } else if (clickY > (2 * window.innerHeight) / 3) {
        newDirection2 = (3 * Math.PI) / 2;
      }
    }

    // if click in right 3rd of screen
    else if (clickX > (2 * window.innerWidth) / 3) {
      newDirection1 = 0;
      // if click in top 3rd of screen
      if (clickY < window.innerHeight / 3) {
        newDirection2 = Math.PI / 2;
      } else if (clickY > (2 * window.innerHeight) / 3) {
        newDirection2 = (3 * Math.PI) / 2;
      }
    }

    if (newDirection1 !== undefined) {
      // if + pi or - pi, ignore
      if (
        newDirection1 !== this.snake.naturalDirection + Math.PI &&
        newDirection1 !== this.snake.naturalDirection - Math.PI
      ) {
        this.nextDirection = newDirection1;
      } else {
        if (newDirection2 !== undefined) {
          this.nextDirection = newDirection1;
        }
      }
    }

    if (newDirection2 !== undefined) {
      if (
        this.nextDirection !== newDirection2 + Math.PI &&
        this.nextDirection !== newDirection2 - Math.PI
      ) {
        this.subsequentDirection = newDirection2;
      }
    }
  };

  handleSnakeKeyDown = (e: KeyboardEvent) => {
    if (this.AI) return;

    let newDirection: number | undefined;

    switch (e.key) {
      case "ArrowUp":
      case "Numpad8":
        e.preventDefault();
        newDirection = Math.PI / 2;
        break;
      case "ArrowDown":
      case "Clear":
      case "Numpad2":
        e.preventDefault();
        newDirection = (3 * Math.PI) / 2;
        break;
      case "ArrowLeft":
      case "Numpad4":
        e.preventDefault();
        newDirection = Math.PI;
        break;
      case "ArrowRight":
      case "Numpad6":
        e.preventDefault();
        newDirection = 0;
        break;
    }

    if (newDirection == undefined) {
      return;
    }

    if (
      this.nextDirection === undefined &&
      newDirection !== this.snake.naturalDirection + Math.PI &&
      newDirection !== this.snake.naturalDirection - Math.PI
    ) {
      this.nextDirection = newDirection;
    } else if (this.subsequentDirection === undefined) {
      if (
        this.nextDirection !== newDirection + Math.PI &&
        this.nextDirection !== newDirection - Math.PI
      )
        this.subsequentDirection = newDirection;
    } else {
      this.nextDirection = this.subsequentDirection;
      this.subsequentDirection = newDirection;
    }
  };
}
