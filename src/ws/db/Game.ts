import { Ship } from "./GameRoomsDB";

export class Game {
  createField(ships: Ship[]) {
    const board: number[][] = Array.from({ length: ships.length }, () =>
      Array(ships.length).fill(-1)
    );

    const coordinates: { x: number; y: number; index: number }[] = [];

    ships.forEach((ship, index) => {
      for (let i = 0; i < ship.length; i += 1) {
        coordinates.push({
          x: !ship.direction ? ship.position.x + i : ship.position.x,
          y: ship.direction ? ship.position.y + i : ship.position.y,
          index,
        });
      }
    });

    coordinates.forEach(({ x, y, index }) => {
      board[y][x] = index;
    });
    return board;
  }

  randomCoordinatesForAtack(max: number) {
    const randomNumber = (mx: number, mn: number) =>
      Math.floor(Math.random() * (mx - mn)) + mn;

    return { x: randomNumber(0, max), y: randomNumber(0, max) };
  }
}
