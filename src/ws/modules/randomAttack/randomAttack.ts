import { GamesRoomDBType } from "../../db/GameRoomsDB";
import { SessionDBType } from "../../db/SessionDB";
import { attack } from "../attack/attack";
import { DataMessage } from "../messageHandlers";

export type DataRandomAttack = {
  gameId: number;
  indexPlayer: number;
};

type PropsAtack = {
  dbSession: SessionDBType;
  dbRoom: GamesRoomDBType;
  parsedMessage: DataMessage<DataRandomAttack>;
};

export const randomAttack = (props: PropsAtack) => {
  const { dbSession, dbRoom, parsedMessage } = props;
  const {
    data: { indexPlayer, gameId },
    id,
  } = parsedMessage;

  const currentRoom = dbRoom.getRoomByIndex(gameId);
  if (currentRoom) {
    const { x, y } = dbRoom.randomCoordinatesForAtack(
      currentRoom.user1.ships.length
    );

    attack({
      dbRoom,
      dbSession,
      parsedMessage: {
        id,
        type: "attack",
        data: { gameId, indexPlayer, x, y },
      },
    });

    console.log(`Random attack: x - ${x}, y - ${y}`);
  }
};
