import { GamesRoomDBType } from "../../db/GameRoomsDB";
import { SessionDBType } from "../../db/SessionDB";
import { UserDBType } from "../../db/UsersDB";
import { updateAllRooms } from "../update/updateAllRooms";

type PropsCreateRoom = {
  dbUser: UserDBType;
  dbSession: SessionDBType;
  dbRoom: GamesRoomDBType;
  sessionId: string;
};

export const createRoom = (props: PropsCreateRoom) => {
  const { dbUser, dbSession, sessionId, dbRoom } = props;

  const currentUser = dbSession.getUserSession(sessionId)

  const roomIndex = dbRoom.getIndexRoomByIdUser(currentUser.id)

  if (roomIndex !== -1 ) {
    console.log(`User ${currentUser.name} already created a room!`)
    return;
  }

  const newRoomId = dbRoom.createRoom();

  console.log(`Room ID - ${newRoomId} created`);

  const user = dbUser.getPlayerByLogin(
    dbSession.getUserSession(sessionId).name
  );

  if (user) {
    dbRoom.addUserToRoom(newRoomId, {
      index: user.id,
      name: user.name,
      sessionId,
    });

    console.log(`User ID - ${user.id} added to room ID - ${newRoomId}`);

    updateAllRooms({ dbRoom, dbSession });
  }
};
