"use client";

import React, { useEffect, useRef, useState } from "react";

type Edge = [number, number, number];

class Node {
  x: number;
  y: number;
  connections: [number, number][] = [];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  addProperConnection(x: number, y: number) {
    this.connections.push([x, y]);
  }
}

const WIDTH = 5;
const HEIGHT = 5;

function makeSet(parent: number[], rank: number[], n: number) {
  for (let i = 0; i < n; i++) {
    parent[i] = i;
    rank[i] = 0;
  }
}

function findParent(parent: number[], component: number): number {
  if (parent[component] === component) return component;
  return (parent[component] = findParent(parent, parent[component]));
}

function unionSet(u: number, v: number, parent: number[], rank: number[]) {
  u = findParent(parent, u);
  v = findParent(parent, v);

  if (rank[u] < rank[v]) {
    parent[u] = v;
  } else if (rank[u] > rank[v]) {
    parent[v] = u;
  } else {
    parent[v] = u;
    rank[u]++;
  }
}

function spanningTree(
  n: number,
  edges: Edge[]
): { nodes: Node[]; minCost: number } {
  edges.sort((a, b) => a[2] - b[2]);

  const parent = new Array(n);
  const rank = new Array(n);
  makeSet(parent, rank, n);

  const nodes: Node[] = Array.from(
    { length: n },
    (_, i) => new Node(Math.floor(i / Math.sqrt(n)), i % Math.sqrt(n))
  );
  let minCost = 0;

  for (let i = 0; i < edges.length; i++) {
    const [u, v, wt] = edges[i];
    const v1 = findParent(parent, u);
    const v2 = findParent(parent, v);

    if (v1 !== v2) {
      unionSet(v1, v2, parent, rank);
      nodes[u].addProperConnection(nodes[v].x, nodes[v].y);
      nodes[v].addProperConnection(nodes[u].x, nodes[u].y);
      minCost += wt;
    }
  }

  return { nodes, minCost };
}

function scaleUpNodes(nodes: Node[]): Node[] {
  let scaledNodes: Node[] = [];

  // Initialize scaled nodes
  for (let i = 0; i < WIDTH * 2; i++) {
    for (let j = 0; j < HEIGHT * 2; j++) {
      scaledNodes.push(new Node(i, j));
    }
  }

  nodes.forEach((node, index) => {
    // Get the connected nodes and their directions
    const connectedNodes = node.connections;
    const connectedDirections = connectedNodes.map(([x, y]) =>
      posToDir(node.x, node.y, x, y)
    );

    console.log(node.x, node.y, connectedDirections);

    // Get the scaled node indexes
    const scaledNodeIndexes = getScaledNodeIndexes(node);

    //Primary four nodes
    const upLeft = scaledNodes.find(
      (n) => n.x === scaledNodeIndexes[0][0] && n.y === scaledNodeIndexes[0][1]
    )!;
    const upRight = scaledNodes.find(
      (n) => n.x === scaledNodeIndexes[1][0] && n.y === scaledNodeIndexes[1][1]
    )!;
    const downLeft = scaledNodes.find(
      (n) => n.x === scaledNodeIndexes[2][0] && n.y === scaledNodeIndexes[2][1]
    )!;
    const downRight = scaledNodes.find(
      (n) => n.x === scaledNodeIndexes[3][0] && n.y === scaledNodeIndexes[3][1]
    )!;

    // Add connections to the scaled nodes
    if (!connectedDirections.includes("up")) {
      upLeft.addProperConnection(upRight.x, upRight.y);
      upRight.addProperConnection(upLeft.x, upLeft.y);
    }
    if (!connectedDirections.includes("down")) {
      downLeft.addProperConnection(downRight.x, downRight.y);
      downRight.addProperConnection(downLeft.x, downLeft.y);
    }
    if (!connectedDirections.includes("left")) {
      upLeft.addProperConnection(downLeft.x, downLeft.y);
      downLeft.addProperConnection(upLeft.x, upLeft.y);
    }
    if (!connectedDirections.includes("right")) {
      upRight.addProperConnection(downRight.x, downRight.y);
      downRight.addProperConnection(upRight.x, upRight.y);
    }

    // add connections to outer nodes

    if (connectedDirections.includes("up")) {
      const upUpLeft = scaledNodes.find(
        (n) =>
          n.x === scaledNodeIndexes[0][0] && n.y === scaledNodeIndexes[0][1] - 1
      )!;

      const upUpRight = scaledNodes.find(
        (n) =>
          n.x === scaledNodeIndexes[1][0] && n.y === scaledNodeIndexes[1][1] - 1
      )!;

      upLeft.addProperConnection(upUpLeft.x, upUpLeft.y);
      upUpLeft.addProperConnection(upLeft.x, upLeft.y);
      upRight.addProperConnection(upUpRight.x, upUpRight.y);
      upUpRight.addProperConnection(upRight.x, upRight.y);
    }

    if (connectedDirections.includes("down")) {
      const downDownLeft = scaledNodes.find(
        (n) =>
          n.x === scaledNodeIndexes[2][0] && n.y === scaledNodeIndexes[2][1] + 1
      )!;

      const downDownRight = scaledNodes.find(
        (n) =>
          n.x === scaledNodeIndexes[3][0] && n.y === scaledNodeIndexes[3][1] + 1
      )!;

      downLeft.addProperConnection(downDownLeft.x, downDownLeft.y);
      downDownLeft.addProperConnection(downLeft.x, downLeft.y);
      downRight.addProperConnection(downDownRight.x, downDownRight.y);
      downDownRight.addProperConnection(downRight.x, downRight.y);
    }

    if (connectedDirections.includes("left")) {
      const leftUpLeft = scaledNodes.find(
        (n) =>
          n.x === scaledNodeIndexes[0][0] - 1 && n.y === scaledNodeIndexes[0][1]
      )!;

      const leftDownLeft = scaledNodes.find(
        (n) =>
          n.x === scaledNodeIndexes[2][0] - 1 && n.y === scaledNodeIndexes[2][1]
      )!;

      upLeft.addProperConnection(leftUpLeft.x, leftUpLeft.y);
      leftUpLeft.addProperConnection(upLeft.x, upLeft.y);
      downLeft.addProperConnection(leftDownLeft.x, leftDownLeft.y);
      leftDownLeft.addProperConnection(downLeft.x, downLeft.y);
    }

    if (connectedDirections.includes("right")) {
      const rightUpRight = scaledNodes.find(
        (n) =>
          n.x === scaledNodeIndexes[1][0] + 1 && n.y === scaledNodeIndexes[1][1]
      )!;

      const rightDownRight = scaledNodes.find(
        (n) =>
          n.x === scaledNodeIndexes[3][0] + 1 && n.y === scaledNodeIndexes[3][1]
      )!;

      upRight.addProperConnection(rightUpRight.x, rightUpRight.y);
      rightUpRight.addProperConnection(upRight.x, upRight.y);
      downRight.addProperConnection(rightDownRight.x, rightDownRight.y);
      rightDownRight.addProperConnection(downRight.x, downRight.y);
    }
  });

  // remove duplicate connections
  scaledNodes.forEach((node) => {
    node.connections = node.connections.filter(
      ([x, y], index, self) =>
        self.findIndex((t) => t[0] === x && t[1] === y) === index
    );
  });

  return scaledNodes;
}

