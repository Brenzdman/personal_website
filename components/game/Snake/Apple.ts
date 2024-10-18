import { Grid } from "../Grid";

const APPLE_COLOR = "#ff0000";
const TILE_TYPE = "Apple";

export class Apple {
  public x: number = 0;
  public y: number = 0;
  public grid: Grid;
  public active: boolean = true;
  public tileType: string = TILE_TYPE;

  constructor(grid: Grid) {
    // Creates apple at random location
    this.grid = grid;
    this.active = true;
    this.generateApple();
    this.drawApple();
  }

  drawApple() {
    // Draws apple on grid

    if (!this.active) return;
    const tile = this.grid.gridTiles[this.x][this.y];
    tile.full = true;
    tile.active = true;
    tile.type = TILE_TYPE;
    tile.color = APPLE_COLOR;
  }

  generateApple() {
    // Generates new location on the visible grid

    const availablePositions: { x: number; y: number }[] = [];

    // Makes sure there is only one apple
    const currentTile = this.grid.gridTiles[this.x][this.y];
    if ((currentTile.type = TILE_TYPE)) {
      currentTile.clearTile();
    }

    // Looks for suitable positions
    for (let x = 0; x < this.grid.gridTilesX; x++) {
      for (let y = 0; y < this.grid.gridTilesY; y++) {
        const tile = this.grid.gridTiles[x][y];
        if (!tile.full) {
          availablePositions.push({ x, y });
        }
      }
    }

    if (availablePositions.length === 0) {
      console.error("No available positions for apple generation");
      return;
    }

    // Generates new apple
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const randomPosition = availablePositions[randomIndex];

    this.x = randomPosition.x;
    this.y = randomPosition.y;

    const newTile = this.grid.gridTiles[this.x][this.y];
    newTile.type = TILE_TYPE;
    newTile.full = true;
    newTile.active = true;
    newTile.color = APPLE_COLOR;
  }
}
