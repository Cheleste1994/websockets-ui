import { GamesRoomType, Ship } from "../../db/GameRooms";
import { SessionDBType } from "../../db/SessionDB";
import { DataMessage } from "../messageHandlers";

export type DataShips = {
  gameId: number;
  ships: Ship[];
  indexPlayer: number;
};

type PropsAddShips = {
  dbSession: SessionDBType;
  dbRoom: GamesRoomType;
  parsedMessage: DataMessage<DataShips>;
};

export const addShips = (props: PropsAddShips) => {
  const { dbSession, dbRoom, parsedMessage } = props;

  const { data, id } = parsedMessage;

  const { room, game } = dbRoom.addShips(data);

  if (game === "start") {
    const dataUser1 = JSON.stringify({
      ships: room?.user1.ships,
      currentPlayerIndex: room?.user1.index,
    });

    const responseStartGame = JSON.stringify({
      type: "start_game",
      data: dataUser1,
      id,
    });

    if (room?.user1.sessionId && room?.user2.sessionId) {
      dbSession
        .getUserSession(room.user1.sessionId)
        .ws.send(responseStartGame);
      dbSession
        .getUserSession(room.user2.sessionId)
        .ws.send(responseStartGame);

      const dataTurn = JSON.stringify({
        currentPlayer: room?.user1.index,
      });

      const responseTurn = JSON.stringify({
        type: "turn",
        data: dataTurn,
        id,
      });

      dbSession.getUserSession(room.user1.sessionId).ws.send(responseTurn, () => {
        console.log(`Game start! Turn: ${room.user1}.`)
      });
    }
  }
};
