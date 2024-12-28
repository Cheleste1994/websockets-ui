import { GameRoomDB, Ship } from "../../db/GameRoomsDB";
import { SessionDBType } from "../../db/SessionDB";
import { responseMessage } from "../../helpers/responseMessage";

type PropsWins = {
  currentRoom: GameRoomDB;
  dbSession: SessionDBType;
  nextPlayer: number;
};

export const wins = (props: PropsWins) => {
  const { currentRoom, dbSession, nextPlayer } = props;

  const filter = (ships: Ship[]) => ships.filter((ship) => ship.length > 0);

  const result = filter(
    currentRoom.user1.index === nextPlayer
      ? currentRoom.user1.ships
      : currentRoom.user2.ships
  );

  let isWin = false;

  if (!result.length) {
    const responseTurn = responseMessage({
      type: "finish",
      data: {
        winPlayer: currentRoom.turnIndex,
      },
    });

    dbSession
      .getUserSession(currentRoom.user1.sessionId)
      ?.ws.send(responseTurn);
    dbSession
      .getUserSession(currentRoom.user2.sessionId)
      ?.ws.send(responseTurn, () => {
        console.log(`Finish. Winner ID: ${currentRoom.turnIndex}!`);
      });
    isWin = true;
  }

  return { isWin, indexPlayerWin: isWin ? currentRoom.turnIndex : -1 };
};
