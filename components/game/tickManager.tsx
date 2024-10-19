"use client";

// Tick manager for main Snake game
// Manages game time and user input
// Can't be used elsewhere

import { useEffect } from "react";
import { SnakeGame } from "./Snake/SnakeGame";
import { GAME_SPEED } from "./constants";

export let snakeGame: SnakeGame;

export function canvasClick() {
  resetGames();
  snakeGame.AI = false;
  snakeGame.speed = GAME_SPEED;
}

function resetGames() {
  if (!snakeGame || snakeGame.snake.lives === 0) {
    snakeGame = new SnakeGame();
  }

  addEventListeners();
}

export default function TickManager() {
  useEffect(() => {
    resetGames();
    // Interval manages time
    const intervalId = setInterval(() => {
      snakeGame?.snakeTick();
    }, 10);

    // Listeners manage events
    addEventListeners();

    return () => {
      // Clears Intervals and Listeners when component unmounts
      clearInterval(intervalId);
      removeEventListeners();
    };
  }, []);

  // Returns an empty div to render component
  return <div></div>;
}

function addEventListeners() {
  if (snakeGame) {
    window.addEventListener("click", (e: MouseEvent) =>
      snakeGame.handleClickMovement(e)
    );
    window.addEventListener("resize", snakeGame.handleResize);
    window.addEventListener("keydown", snakeGame.handleSnakeKeyDown);
  }
}

function removeEventListeners() {
  window.removeEventListener("click", (e: MouseEvent) =>
    snakeGame.handleClickMovement(e)
  );
  window.removeEventListener("resize", snakeGame.handleResize);
  window.removeEventListener("keydown", snakeGame.handleSnakeKeyDown);
}
