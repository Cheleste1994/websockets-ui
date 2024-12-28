import { DataShips } from "../modules/addShips/addShips";
import { Game } from "./Game";

type Field = number[][];

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}

interface UserGame {
  index: number;
  name: string;
  sessionId: string;
}

interface UserRoom extends UserGame {
  ships: Ship[];
  field: Field;
}

export interface GameRoomDB {
  user1: UserRoom;
  user2: UserRoom;
  idGame: number;
  indexUser: number;
  isFull: boolean;
  turnIndex: number;
}

export type GamesRoomDBType = InstanceType<typeof GamesRoomDB>;

export default class GamesRoomDB extends Game {
  private initialState: GameRoomDB[];

  constructor() {
    super();
    this.initialState = [];
  }

  createRoom() {
    const newLength = this.initialState.push({
      idGame: Date.now() + Math.trunc(Math.random() * 100000),
      user1: {
        index: 0,
        name: "",
        sessionId: "",
        field: [],
        ships: [],
      },
      user2: {
        index: 0,
        name: "",
        sessionId: "",
        field: [],
        ships: [],
      },
      indexUser: 0,
      isFull: false,
      turnIndex: 0,
    });

    return this.initialState[newLength - 1].idGame;
  }

  addUserToRoom(idGame: number, { name, sessionId, index }: UserGame) {
    const indexRoom = this.initialState.findIndex(
      (room) => room.idGame === idGame
    );

    this.initialState[indexRoom].user1.index = index;
    this.initialState[indexRoom].user1.sessionId = sessionId;
    this.initialState[indexRoom].user1.name = name;
    this.initialState[indexRoom].indexUser = index;
    this.initialState[indexRoom].isFull = false;

    return this.initialState[indexRoom];
  }

  getAllRooms({ hideFull }: { hideFull?: true } = {}) {
    if (hideFull) {
      return this.initialState.filter((room) => !room.isFull);
    }

    return this.initialState;
  }

  getRoomByIndex(indexRoom: number) {
    const result = this.initialState.find((room) => room.idGame === indexRoom);
    return result;
  }

  getIndexRoomByIdGame(idGame: number) {
    const indexRoom = this.initialState.findIndex(
      (room) => room.idGame === idGame
    );

    return indexRoom;
  }

  getIndexRoomByIdUser(indexUser: number) {
    const indexRoom = this.initialState.findIndex(
      (room) => room.indexUser === indexUser
    );

    return indexRoom;
  }

  connectUserToRoom(idGame: number, user: UserGame) {
    const indexRoom = this.getIndexRoomByIdGame(idGame);

    const room = this.initialState[indexRoom];

    if (room && room?.user1.index) {
      room.user2.index = user.index;
      room.user2.name = user.name;
      room.user2.sessionId = user.sessionId;
      room.isFull = true;

      this.initialState.forEach((state, index) => {
        if (state.indexUser === user.index) {
          this.deleteRoom(index);
        }
      });

      return `${user.name} connected!`;
    }

    return "Connection error!";
  }

  deleteRoom(indexRoom: number) {
    if (indexRoom !== -1) {
      this.initialState.splice(indexRoom, 1);
    }

    return this.initialState;
  }

  addShips({ gameId, ships, indexPlayer }: DataShips): {
    room: GameRoomDB | undefined;
    game: "start" | "wait";
  } {
    const room = this.getRoomByIndex(gameId);

    if (room?.user1.index === indexPlayer) {
      room.user1.field = this.createField(ships);
      room.user1.ships = ships;
    } else if (room?.user2.index === indexPlayer) {
      room.user2.field = this.createField(ships);
      room.user2.ships = ships;
    }

    const isStart =
      room?.user1.ships &&
      room?.user2.ships &&
      room.user1.ships.length > 0 &&
      room?.user2.ships.length > 0;

    return {
      room,
      game: isStart ? "start" : "wait",
    };
  }

  setTurnUser(idGame: number, indexUser: number) {
    const room = this.getRoomByIndex(idGame);

    if (room) {
      room.turnIndex = indexUser;
    }
    return room;
  }

  atack(params: {
    room: GameRoomDB;
    indexPlayer: number;
    x: number;
    y: number;
  }): { status: "shot" | "killed" | "miss" | "Error"; currentUser: UserRoom } {
    const { indexPlayer, room, x, y } = params;
    try {
      if (room.user2.index === indexPlayer) {
        const index = room.user1.field[y][x];
        if (index !== -1) {
          room.user1.ships[index].length -= 1;

          if (room.user1.ships[index].length) {
            return { status: "shot", currentUser: room.user2 };
          }
          return { status: "killed", currentUser: room.user2 };
        } else {
          return { status: "miss", currentUser: room.user2 };
        }
      } else if (room.user1.index === indexPlayer) {
        const index = room.user2.field[y][x];
        if (index !== -1) {
          room.user2.ships[index].length -= 1;

          if (room.user2.ships[index].length) {
            return { status: "shot", currentUser: room.user1 };
          }
          return { status: "killed", currentUser: room.user1 };
        } else {
          return { status: "miss", currentUser: room.user1 };
        }
      }
      return { status: "Error", currentUser: room.user1 };
    } catch (Error) {
      return { status: "Error", currentUser: room.user1 };
    }
  }

  deleteRoomIfUserDisconect(idUser: number) {
    const indexRoom = this.initialState.findIndex(
      (room) => room.user1.index === idUser || room.user2.index === idUser
    );
    if (indexRoom !== -1) {
      this.deleteRoom(indexRoom);

      return `Room with user ID ${idUser} is closed!`;
    }

    return "Error delete room!";
  }
}
