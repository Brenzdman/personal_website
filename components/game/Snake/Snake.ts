import { Grid, Tile, TileID } from "../Grid";
import { Apple } from "./Apple";

const PLAYER_HEAD_TYPE = "Head";
const PLAYER_BODY_TYPE = "Snake";

export class Snake {
  public spawnX = Math.floor(this.grid.gridTilesX / 2);
  public spawnY = Math.floor(this.grid.gridTilesY / 2);

  public active: boolean = true;
  public length: number = 3;

  public head: TileID = new TileID(this.spawnX, this.spawnY, this.grid);

  public direction: number = Math.PI / 2; //rads from 0 to 2pi
  public naturalDirection: number = this.direction; //prevents 180 degree turns
  public activeTiles: TileID[] = [];
  public lives = 1;

  constructor(
    public grid: Grid,
    public apple: Apple | null,
    public overrideTopSpawnY: number = 0
  ) {
    this.init();
  }
  init() {
    this.active = true;

    // Sets starting point for snake
    let headTile = this.grid.gridTiles[this.spawnX][this.spawnY];

    headTile.type = PLAYER_HEAD_TYPE;

    this.head = new TileID(this.spawnX, this.spawnY, this.grid);
    this.activeTiles.push(this.head);

    this.drawSnake();
  }

  drawSnake() {
    if (!this.active) return;

    for (let i = 0; i < this.activeTiles.length; i++) {
      const tileId = this.activeTiles[i];
      const gridTiles = this.grid.gridTiles;

      const tile = gridTiles[tileId.x][tileId.y];

      if (tile.type === PLAYER_HEAD_TYPE) {
        tile.color = "#0000ff";
      } else {
        tile.type = PLAYER_BODY_TYPE;
        tile.color = "#2228db";
      }

      tile.full = true;
      tile.active = true;
    }
  }

  // Checks if snake is out of bounds
  isOutOfBounds(nextX: number, nextY: number) {
    const isOutsideGrid =
      nextX < 0 ||
      nextX >= this.grid.gridTilesX ||
      nextY < 0 ||
      nextY >= this.grid.gridTilesY;

    const isOutsideHidden = nextX < 1 || nextX > this.grid.gridTilesX - 1;

    if (isOutsideGrid) {
      return true;
    }

    // checks if snake should loop.
    if (!isOutsideHidden) {
      return;
    }
  }

  isAppleEaten(tile: Tile, check: boolean = false) {
    if (tile.type === this.apple?.tileType) {
      // looking ahead vs moving
      if (this.apple && !check) {
        this.apple.generateApple();
        if (this.length >= this.grid.gridTilesX * this.grid.gridTilesY) {
          return true;
        }

        this.length++;
      }
      return true;
    }
  }

  getNextTileID(direction: number = this.direction) {
    const epsilon = 0.0001; //to prevent rounding errors
    const nextX = Math.round(this.head.x + Math.cos(direction) + epsilon);
    const nextY = Math.round(this.head.y - Math.sin(direction) + epsilon); //y is inverted

    return new TileID(nextX, nextY, this.grid);
  }

  isDangerAhead(direction: number = this.direction) {
    const nextTileID = this.getNextTileID(direction);

    if (this.isOutOfBounds(nextTileID.x, nextTileID.y)) return true;

    const nextTile = this.grid.gridTiles[nextTileID.x][nextTileID.y];

    if (this.isAppleEaten(nextTile)) return false;

    return nextTile.full;
  }

  moveSnake() {
    const lastID = this.activeTiles[this.activeTiles.length - 1];

    if (!lastID) {
      console.error("Snake has no prev ID");
      console.error(this);
      return;
    }

    const epsilon = 0.0001; //to prevent rounding errors
    let nextX = Math.round(this.head.x + Math.cos(this.direction) + epsilon);
    const nextY = Math.round(this.head.y - Math.sin(this.direction) + epsilon); //y is inverted

    // If running into danger "die"
    if (this.isDangerAhead()) {
      this.reset(undefined);
      return;
    }

    // Else remove last tile and add new tile
    const lastTile = this.grid.gridTiles[lastID.x][lastID.y];
    lastTile.clearTile();

    if (this.length <= this.activeTiles.length) this.activeTiles.pop();

    //head change
    this.grid.gridTiles[this.head.x][this.head.y].type = "None";

    const nextTileID = new TileID(nextX, nextY, this.grid);
    const nextTile = this.grid.gridTiles[nextTileID.x][nextTileID.y];

    nextTile.type = PLAYER_HEAD_TYPE;

    this.activeTiles.unshift(nextTileID);
    this.head = nextTileID;

    this.naturalDirection = this.direction;

    this.drawSnake();
  }

  // Repositions Snake
  reset(moreLives: number | undefined) {
    // Checks lives
    if (moreLives) {
      this.lives = moreLives;
    } else this.lives--;

    const spawnTile = this.grid.gridTiles[this.spawnX][this.spawnY];

    if (this.lives < 1 || spawnTile.full) {
      this.active = false;
      this.death();
      return;
    }

    // Resets Stats
    this.direction = Math.PI / 2;
    this.naturalDirection = this.direction;

    // Clears all active tiles
    this.death();

    this.activeTiles = [];

    this.init();
  }

  death() {
    // Clears all active tiles over time.
    for (let i = 0; i < this.activeTiles.length; i++) {
      const tileId = this.activeTiles[i];
      const tile = this.grid.gridTiles[tileId.x][tileId.y];
      setTimeout(() => {
        tile.clearTile();
      }, i * 100);
    }
  }
}
