import { GamesRoomDBType } from "../../db/GameRoomsDB";
import { SessionDBType } from "../../db/SessionDB";
import { responseMessage } from "../../helpers/responseMessage";

type PropsUpdateAllRooms = {
  dbSession: SessionDBType;
  dbRoom: GamesRoomDBType;
  sessionId: string;
};

export const updateSession = (props: PropsUpdateAllRooms) => {
  const { dbRoom, dbSession, sessionId } = props;

  const rooms = dbRoom.getAllRooms({ hideFull: true }).map((room) => ({
    roomId: room.idGame,
    roomUsers: [
      {
        name: room.user1.name,
        index: room.user1.index,
      },
      {
        name: room.user2.name,
        index: room.user2.index,
      },
    ],
  }));

  const responseUpdateRoom = responseMessage({
    type: "update_room",
    data: rooms,
  });

  dbSession.getUserSession(sessionId)?.ws.send(responseUpdateRoom);

  console.log(`Session ${sessionId} update!`);
};
