"use client";

import { Snake } from "./Snake/Snake";

export class Grid {
  public gridTiles: Tile[][] = [];
  public spacing = 4;
  public active: boolean = true;
  public standardTileColor = "#091187";
  public draw = true;

  constructor(public gridTilesX: number, public gridTilesY: number) {
    this.init();
  }

  // Makes an array of Tiles
  init() {
    this.active = true;
    let newGridTiles = [];

    for (let i = 0; i < this.gridTilesX; i++) {
      const row = new Array(this.gridTilesY);

      for (let j = 0; j < this.gridTilesY; j++) {
        row[j] = new Tile(i, j, this);
      }

      newGridTiles[i] = row;
    }
    this.gridTiles = newGridTiles;
  }

  getTileOffsets(border: number = 0.1) {
    const canvasId = "snakeCanvas";
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error("Canvas not found!");
    }

    const borderModif = 1 - border * 2;

    // Adjust tile size calculation to ensure the grid is centered
    const tileSize = Math.min(
      (canvas.width * borderModif) / this.gridTilesX,
      (canvas.height * borderModif) / this.gridTilesY
    );

    const offsetX = (canvas.width - this.gridTilesX * tileSize) / 2;
    const offsetY = (canvas.height - this.gridTilesY * tileSize) / 2;

