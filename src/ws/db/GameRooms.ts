interface UserRomm {
  index: number;
  name: string;
  sessionId: string;
}

interface GameRoom {
  user1: UserRomm;
  user2: UserRomm;
  indexRoom: number;
  idGame: number;
  idPlayer: number;
}

export default class GamesRoom {
  private initialState: GameRoom[];

  constructor() {
    this.initialState = [];
  }

  createRoom() {
    const lastIndex = Math.max(this.initialState.length - 1, 0);

    const newLength = this.initialState.push({
      idGame: Date.now() + Math.trunc(Math.random() * 100000),
      idPlayer: 1,
      indexRoom: this.initialState[lastIndex]?.indexRoom + 1 || 0,
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

  addUserToRoom(idGame: number, user1: UserRomm, user2?: UserRomm) {
    const indexRoom = this.initialState.findIndex(
      (room) => room.idGame === idGame
    );

    if (this.initialState[indexRoom]?.user1 && user2) {
      this.initialState[indexRoom].user2 = user2;
    } else {
      this.initialState[indexRoom].user1 = user1;
    }

    return this.initialState[indexRoom];
  }

  getAllRooms() {
    return this.initialState;
  }
}