function getScaledNodeIndexes(node: Node): [number, number][] {
  // [2x,2y], [2x+1, 2y], [2x, 2y+1], [2x+1, 2y+1]

  const scaledX = node.x * 2;
  const scaledY = node.y * 2;

  return [
    [scaledX, scaledY], // 0
    [scaledX + 1, scaledY], // 1
    [scaledX, scaledY + 1], // 2
    [scaledX + 1, scaledY + 1], // 3
  ];
}

function posToDir(x1: number, y1: number, x2: number, y2: number): string {
  // 1 -> start, 2 -> end position
  if (x1 === x2 && y1 === y2 + 1) return "up";
  if (x1 === x2 && y1 === y2 - 1) return "down";
  if (x1 === x2 + 1 && y1 === y2) return "left";
  if (x1 === x2 - 1 && y1 === y2) return "right";
  throw new Error("Invalid direction");
}

const generateGridEdges = (rows: number, cols: number): Edge[] => {
  const edges: Edge[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const node = i * cols + j;
      if (j < cols - 1) {
        edges.push([node, node + 1, Math.floor(Math.random() * 10) + 1]);
      }
      if (i < rows - 1) {
        edges.push([node, node + cols, Math.floor(Math.random() * 10) + 1]);
      }
    }
  }
  return edges;
};

const SpanningTree: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [edges] = useState<Edge[]>(generateGridEdges(WIDTH, HEIGHT));
  const [nodes, setNodes] = useState<Node[]>([]);
  const [scaledNodes, setScaledNodes] = useState<Node[]>([]);
  const [minCost, setMinCost] = useState<number>(0);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  useEffect(() => {
    const { nodes, minCost } = spanningTree(WIDTH * HEIGHT, edges);
    if (!hasGenerated) {
      setNodes(nodes);
      setMinCost(minCost);
      setScaledNodes(scaleUpNodes(nodes));
      setHasGenerated(true);
    }
  }, [edges]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "green";

        const cellWidth = canvas.width / HEIGHT;
        const cellHeight = canvas.height / WIDTH;

        // Draw original nodes and connections in green
        nodes.forEach((node) => {
          node.connections.forEach(([x, y]) => {
            const x1 = node.x * cellWidth + cellWidth / 2;
            const y1 = node.y * cellHeight + cellHeight / 2;
            const x2 = x * cellWidth + cellWidth / 2;
            const y2 = y * cellHeight + cellHeight / 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          });
        });

        // Draw scaled-up nodes and connections in red
        ctx.strokeStyle = "red";
        const scaledCellWidth = canvas.width / (HEIGHT * 2);
        const scaledCellHeight = canvas.height / (WIDTH * 2);

        scaledNodes.forEach((node) => {
          node.connections.forEach(([x, y]) => {
            const x1 = node.x * scaledCellWidth + scaledCellWidth / 2;
            const y1 = node.y * scaledCellHeight + scaledCellHeight / 2;
            const x2 = x * scaledCellWidth + scaledCellWidth / 2;
            const y2 = y * scaledCellHeight + scaledCellHeight / 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          });
        });
      }
    }
  }, [nodes, scaledNodes, minCost, WIDTH, HEIGHT]);

  return <canvas ref={canvasRef} width={800} height={800} />;
};

export default SpanningTree;