    return { offsetX, offsetY, tileSize };
  }

  drawLineBetweenTiles(
    tile1: TileID,
    tile2: TileID,
    color: string = "#000000"
  ) {
    if (!this.draw) return;

    const canvasId = "snakeCanvas";
    const border = 0.1;

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.error("Canvas not found!");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Unable to get canvas ctx!");
      return;
    }

    // Calculate tile size and borders
    const { offsetX, offsetY, tileSize } = this.getTileOffsets(border);

    // Draw the line between the tiles
    ctx.lineCap = "square";
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = (tileSize * 3) / 5;
    ctx.moveTo(
      tile1.x * tileSize + offsetX + tileSize / 2,
      tile1.y * tileSize + offsetY + tileSize / 2
    );
    ctx.lineTo(
      tile2.x * tileSize + offsetX + tileSize / 2,
      tile2.y * tileSize + offsetY + tileSize / 2
    );
    ctx.stroke();
  }

  drawSnake(canvasId: string, snake: Snake, border: number = 0.1) {
    if (snake.lives <= 0) {
      return;
    }
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

    if (!canvas) {
      console.error("Canvas not found!");
      return;
    }
    const ctx = canvas.getContext("2d")!;
    const { offsetX, offsetY, tileSize } = this.getTileOffsets(border);

    const snakeTiles = snake.activeTiles;

    for (let i = 0; i < snakeTiles.length; i++) {
      const tile = snakeTiles[i];
      const gridTile = this.gridTiles[tile.x][tile.y];

      ctx.fillStyle = gridTile.color!;
      ctx.fillRect(
        tile.x * tileSize + offsetX,
        tile.y * tileSize + offsetY,
        tileSize,
        tileSize
      );
    }

    for (let i = 0; i < snakeTiles.length - 1; i++) {
      const tile1 = snakeTiles[i];
      const tile2 = snakeTiles[i + 1];
      const tile = this.gridTiles[tile1.x][tile1.y];

      let color = darkenColor(tile.color!, -15) || "#000000";

      this.drawLineBetweenTiles(tile2, tile1, color);
    }

    for (let i = 0; i < snakeTiles.length; i++) {
      const tileID = snakeTiles[i];
      const tile = this.gridTiles[tileID.x][tileID.y];
      // Draw the border of the tiles
      let backgroundColor = darkenColor(tile.color!)!;

      // sets opacity of border
      backgroundColor = backgroundColor.slice(0, -1) + ", 0.5)";
      ctx.strokeStyle = backgroundColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        tile.x * tileSize + offsetX,
        tile.y * tileSize + offsetY,
        tileSize,
        tileSize
      );
    }

    // Draws Better Apple
    const apple = snake.apple;
    if (!apple) return;

    const tile = this.gridTiles[apple.x][apple.y];
    const color = darkenColor(tile.color!, -15) || "#000000";
    ctx.fillStyle = color;
    // Draws a rect in the inner 4/5ths of the tile
    ctx.fillRect(
      apple.x * tileSize + offsetX + tileSize / 10,
      apple.y * tileSize + offsetY + tileSize / 10,
      (tileSize * 3.75) / 5,
      (tileSize * 3.75) / 5
    );

    // gets direction of snake
    const direction = snake.direction;
    // Draw eyes on snake based on direction
    const eyeSize = tileSize / 5;
    const eyeOffset = tileSize / 10;
    ctx.fillStyle = "#000000";
    const headTile = snake.activeTiles[0];

    // Draws eyes on the snake
    let offsetX1 = 0;
    let offsetX2 = 0;
    let offsetY1 = 0;
    let offsetY2 = 0;

    if (direction === 0) {
      // Right
      offsetX1 = tileSize - eyeOffset - eyeSize;
      offsetY1 = eyeOffset;
      offsetX2 = tileSize - eyeOffset - eyeSize;
      offsetY2 = tileSize - eyeOffset - eyeSize;
    } else if (direction === Math.PI / 2) {
      // Up
      offsetX1 = eyeOffset;
      offsetY1 = eyeOffset;
      offsetX2 = tileSize - eyeOffset - eyeSize;
      offsetY2 = eyeOffset;
    } else if (direction === Math.PI) {
      // Left
      offsetX1 = eyeOffset;
      offsetY1 = tileSize - eyeOffset - eyeSize;
      offsetX2 = eyeOffset;
      offsetY2 = eyeOffset;
    } else if (direction === (3 * Math.PI) / 2) {
      // Down
      offsetX1 = eyeOffset;
      offsetY1 = tileSize - eyeOffset - eyeSize;
      offsetX2 = tileSize - eyeOffset - eyeSize;
      offsetY2 = tileSize - eyeOffset - eyeSize;
    }

    ctx.fillRect(
      headTile.x * tileSize + offsetX + offsetX1,
      headTile.y * tileSize + offsetY + offsetY1,
      eyeSize,
      eyeSize
    );
    ctx.fillRect(
      headTile.x * tileSize + offsetX + offsetX2,
      headTile.y * tileSize + offsetY + offsetY2,
      eyeSize,
      eyeSize
    );
  }

  drawGrid(canvasId: string, border: number = 0.1, snake: Snake) {
    if (!this.draw) return;

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.error("Canvas not found!");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Unable to get canvas ctx!");
      return;
    }

    // Calculate tile size and borders
    const { offsetX, offsetY, tileSize } = this.getTileOffsets(border);

    //  gradient for the border around the outer grid area
    const gridWidth = this.gridTilesX * tileSize;
    const gridHeight = this.gridTilesY * tileSize;

    const gradient = ctx.createLinearGradient(
      offsetX,
      offsetY,
      offsetX + gridWidth,
      offsetY + gridHeight
    );
    gradient.addColorStop(0, "#8988db");
    gradient.addColorStop(0.5, "#5554a1");
    gradient.addColorStop(1, "#3c2366");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 5;
    ctx.strokeRect(offsetX, offsetY, gridWidth, gridHeight);

    // Draw each tile
    for (let x = 0; x < this.gridTilesX; x++) {
      for (let y = 0; y < this.gridTilesY; y++) {
        const tile = this.gridTiles[x][y];

        // Standard colors
        let tileColor = tile.color;
        let backgroundColor = tile.backgroundColor;

        // Draw the tile
        ctx.fillStyle = tileColor;
        ctx.fillRect(
          x * tileSize + offsetX,
          y * tileSize + offsetY,
          tileSize,
          tileSize
        );

        // Draw the border of the tile
        ctx.strokeStyle = backgroundColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(
          x * tileSize + offsetX,
          y * tileSize + offsetY,
          tileSize,
          tileSize
        );
      }
    }

    this.drawSnake(canvasId, snake, border);
  }

  // Clears the grid, different name, same function
  death() {
    this.init();
  }
}

export class TileID {
  constructor(public x: number, public y: number, public grid: Grid) {}
}

export class Tile {
  public full = false;
  public active = false;
  public defaultColor = this.grid.standardTileColor;
  public defaultBackgroundColor = this.defaultColor;
  public backgroundColor: string = this.defaultColor;
  public color: string = this.defaultColor;

