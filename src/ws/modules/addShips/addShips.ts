import { GamesRoomType, Ship } from "../../db/GameRooms";
import { SessionDBType } from "../../db/SessionDB";
import { responseMessage } from "../../helpers/responseMessage";
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

  const { data } = parsedMessage;

  const { room, game } = dbRoom.addShips(data);

  if (game === "start") {
    const responseStartGame = responseMessage({
      type: "start_game",
      data: {
        ships: room?.user1.ships,
        currentPlayerIndex: room?.user1.index,
      },
    });

    if (room?.user1.sessionId && room?.user2.sessionId) {
      dbSession
        .getUserSession(room.user1.sessionId)
        ?.ws.send(responseStartGame);
      dbSession
        .getUserSession(room.user2.sessionId)
        ?.ws.send(responseStartGame);

      const responseTurn = responseMessage({
        type: "turn",
        data: {
          currentPlayer: room?.user1.index,
        },
      });

      dbSession
        .getUserSession(room.user1.sessionId)
        ?.ws.send(responseTurn, () => {
          room.turnIndex = room.user1.index;
          console.log(
            `Game start! Turn name - ${room.user1.name}, ID - ${room.user1.index}.`
          );
        });
    }
  }
};
