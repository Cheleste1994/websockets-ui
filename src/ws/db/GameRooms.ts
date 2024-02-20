interface UserRomm {
  index: number;
  name: string;
  sessionId: string;
}

interface GameRoom {
  user1: UserRomm;
  user2: UserRomm;
  idGame: number;
  idPlayer: number;
}

export default class GamesRoom {
  private initialState: GameRoom[];

  constructor() {
    this.initialState = [];
  }

  createRoom() {
    const newLength = this.initialState.push({
      idGame: Date.now() + Math.trunc(Math.random() * 100000),
      idPlayer: 1,
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
    });

    return this.initialState[newLength - 1].idGame;
  }

  addUserToRoom(idGame: number, user1: UserRomm) {
    const indexRoom = this.initialState.findIndex(
      (room) => room.idGame === idGame
    );

    this.initialState[indexRoom].user1 = user1;

    return this.initialState[indexRoom];
  }

  getAllRooms() {
    return this.initialState;
  }

  getRoomByIndex(indexRoom: number) {
    const result = this.initialState.find((room) => room.idGame === indexRoom);
    return result;
  }

  connectUserToRoom(idGame: number, user: UserRomm) {
    const indexRoom = this.initialState.findIndex(
      (room) => room.idGame === idGame
    );

    const room = this.initialState[indexRoom];

    if (room && room?.user1.index) {
      room.user2 = user;

      this.deleteRoom(indexRoom);
      return `${user.name} connected!`;
    }

    return "Connection error!";
  }

  deleteRoom(indexRoom: number) {
    this.initialState.splice(indexRoom, 1);

    return this.initialState;
  }
}
