import { makeNewPath } from "./AStar";
import { SnakeGame } from "./SnakeGame";
import { generateHamiltonianCycle, posToDir } from "./spanningTree";

type Direction = "up" | "down" | "left" | "right";
class Node {
  public nextDirection: Direction;

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

  const treeNodes = generateHamiltonianCycle(width / 2, height / 2);
  let cycleArray: Node[] = [];

  for (let i = 0; i < treeNodes.length; i++) {
    const treeNode = treeNodes[i];
    const nextNode = treeNodes[(i + 1) % treeNodes.length];
    const prevNode = treeNodes[(i - 1 + treeNodes.length) % treeNodes.length];

    const nextDirection = posToDir(
      treeNode.x,
      treeNode.y,
      nextNode.x,
      nextNode.y
    );

    const newNode = new Node(
      treeNode.x,
      treeNode.y,
      nextDirection,
      i,
      (i + 1) % treeNodes.length,
      (i - 1 + treeNodes.length) % treeNodes.length
    );
    cycleArray.push(newNode);
  }

  nodeArray = cycleArray;
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
export function getHamiltonianDirection(info: SnakeGame): number {
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

  if (movingInReverse) {
    direction = reverseDirection(currentNode);
  }

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
  if (checkPath(info)) {
    return aStarDirections.shift();
  } else {
    if (aStarDirections.length > 0) {
      return aStarDirections.shift();
    }
  }
}

// checks to see if shortcut will cut snake off from hamiltonian cycle
function checkPath(info: SnakeGame): boolean {
  const activeTiles = info.snake.activeTiles;
  const grid = info.grid;

  // If the snake is too close to the end the game, don't shortcut as it makes empty tiles
  if (activeTiles.length > (grid.gridTilesX * grid.gridTilesY * 6.25) / 10) {
    return false;
  }

  const aStarPath = makeNewPath(info);
  const [simulatedNode, simulatedNodeArray]: [
    Node | undefined,
    Node[] | undefined
  ] = simulateAStarState(info, aStarPath);

  if (!simulatedNode || !simulatedNodeArray) {
    return false;
  }

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

  if (checkHamiltonianCycle(simulatedNodeArray, currentNode, true, false)) {
    aStarDirections = aStarPath;
    movingInReverse = false;
    return true;
  } else if (
    checkHamiltonianCycle(simulatedNodeArray, currentNode, true, true)
  ) {
    aStarDirections = aStarPath;
    movingInReverse = true;
    return true;
  }

  return false;

  function checkHamiltonianCycle(
    nodeArray: Node[],
    cNode: Node,
    preMove: boolean,
    reverse: boolean = false
  ): boolean {
    let mod = preMove ? 1 : 0;
    let time = -2;

    let currentNode = cNode;
    for (let i = 0; i < activeTiles.length + mod; i++) {
      let nextNode = nodeArray.find((node) => node.id === currentNode!.nextId);

      if (reverse) {
        nextNode = nodeArray.find((node) => node.id === currentNode!.prevId);
      }

      if (!nextNode) {
        throw new Error("Node not found");
      }

      if (nextNode.blocked && nextNode.timer >= time) {
        return false;
      }
      currentNode = nextNode;
      time++;
    }

    return true;
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
function convertDirectionToRadians(direction: string): number {
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
function convertRadiansToDirection(radians: number): string {
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

function nextDirection(direction: string): number[] {
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

function reverseDirection(currentNode: Node): Direction {
  const prevNode = nodeArray.find((node) => node.id === currentNode.prevId);
  const [x, y] = [prevNode!.x - currentNode.x, prevNode!.y - currentNode.y];
  switch (x) {
    case 1:
      return "right";
    case -1:
      return "left";
  }
  switch (y) {
    case 1:
      return "down";
    case -1:
      return "up";
  }

  throw new Error("Invalid direction");
}
