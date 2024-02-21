import { Ship } from "./GameRooms";

export class Game {

  createField(ships: Ship[]) {
    const board: number[][] = Array.from({ length: ships.length }, () =>
      Array(ships.length).fill(-1)
    );

    const coordinates: { x: number; y: number, index: number }[] = [];

    ships.forEach((ship, index) => {
      for (let i = 0; i < ship.length; i += 1) {
        coordinates.push({
          x: !ship.direction ? ship.position.x + i : ship.position.x,
          y: ship.direction ? ship.position.y + i : ship.position.y,
          index,
        });
      }
    });

    coordinates.forEach(({x, y, index}) => {
      board[y][x] = index;
    })
    return board;
  }
}
