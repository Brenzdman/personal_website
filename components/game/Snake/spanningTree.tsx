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

class HamiltonianNode {
  constructor(
    public x: number,
    public y: number,
    public nextNode: HamiltonianNode | null = null,
    public prevNode: HamiltonianNode | null = null
  ) {}
}

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
    let newNodes: Node[] = [];

    // Create new nodes for the scaled indexes
    scaledNodeIndexes.forEach((index) => {
      let newNode = new Node(index[0], index[1]);
      newNodes.push(newNode);
    });

    // Establish proper connections based on the absence of connections in specific directions
    if (!connectedDirections.includes("up")) {
      const node1 = newNodes[0];
      const node2 = newNodes[1];
      node1.connections.push([node2.x, node2.y]);
      node2.connections.push([node1.x, node1.y]);
    }
    if (!connectedDirections.includes("down")) {
      const node1 = newNodes[2];
      const node2 = newNodes[3];
      node1.connections.push([node2.x, node2.y]);
      node2.connections.push([node1.x, node1.y]);
    }
    if (!connectedDirections.includes("left")) {
      const node1 = newNodes[0];
      const node2 = newNodes[2];
      node1.connections.push([node2.x, node2.y]);
      node2.connections.push([node1.x, node1.y]);
    }
    if (!connectedDirections.includes("right")) {
      const node1 = newNodes[1];
      const node2 = newNodes[3];
      node1.connections.push([node2.x, node2.y]);
      node2.connections.push([node1.x, node1.y]);
    }

    // Add the new nodes to the scaled nodes array
    scaledNodes.push(...newNodes);
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
