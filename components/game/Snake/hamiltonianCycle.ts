import { makeNewPath } from "./AStar";
import { SnakeGame } from "./SnakeGame";

class Node {
  public nextDirection: "up" | "down" | "left" | "right";

  constructor(
    public x: number = 0,
    public y: number = 0,
    nextDirection: any,
    public id: number,
    public nextId: number = -1,
    public prevId: number = -1,
    public blocked: boolean = false,
    public timer: number = 0
  ) {
    this.x = x;
    this.y = y;
    this.nextDirection = nextDirection;
    this.id = id;
  }
}

let aStarDirections: number[] = [];
let nodeArray: Node[] = [];
let movingInReverse = false;   

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
      node.prevId = nodeArray[nodeArray.length - 1].id;
    }

    nodeArray.push(node);

    // Sets final node to point to the first node
    if (nodeArray.length === width * height) {
      nodeArray[nodeArray.length - 1].nextId = 0;
      nodeArray[0].prevId = nodeArray.length - 1;
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
  if (aStarDirections.length > 0) {
    return aStarDirections.shift();
  }

  let response = checkPath(info);

  if (response === true) {
    return aStarDirections.shift();
  }

  console.log("Can't shortcut");
}

// checks to see if shortcut will cut snake off from hamiltonian cycle
function checkPath(info: SnakeGame): boolean | number {
  const aStarPath = makeNewPath(info);
  const [simulatedNode, simulatedNodeArray]: [
    Node | undefined,
    Node[] | undefined
  ] = simulateAStarState(info, aStarPath);

  if (!simulatedNode || !simulatedNodeArray) {
    return false;
  }

  const activeTiles = info.snake.activeTiles;
  let x = simulatedNode.x;
  let y = simulatedNode.y;

  // Gets node based of hypothetical path
  let currentNode = simulatedNodeArray.find(
    (node) => node.x === x && node.y === y
  );

  if (!currentNode) {
    throw new Error("Node not found");
  }

  // Checks if snake can easily reach the Hamiltonian cycle after this shortcut

  if (checkHamiltonianCycle(simulatedNodeArray, currentNode, true)) {
    aStarDirections = aStarPath;
    return true;
  } else {
    return altRoute();
  }

  function checkHamiltonianCycle(
    nodeArray: Node[],
    cNode: Node,
    preMove: boolean
  ): boolean {
    let mod = preMove ? 1 : 0;
    let time = 0 + mod;

    let currentNode = cNode;
    for (let i = 0; i < activeTiles.length + mod; i++) {
      const nextNode = nodeArray.find(
        (node) => node.id === currentNode!.nextId
      );

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

  function altRoute(): boolean | number {
    const direction = "right";
    const [nextX, nextY] = nextDirection(direction);
    x += nextX;
    y += nextY;
    const nextNode = nodeArray.find((node) => node.x === x && node.y === y);
    if (!nextNode || nextNode.blocked) {
      return false;
    }

    const doesPathWork = checkHamiltonianCycle(nodeArray, nextNode, false);
    console.log("Does path work: ", doesPathWork);

    if (doesPathWork) {
      return convertDirectionToRadians(direction);
    }

    return false;
  }
}

function simulateAStarState(
  info: SnakeGame,
  aStarPath: number[]
): [Node | undefined, Node[] | undefined] {
  updateBlockedTiles(info);

  const snake = info.snake;
  const head = snake.head;

  if (aStarPath.length === 0) {
    return [undefined, undefined];
  }

  let x = head.x;
  let y = head.y;
  let time = 0;

  let simulatedNodeArray: Node[] = [];
  Object.assign(simulatedNodeArray, nodeArray);

  aStarPath.forEach((dir) => {
    const direction = convertRadiansToDirection(dir);
    const [nextX, nextY] = nextDirection(direction);
    x += nextX;
    y += nextY;

    const node = simulatedNodeArray.find(
      (node) => node.x === x && node.y === y
    );
    if (!node) {
      throw new Error("Node not found");
    }

    node.blocked = true;
    node.timer = snake.activeTiles.length + time + 1;
    time += 1;
  });

  // reduces the time of the blocked tiles
  simulatedNodeArray.forEach((node) => {
    if (node.blocked) {
      node.timer -= time;
    }
    if (node.timer < 0) {
      node.blocked = false;
      node.timer = 0;
    }
  });

  // current state of noteArray is the simulated state, to reset simply updateBlockedTiles
  const finalNode = nodeArray.find((node) => node.x === x && node.y === y);
  if (!finalNode) {
    throw new Error("Node not found");
  }

  return [finalNode, simulatedNodeArray];
}

// Converts direction to radians for the snakeGame to use
function convertDirectionToRadians(
  direction: string,
  reverse: boolean = false
) {
  let radians = -1;
  switch (direction) {
    case "up":
      radians = Math.PI / 2;
      break;
    case "down":
      radians = (3 * Math.PI) / 2;
      break;
    case "left":
      radians = Math.PI;
      break;
    case "right":
      radians = 0;
      break;
  }

  if (reverse) {
    radians += Math.PI;
    if (radians > 2 * Math.PI) {
      radians -= 2 * Math.PI;
    }
  }

  if (radians === -1) {
    throw new Error("Invalid direction  " + direction);
  }

  return radians;
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