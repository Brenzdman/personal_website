"use client";

import { GAME_SPEED } from "../constants";
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
  public grid: Grid;
  public AI: boolean = true;
  public AI_directions: number[] = [];
  public AI_dead: boolean = false;
  public apple: Apple;
  public snake: Snake;
  public tickNumber: number;
  public nextDirection: number | undefined;
  public subsequentDirection: number | undefined;
  public speed: number;

  constructor() {
    this.grid = new Grid(50, 10);
    this.apple = new Apple(this.grid);
    this.snake = new Snake(this.grid, this.apple, 0);
    this.tickNumber = 0;
    this.nextDirection = undefined;
    this.subsequentDirection = undefined;
    this.speed = GAME_SPEED;
    createHamiltonianCycle(this);
  }

  handleResize = () => {
    this.grid.drawGrid("snakeCanvas", 0.1);
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

    this.grid.drawGrid("snakeCanvas", 0.1);
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

      if (this.AI && this.snake.isDangerAhead(this.snake.direction)) {
        if (!this.AI_dead) {
          this.AI_dead = true;
          console.warn("Danger ahead, cya");
          console.warn("Direction: ", this.snake.direction);
        }
        // return;
      }

      this.snake.moveSnake();
    }
  }

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
