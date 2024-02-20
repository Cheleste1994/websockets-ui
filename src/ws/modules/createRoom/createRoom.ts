import { GamesRoomType } from "../../db/GameRooms";
import { SessionDBType } from "../../db/SessionDB";
import { UserDBType } from "../../db/UsersDB";

type PropsCreateRoom = {
  dbUser: UserDBType;
  dbSession: SessionDBType;
  dbRoom: GamesRoomType;
  sessionId: string;
};

export const createRoom = (props: PropsCreateRoom) => {
  const { dbUser, dbSession, sessionId, dbRoom } = props;

  const newRoomId = dbRoom.createRoom();

  const user = dbUser.getPlayerByLogin(
    dbSession.getUserSession(sessionId).name
  );

  if (user) {
    dbRoom.addUserToRoom(newRoomId, {
      index: user.id,
      name: user.name,
      sessionId,
    });

    const rooms = dbRoom.getAllRooms().map((room) => ({
      roomId: room.idGame,
      roomUsers: [
        {
          name: room.user1.name,
          index: room.user1.index,
        },
      ],
    }));

    const dataUpdateRoom = JSON.stringify(rooms);

    const responseUpdateRoom = JSON.stringify({
      type: "update_room",
      data: dataUpdateRoom,
    });

    Object.values(dbSession.getAllSessions()).forEach((session) => {
      session.ws.send(responseUpdateRoom);
    });

    console.log(`Rooms update!`);
  }
};
