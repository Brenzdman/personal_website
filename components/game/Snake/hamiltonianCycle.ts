import { SnakeGame } from "./SnakeGame";

class Node {
  public nextDirection: "up" | "down" | "left" | "right";

  constructor(
    public x: number = 0,
    public y: number = 0,
    nextDirection: any,
    public id: number,
    public nextId: number = -1,
    public blocked: boolean = false,
    public timer: number = 0
  ) {
    this.x = x;
    this.y = y;
    this.nextDirection = nextDirection;
    this.id = id;
  }
}

let nodeArray: Node[] = [];

export function createHamiltonianCycle(info: SnakeGame) {
  const grid = info.grid;
  const width = grid.gridTilesX;
  const height = grid.gridTilesY;

  // Makes a trivial Hamiltonian cycle

  const start = [0, 0];
  let numIterations = 0;
  const maxIterations = width * height;

  let x = start[0];
  let y = start[1];

  while (numIterations < maxIterations) {
    let mainDirection;

    // Top Row
    if (x != 0 && y == 0) {
      mainDirection = "left";
    } else {
      // Determines the direction of the snake
      if ((x % 2 === 0 && y == height - 1) || (x % 2 === 1 && y == 1)) {
        mainDirection = "right";
      } else {
        if (x % 2 === 0) {
          mainDirection = "down";
        } else {
          mainDirection = "up";
        }
      }
    }

    // Upper Right Corner
    if (x == width - 1 && y == 1) {
      mainDirection = "up";
    }

    const node = new Node(x, y, mainDirection, nodeArray.length);

    // Sets prev nodeId to info node
    if (nodeArray.length > 0) {
      nodeArray[nodeArray.length - 1].nextId = node.id;
    }

    nodeArray.push(node);

    // Sets final node to point to the first node
    if (nodeArray.length === width * height) {
      nodeArray[nodeArray.length - 1].nextId = 0;
      break;
    }

    const [nextX, nextY] = nextDirection(mainDirection);
    x += nextX;
    y += nextY;

    numIterations++;
  }
}

export function drawHamiltonianCycle(info: SnakeGame) {
  nodeArray.forEach((tile) => {
    const nextTile = nodeArray[tile.nextId];

    if (nextTile) {
      info.grid.drawLineBetweenTiles(
        info.grid.gridTiles[tile.x][tile.y],
        info.grid.gridTiles[nextTile.x][nextTile.y]
      );
    }
  });
}

// Gets next direction based on current node
export function getHamiltonianDirection(info: SnakeGame) {
  const canShortcut = shortcutPath(info);
  if (canShortcut !== undefined) {
    return canShortcut;
  }

  const snake = info.snake;
  const head = snake.head;

  const currentNode = nodeArray.find(
    (node) => node.x === head.x && node.y === head.y
  );

  if (!currentNode) {
    throw new Error("Node not found");
  }

  let direction = currentNode.nextDirection;
  return convertDirectionToRadians(direction);
}

function updateBlockedTiles(info: SnakeGame) {
  const snake = info.snake;
  const activeTiles = snake.activeTiles;

  // sets all tiles to unblocked
  nodeArray.forEach((node) => {
    node.blocked = false;
    node.timer = 0;
  });

  for (let i = 0; i < activeTiles.length; i++) {
    const tile = activeTiles[i];
    const nodeTile = nodeArray.find(
      (node) => node.x === tile.x && node.y === tile.y
    );

    if (!nodeTile) {
      throw new Error("Node not found");
    }

    nodeTile.blocked = true;

    // Number of "moves" until the path is unblocked
    nodeTile.timer = activeTiles.length - i;
  }
}

// checks if the snake can skip ahead in the cycle
function shortcutPath(info: SnakeGame): number | undefined {
  // closest direction to the apple heuristically in radians
  const bestDirection = getBestDirection(info);
  console.log("Best direction: ", bestDirection);
  const checkDirection = convertRadiansToDirection(bestDirection);
  console.log("Go: ", checkDirection);

  if (checkPath(info, checkDirection)) {
    console.log("returning shortcut: ", bestDirection);
    return bestDirection;
  }

  console.log("Can't shortcut");
}

// checks to see if shortcut will cut snake off from hamiltonian cycle
function checkPath(info: SnakeGame, checkDirection: string): boolean {
  updateBlockedTiles(info);
  const snake = info.snake;
  const head = snake.head;
  const activeTiles = snake.activeTiles;

  let x = head.x;
  let y = head.y;

  // This is assuming we make this move, meaning 1 tick has passed
  let time = 0;

  const [nextX, nextY] = nextDirection(checkDirection);
  x += nextX;
  y += nextY;

  // Gets node based of hypothetical direction
  let currentNode = nodeArray.find((node) => node.x === x && node.y === y);

  if (!currentNode) {
    throw new Error("Node not found");
  }

  // Checks if snake can easily reach the Hamiltonian cycle after this shortcut
  for (let i = 0; i < activeTiles.length; i++) {
    const nextNode = nodeArray.find((node) => node.id === currentNode!.nextId);

    if (!nextNode) {
      throw new Error("Node not found");
    }

    if (nextNode.blocked && nextNode.timer > time) {
      return false;
    }
    currentNode = nextNode;
    time++;
  }

  return true;
}

// Functions that communicate with the snake game to determine the "fastest" direction to the apple
function getBestDirection(info: SnakeGame) {
  let bestDirection = info.snake.naturalDirection;
  let bestScore = -Infinity;

  for (let i = 0; i < 4; i++) {
    const direction = (i * Math.PI) / 2;
    const score = getDirectionScore(direction, info);
    if (score > bestScore) {
      bestScore = score;
      bestDirection = direction;
    }
  }

  return bestDirection;
}

function getDirectionScore(direction: number, info: SnakeGame) {
  const applePos: [number, number] = [info.apple.x, info.apple.y];

  // If collision is imminent in that direction
  if (info.snake.isDangerAhead(direction)) return -Infinity;

  const nextTile = info.snake.getNextTileID(direction);
  const nextTilePos: [number, number] = [nextTile.x, nextTile.y];
  const distance = getHeuristicCost(nextTilePos, applePos);

  const score = 1 / distance;
  return score;
}

// Get's "bird's eye view" of the cost of the path to the apple
function getHeuristicCost(
  pos1: [number, number],
  pos2: [number, number]
): number {
  return Math.sqrt(
    Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2)
  );
}

// Converts direction to radians for the snakeGame to use
function convertDirectionToRadians(direction: string) {
  switch (direction) {
    case "up":
      return Math.PI / 2;
    case "down":
      return (3 * Math.PI) / 2;
    case "left":
      return Math.PI;
    case "right":
      return 0;
  }

  throw new Error("Invalid direction");
}

// Converts radians to direction for this file to use
function convertRadiansToDirection(radians: number) {
  switch (radians) {
    case Math.PI / 2:
      return "up";
    case (3 * Math.PI) / 2:
      return "down";
    case Math.PI:
      return "left";
    case 0:
      return "right";
  }

  throw new Error("Invalid radians");
}

function nextDirection(direction: string) {
  let x = 0;
  let y = 0;

  switch (direction) {
    case "down":
      y++;
      break;
    case "up":
      y--;
      break;
    case "right":
      x++;
      break;
    case "left":
      x--;
      break;
  }

  return [x, y];
}
