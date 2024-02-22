import { GamesRoomDBType } from "../../db/GameRoomsDB";
import { SessionDBType } from "../../db/SessionDB";
import { responseMessage } from "../../helpers/responseMessage";
import { DataMessage } from "../messageHandlers";
import { updateAllRooms } from "../update/updateAllRooms";

type PropsCreateRoom = {
  dbSession: SessionDBType;
  dbRoom: GamesRoomDBType;
  parsedMessage: DataMessage<{ indexRoom: number }>;
  sessionId: string;
};

export const connectUserToRoom = (props: PropsCreateRoom) => {
  const { dbSession, sessionId, dbRoom, parsedMessage } = props;

  const currentUser = dbSession.getUserSession(sessionId);

  const { data } = parsedMessage;

  const roomDb = dbRoom.getRoomByIndex(data.indexRoom);

  if (roomDb?.user1.name !== currentUser.name) {
    if (roomDb?.isFull) {
      console.log("The room is occupied!");
      return;
    }

    const result = dbRoom.connectUserToRoom(data.indexRoom, {
      index: currentUser.id,
      name: currentUser.name,
      sessionId: currentUser.sessionId,
    });

    console.log("Result:", result);

    updateAllRooms({ dbRoom, dbSession });

    const responseCreateGame = (idPlayer: number) =>
      responseMessage({
        type: "create_game",
        data: {
          idGame: roomDb?.idGame,
          idPlayer,
        },
      });
    if (roomDb?.user1.index && roomDb?.user2.index) {
      dbSession
        .getUserSession(roomDb.user1.sessionId)
        ?.ws.send(responseCreateGame(roomDb.user1.index));
      dbSession
        .getUserSession(roomDb.user2.sessionId)
        ?.ws.send(responseCreateGame(roomDb.user2.index));

      console.log(
        `Users ${roomDb.user1.name} and ${roomDb.user2.name} install ships!`
      );
    }
  } else {
    console.log("You can not join your room.");
  }
};
