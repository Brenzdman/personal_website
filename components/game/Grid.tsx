"use client";

export class Grid {
  public gridTiles: Tile[][] = [];
  public spacing = 4;
  public active: boolean = true;
  public standardTileColor = "#3498db";
  public standardTileBackgroundColor = "#2b80b9";
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

  drawLineBetweenTiles(tile1: TileID, tile2: TileID) {
    if (!this.draw) return;

    const canvasId = "snakeCanvas";
    const border = 0.1;

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.error("Canvas not found!");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Unable to get canvas context!");
      return;
    }

    // How large the tiles are, and how to position them relative to the canvas

    let tileWidth: number, width: number;
    let sideBorder: number;
    if (canvas.height > canvas.width) {
      sideBorder = canvas.width * border;
      width = canvas.width - 2 * sideBorder;
      tileWidth = width / (this.gridTilesX - 2);
    } else {
      sideBorder = canvas.height * border;
      width = canvas.height - 2 * sideBorder;
      tileWidth = width / this.gridTilesY;
    }

    // For each tile, draws tile
    const sideBorderX = (canvas.width - tileWidth * this.gridTilesX) / 2;

    // Draws the line between the tiles
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.moveTo(
      tile1.x * tileWidth + sideBorderX + tileWidth / 2,
      tile1.y * tileWidth + sideBorder + tileWidth / 2
    );

    context.lineTo(
      tile2.x * tileWidth + sideBorderX + tileWidth / 2,
      tile2.y * tileWidth + sideBorder + tileWidth / 2
    );
    context.stroke();
  }

  drawGrid(canvasId: string, border: number = 0) {
    if (!this.draw) return;

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.error("Canvas not found!");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Unable to get canvas context!");
      return;
    }

    // How large the tiles are, and how to position them relative to the canvas

    let tileWidth: number, width: number;
    let sideBorder: number;
    if (canvas.height > canvas.width) {
      sideBorder = canvas.width * border;
      width = canvas.width - 2 * sideBorder;
      tileWidth = width / (this.gridTilesX - 2);
    } else {
      sideBorder = canvas.height * border;
      width = canvas.height - 2 * sideBorder;
      tileWidth = width / this.gridTilesY;
    }

    // For each tile, draws tile
    const sideBorderX = (canvas.width - tileWidth * this.gridTilesX) / 2;

    for (let x = 0; x < this.gridTilesX; x++) {
      for (let y = 0; y < this.gridTilesY; y++) {
        const tile = this.gridTiles[x][y];

        // Standard colors
        let tileColor = this.standardTileColor;
        let backgroundColor = this.standardTileBackgroundColor;

        if (tile.color) tileColor = tile.color;
        else tile.color = this.standardTileColor;

        // Adds Shading
        if (!tile.backgroundColor)
          tile.backgroundColor = this.standardTileBackgroundColor;

        if (tile.backgroundColor !== this.standardTileBackgroundColor)
          backgroundColor = tile.backgroundColor;
        else if (tile.color !== this.standardTileColor)
          backgroundColor = darkenColor(tile.color) || backgroundColor;

        // Draws the tile
        context.fillStyle = tileColor;
        context.fillRect(
          tile.x * tileWidth + sideBorderX,
          tile.y * tileWidth + sideBorder,
          tileWidth,
          tileWidth
        );

        // Draws the border of the tile
        context.strokeStyle = backgroundColor;
        context.lineWidth = 2;
        context.strokeRect(
          tile.x * tileWidth + sideBorderX,
          tile.y * tileWidth + sideBorder,
          tileWidth,
          tileWidth
        );
      }
    }
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

  constructor(
    public x: number,
    public y: number,
    public grid: Grid,
    public type: string = "None",
    public backgroundColor: string | undefined = undefined,
    public color: string | undefined = undefined
  ) {}

  fillTile() {
    this.full = true;
  }

  clearTile() {
    this.full = false;
    this.active = false;
    this.type = "None";

    if (this.grid.active) {
      this.color = this.grid.standardTileColor;
      this.backgroundColor = this.grid.standardTileBackgroundColor;
    }
  }
}

// Returns a grey color from a gradient based on the given points
export function getGradientColor(
  x: number,
  y: number,
  xTotal: number,
  yTotal: number
): string {
  // Calculate percentages based on the given points
  const xPercentage = (x / xTotal) * 100;
  const yPercentage = (y / yTotal) * 100;

  // Calculate the distance from the bottom (for darkness) and top-right (for lightness)
  const distanceFromBottom = 100 - yPercentage;
  const distanceFromTopRight = Math.sqrt(
    (100 - xPercentage) ** 2 + yPercentage ** 2
  );

  // Gets color values between dark (0, 0, 0) and light (255, 255, 255) based on distances
  let greyValue = Math.floor(
    (((distanceFromBottom + distanceFromTopRight) / 2) * 255) / 200
  );

  greyValue += Math.floor(Math.random() * 10) - 5;

  const rgbColor = `rgb(${greyValue}, ${greyValue}, ${greyValue})`;

  return rgbColor;
}

export function darkenColor(color: string) {
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

  r -= 30;
  g -= 30;
  b -= 30;

  // Construct the new RGB string
  const newRGBString = `rgb(${r}, ${g}, ${b})`;
  return newRGBString;
}

export function gradientGrid(grid: Grid) {
  for (let i = 0; i < grid.gridTilesX; i++) {
    for (let j = 0; j < grid.gridTilesY; j++) {
      const tile = grid.gridTiles[i][j];
      tile.color = getGradientColor(i, j, grid.gridTilesX, grid.gridTilesY);
      tile.backgroundColor = getGradientColor(
        i,
        j,
        grid.gridTilesX,
        grid.gridTilesY
      );
    }
  }
}
