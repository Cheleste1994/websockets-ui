import { GamesRoomType } from "../../db/GameRooms";
import { SessionDBType } from "../../db/SessionDB";
import { UserDBType } from "../../db/UsersDB";
import { updateAllRooms } from "../update/updateAllRooms";

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

    updateAllRooms({ dbRoom, dbSession });
  }
};
