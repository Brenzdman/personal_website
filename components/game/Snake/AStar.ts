// A* Pathfinding

import { SnakeGame } from "./SnakeGame";

// f(n) = g(n) + h(n)
// total cost = cost to get to node + estimated (heuristic) cost to get to goal

class Node {
  x: number;
  y: number;
  gCost: number;
  hCost: number;
  fCost: number;
  blocked: boolean = false;
  parent: Node | null;

  constructor(x: number, y: number, parent: Node | null = null) {
    this.x = x;
    this.y = y;
    this.parent = parent;
    this.gCost = 0;
    this.hCost = 0;
    this.fCost = 0;
  }
}

// Priority Queue Implementation (Min-Heap)
class PriorityQueue {
  private heap: Node[] = [];

  enqueue(node: Node) {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): Node | undefined {
    if (this.isEmpty()) return undefined;
    const first = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }
    return first;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  // Helper method to check if a node exists in the heap based on coordinates
  findNode(x: number, y: number): Node | undefined {
    return this.heap.find((node) => node.x === x && node.y === y);
  }

  private bubbleUp(index: number) {
    const node = this.heap[index];
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIdx];
      if (node.fCost >= parent.fCost) break;
      this.heap[parentIdx] = node;
      this.heap[index] = parent;
      index = parentIdx;
    }
  }

  private bubbleDown(index: number) {
    const length = this.heap.length;
    const node = this.heap[index];

    while (true) {
      let leftIdx = 2 * index + 1;
      let rightIdx = 2 * index + 2;
      let swap: number | null = null;

      if (leftIdx < length) {
        if (this.heap[leftIdx].fCost < node.fCost) {
          swap = leftIdx;
        }
      }

      if (rightIdx < length) {
        if (
          (swap === null && this.heap[rightIdx].fCost < node.fCost) ||
          (swap !== null &&
            this.heap[rightIdx].fCost < this.heap[leftIdx].fCost)
        ) {
          swap = rightIdx;
        }
      }

      if (swap === null) break;

      this.heap[index] = this.heap[swap];
      this.heap[swap] = node;
      index = swap;
    }
  }
}

// Generates the current state of the grid and shows which tiles are blocked
function generateGridArray(snakeGame: SnakeGame): Node[][] {
  let gridNodeArray: Node[][] = [];

  for (let x = 0; x < snakeGame.grid.gridTilesX; x++) {
    gridNodeArray.push([]);
    for (let y = 0; y < snakeGame.grid.gridTilesY; y++) {
      gridNodeArray[x].push(new Node(x, y));
    }
  }

  for (let i = 0; i < snakeGame.snake.activeTiles.length; i++) {
    const tile = snakeGame.snake.activeTiles[i];
    const gridTile = gridNodeArray[tile.x][tile.y];
    gridTile.blocked = true;
  }

  return gridNodeArray;
}

