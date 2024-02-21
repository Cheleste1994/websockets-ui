import { GamesRoomType } from "../../db/GameRooms";
import { SessionDBType } from "../../db/SessionDB";
import { responseMessage } from "../../helpers/responseMessage";
import { DataMessage } from "../messageHandlers";

export type DataAttack = {
  gameId: number;
  indexPlayer: number;
  x: number;
  y: number;
};

type PropsAttack = {
  dbSession: SessionDBType;
  dbRoom: GamesRoomType;
  parsedMessage: DataMessage<DataAttack>;
};

export const attack = (props: PropsAttack) => {
  const { dbSession, dbRoom, parsedMessage } = props;
  const {
    data: { indexPlayer, gameId, x, y },
    type,
  } = parsedMessage;

  const currentRoom = dbRoom.getRoomByIndex(gameId);

  if (currentRoom?.turnIndex !== indexPlayer) {
    console.log(`Another user's turn!`);
    return;
  }

  if (currentRoom) {
    const { status, currentUser } = dbRoom.atack({
      room: currentRoom,
      indexPlayer,
      x,
      y,
    });

    const responseAtack = responseMessage({
      type,
      data: {
        position: {
          x,
          y,
        },
        currentPlayer: indexPlayer,
        status,
      },
    });

    dbSession
      .getUserSession(currentUser.sessionId)
      .ws.send(responseAtack, () => {
        console.log("Atack:", status);
      });

    const room = dbRoom.setTurnUser(
      gameId,
      currentRoom.user1.index === indexPlayer
        ? currentRoom.user2.index
        : currentRoom.user1.index
    );

    const responseTurn = responseMessage({
      type: "turn",
      data: {
        currentPlayer: room?.turnIndex,
      },
    });

    if (room?.user1.sessionId && room?.user2.sessionId) {
      dbSession.getUserSession(room?.user1.sessionId).ws.send(responseTurn);
      dbSession.getUserSession(room?.user2.sessionId).ws.send(responseTurn);
    }
  }
};
