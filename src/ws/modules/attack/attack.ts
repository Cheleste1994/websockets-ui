import { GamesRoomDBType } from "../../db/GameRoomsDB";
import { SessionDBType } from "../../db/SessionDB";
import { responseMessage } from "../../helpers/responseMessage";
import { DataMessage } from "../messageHandlers";
import { updateAllRooms } from "../update/updateAllRooms";
import { wins } from "../wins/wins";

export type DataAttack = {
  gameId: number;
  indexPlayer: number;
  x: number;
  y: number;
};

type PropsAttack = {
  dbSession: SessionDBType;
  dbRoom: GamesRoomDBType;
  parsedMessage: DataMessage<DataAttack>;
};

export const attack = (props: PropsAttack) => {
  const { dbSession, dbRoom, parsedMessage } = props;
  const {
    data: { indexPlayer, gameId, x, y },
    type,
  } = parsedMessage;

  const currentRoom = dbRoom.getRoomByIndex(gameId);

  if (!currentRoom) {
    console.log(`Room not found!`);
    return { isWin: false, indexPlayerWin: -1 };
  }

  if (currentRoom?.turnIndex !== indexPlayer) {
    console.log(`Another user's turn!`);
    return { isWin: false, indexPlayerWin: -1 };
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

    let nextPlayer =
      currentRoom.user1.index === indexPlayer
        ? currentRoom.user2.index
        : currentRoom.user1.index;

    if (status === "killed" || status === "shot") {
      const { isWin, indexPlayerWin } = wins({
        currentRoom,
        dbSession,
        nextPlayer,
      });

      if (isWin) {
        const indexRoom = dbRoom.getIndexRoomByIdGame(gameId);
        dbRoom.deleteRoom(indexRoom);
        updateAllRooms({ dbRoom, dbSession });

        return { isWin, indexPlayerWin }
      }

      nextPlayer = indexPlayer;
    }

    const room = dbRoom.setTurnUser(gameId, nextPlayer);

    const responseTurn = responseMessage({
      type: "turn",
      data: {
        currentPlayer: room?.turnIndex,
      },
    });

    if (room?.user1.sessionId && room?.user2.sessionId) {
      dbSession.getUserSession(room?.user1.sessionId)?.ws.send(responseTurn);
      dbSession.getUserSession(room?.user2.sessionId)?.ws.send(responseTurn);
    }
  }

  return { isWin: false, indexPlayerWin: -1 }
};