export function makeNewPath(info: SnakeGame): number[] {
  const snake = info.snake;
  const apple = info.apple;

  const startPos: [number, number] = [snake.head.x, snake.head.y];
  const endPos: [number, number] = [apple.x, apple.y];

  info.grid.gridTiles[startPos[0]][startPos[1]].color = "#ffff00";

  const firstNode = new Node(startPos[0], startPos[1]);
  firstNode.gCost = 0;
  firstNode.hCost = getHeuristicCost(startPos, endPos);
  firstNode.fCost = firstNode.gCost + firstNode.hCost;

  let openList = new PriorityQueue();
  openList.enqueue(firstNode);
  const gridArray = generateGridArray(info);

  let closedList: Node[] = [];
  let currentNode: Node | null = null;

  let maxIterations = 1000;
  let iterations = 0;

  while (!openList.isEmpty()) {
    iterations++;
    if (iterations > maxIterations) {
      console.error("Max iterations reached");
      break;
    }

    currentNode = openList.dequeue()!;

    // If the goal is reached, trace the path
    if (currentNode.x === endPos[0] && currentNode.y === endPos[1]) {
      return tracePath(currentNode);
    }

    closedList.push(currentNode);
    getNeighbors(currentNode, endPos, openList, closedList, gridArray, info);
  }

  // Fallback if no path is found
  if (
    currentNode === null ||
    currentNode.x !== endPos[0] ||
    currentNode.y !== endPos[1]
  ) {
    console.warn("No path found, implementing fallback direction");
    return getFallbackDirection(snake, info.grid);
  }

  return tracePath(currentNode);

  // Function to trace back the path from the goal to the start
  function tracePath(finalNode: Node): number[] {
    let directionList: number[] = [];
    let path: Node[] = [];
    let node: Node | null = finalNode;

    while (node.parent) {
      path.push(node);
      node = node.parent;
    }
    path.push(node);

    path.reverse();

    if (path.length === 0) {
      throw new Error("No path found");
    }

    for (let i = 0; i < path.length - 1; i++) {
      const currentPos: [number, number] = [path[i].x, path[i].y];
      const nextPos: [number, number] = [path[i + 1].x, path[i + 1].y];

      info.grid.gridTiles[nextPos[0]][nextPos[1]].color = "#00ff00";
      // info.grid.gridTiles[apple.x][apple.y].color = "#ffffff";

      const direction = getDirectionFromPosition(currentPos, nextPos);
      directionList.push(direction);
    }

    return directionList;
  }

  // Function to get neighbors and process them
  function getNeighbors(
    node: Node,
    endPos: [number, number],
    openList: PriorityQueue,
    closedList: Node[],
    gridArray: Node[][],
    info: SnakeGame
  ) {
    const directions: [number, number][] = [
      [1, 0], // Right
      [0, -1], // Up
      [-1, 0], // Left
      [0, 1], // Down
    ];

    for (const [dx, dy] of directions) {
      const tileX = node.x + dx;
      const tileY = node.y + dy;

      // Check if the tile is out of bounds
      if (snake.isOutOfBounds(tileX, tileY)) continue;

      const gridLocation = gridArray[tileX][tileY];
      if (gridLocation.blocked) continue;

      // Check if the node is already in the closed list
      if (closedList.find((n) => n.x === tileX && n.y === tileY)) continue;

      const tentativeGCost = node.gCost + 1; // Uniform cost

      // Check if the node is already in the open list
      const existingOpenNode = openList.findNode(tileX, tileY);
      if (existingOpenNode) {
        if (tentativeGCost < existingOpenNode.gCost) {
          // Update the node with a better path
          existingOpenNode.gCost = tentativeGCost;
          existingOpenNode.hCost = getHeuristicCost([tileX, tileY], endPos);
          existingOpenNode.fCost =
            existingOpenNode.gCost + existingOpenNode.hCost;
          existingOpenNode.parent = node;
          // Since PriorityQueue doesn't support decrease-key, enqueue again
          openList.enqueue(existingOpenNode);
        }
      } else {
        const neighborNode = new Node(tileX, tileY, node);
        neighborNode.gCost = tentativeGCost;
        neighborNode.hCost = getHeuristicCost([tileX, tileY], endPos);
        neighborNode.fCost = neighborNode.gCost + neighborNode.hCost;
        openList.enqueue(neighborNode);
      }
    }
  }

  // Function to find a fallback direction when no path is found
  function getFallbackDirection(snake: any, grid: any): number[] {
    const directions: [number, number, number][] = [
      [1, 0, 0], // Right
      [0, -1, (3 * Math.PI) / 2], // Up
      [-1, 0, Math.PI], // Left
      [0, 1, Math.PI / 2], // Down
    ];

    for (const [dx, dy, direction] of directions) {
      const newX = snake.head.x + dx;
      const newY = snake.head.y + dy;
      if (
        !snake.isOutOfBounds(newX, newY) &&
        !grid.gridTiles[newX][newY].blocked
      ) {
        return [direction];
      }
    }

    // If no safe direction is found, continue in the current direction or handle accordingly
    // Here, returning the current direction as a fallback
    return [snake.currentDirection];
  }
}

// Helper function to determine the next position based on direction
function getPositionFromDirection(
  direction: number,
  currentPos: [number, number]
): [number, number] {
  const nextX = currentPos[0] + Math.round(Math.cos(direction));
  const nextY = currentPos[1] + Math.round(-Math.sin(direction));

  return [nextX, nextY];
}

// Helper function to determine direction based on current and next positions
function getDirectionFromPosition(
  currentPos: [number, number],
  nextPos: [number, number]
): number {
  const x1 = currentPos[0];
  const y1 = currentPos[1];
  const x2 = nextPos[0];
  const y2 = nextPos[1];

  if (x1 === x2) {
    if (y1 < y2) {
      return (3 * Math.PI) / 2; // Down
    } else {
      return Math.PI / 2; // Up
    }
  } else {
    if (x1 < x2) {
      return 0; // Right
    } else {
      return Math.PI; // Left
    }
  }
}

// Heuristic function using Manhattan Distance
function getHeuristicCost(
  pos1: [number, number],
  pos2: [number, number]
): number {
  return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
}
