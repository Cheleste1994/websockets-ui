import { DataShips } from "../modules/addShips/addShips";

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}

interface UserRoom {
  index: number;
  name: string;
  sessionId: string;
  ships?: Ship[];
}

interface GameRoom {
  user1: UserRoom;
  user2: UserRoom;
  idGame: number;
  indexUser: number;
  isFull: boolean;
  turnIndex: number;
}

export type GamesRoomType = InstanceType<typeof GamesRoom>;

export default class GamesRoom {
  private initialState: GameRoom[];

  constructor() {
    this.initialState = [];
  }

  createRoom() {
    const newLength = this.initialState.push({
      idGame: Date.now() + Math.trunc(Math.random() * 100000),
      user1: {
        index: 0,
        name: "",
        sessionId: "",
      },
      user2: {
        index: 0,
        name: "",
        sessionId: "",
      },
      indexUser: 0,
      isFull: false,
      turnIndex: 0,
    });

    return this.initialState[newLength - 1].idGame;
  }

  addUserToRoom(idGame: number, user1: UserRoom) {
    const indexRoom = this.initialState.findIndex(
      (room) => room.idGame === idGame
    );

    this.initialState[indexRoom].user1 = user1;
    this.initialState[indexRoom].indexUser = user1.index;
    this.initialState[indexRoom].isFull = false;

    return this.initialState[indexRoom];
  }

  getAllRooms() {
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

  connectUserToRoom(idGame: number, user: UserRoom) {
    const indexRoom = this.getIndexRoomByIdGame(idGame);

    const room = this.initialState[indexRoom];

    if (room && room?.user1.index) {
      room.user2 = user;
      room.isFull = true;

      this.initialState.forEach((state, index) => {
        if (state.indexUser === room.user2.index) {
          this.deleteRoom(index);
        }
      });

      return `${user.name} connected!`;
    }

    return "Connection error!";
  }

  deleteRoom(indexRoom: number) {
    this.initialState.splice(indexRoom, 1);

    return this.initialState;
  }

  addShips({ gameId, ships, indexPlayer }: DataShips): {
    room: GameRoom | undefined;
    game: "start" | "wait";
  } {
    const room = this.getRoomByIndex(gameId);

    if (room?.user1.index === indexPlayer) {
      room.user1.ships = ships;
    } else if (room?.user2.index === indexPlayer) {
      room.user2.ships = ships;
    }

    return {
      room,
      game: room?.user1.ships && room?.user2.ships ? "start" : "wait",
    };
  }

  setTurnUser(idGame: number, indexUser: number) {
    const room = this.getRoomByIndex(idGame);

    if (room) {
      room.turnIndex = indexUser;
    }
    return room;
  }
}
