import { GamesRoomDBType } from "../../db/GameRoomsDB";
import { SessionDBType } from "../../db/SessionDB";
import { responseMessage } from "../../helpers/responseMessage";

type PropsUpdateAllRooms = {
  dbSession: SessionDBType;
  dbRoom: GamesRoomDBType;
};

export const updateAllRooms = (props: PropsUpdateAllRooms) => {
  const { dbRoom, dbSession } = props;

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

  Object.values(dbSession.getAllSessions()).forEach((session) => {
    session?.ws.send(responseUpdateRoom);
  });

  console.log(`Rooms update!`);
};