  constructor(
    public x: number,
    public y: number,
    public grid: Grid,
    public type: string = "None"
  ) {
    this.defaultColor = getGradientColor(
      this.x,
      this.y,
      this.grid.gridTilesX,
      this.grid.gridTilesY,
      this.backgroundColor
    );

    this.color = this.defaultColor;
    this.defaultBackgroundColor =
      darkenColor(this.defaultColor, 15) || "#000000";
    this.backgroundColor = this.defaultBackgroundColor;
  }

  fillTile() {
    this.full = true;
  }

  clearTile() {
    this.full = false;
    this.active = false;
    this.type = "None";

    if (this.grid.active) {
      this.color = this.defaultColor;
      this.backgroundColor = this.defaultBackgroundColor;
    }
  }
}

// Returns a grey color from a gradient based on the given points
export function getGradientColor(
  x: number,
  y: number,
  xTotal: number,
  yTotal: number,
  baseColor: string | null = null
): string {
  // Calculate percentages based on the given points
  const xPercentage = (x / xTotal) * 100;
  const yPercentage = (y / yTotal) * 100;

  // Calculate the distance from the bottom (for darkness) and top-right (for lightness)
  const distanceFromBottom = 100 - yPercentage;
  const distanceFromTopRight = Math.sqrt(
    (100 - xPercentage) ** 2 + yPercentage ** 2
  );

  // If baseColor is provided, blend towards a lighter or darker variant of it
  if (baseColor) {
    // Darken or lighten based on distances
    const offset = Math.floor(
      (((distanceFromBottom + distanceFromTopRight) / 2) * 255) / 200
    );
    const modifiedColor = darkenColor(baseColor, -offset);

    if (!modifiedColor) {
      console.error("Invalid color format");
      return baseColor;
    }
    return modifiedColor;
  }

  // Gets color values between dark (0, 0, 0) and light (255, 255, 255) based on distances
  let greyValue = Math.floor(
    (((distanceFromBottom + distanceFromTopRight) / 2) * 255) / 200
  );

  greyValue += Math.floor(Math.random() * 10) - 5;

  const rgbColor = `rgb(${greyValue}, ${greyValue}, ${greyValue})`;

  return rgbColor;
}

export function darkenColor(color: string, offset = 30): string | null {
  let r, g, b;

  // Handling RGB format: 'rgb(r, g, b)'
  const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
  const rgbMatch = color.match(rgbRegex);

  if (rgbMatch && rgbMatch.length === 4) {
    r = parseInt(rgbMatch[1]);
    g = parseInt(rgbMatch[2]);
    b = parseInt(rgbMatch[3]);
  } else {
    // Handling hex format: '#rrggbb' or '#rgb'
    const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const shorthandHexRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

    const hexMatch = color.match(hexRegex);
    const shorthandHexMatch = color.match(shorthandHexRegex);

    if (hexMatch && hexMatch.length === 4) {
      r = parseInt(hexMatch[1], 16);
      g = parseInt(hexMatch[2], 16);
      b = parseInt(hexMatch[3], 16);
    } else if (shorthandHexMatch && shorthandHexMatch.length === 4) {
      r = parseInt(shorthandHexMatch[1] + shorthandHexMatch[1], 16);
      g = parseInt(shorthandHexMatch[2] + shorthandHexMatch[2], 16);
      b = parseInt(shorthandHexMatch[3] + shorthandHexMatch[3], 16);
    } else {
      // If invalid string format, return null
      return null;
    }
  }

  r -= offset;
  g -= offset;
  b -= offset;

  // Construct the new RGB string
  const newRGBString = `rgb(${r}, ${g}, ${b})`;
  return newRGBString;
}

export function gradientGrid(grid: Grid, baseColor: string | null = null) {
  for (let i = 0; i < grid.gridTilesX; i++) {
    for (let j = 0; j < grid.gridTilesY; j++) {
      const tile = grid.gridTiles[i][j];
      tile.color = getGradientColor(
        i,
        j,
        grid.gridTilesX,
        grid.gridTilesY,
        baseColor
      );
      tile.backgroundColor = getGradientColor(
        i,
        j,
        grid.gridTilesX,
        grid.gridTilesY,
        baseColor
      );
    }
  }
}
