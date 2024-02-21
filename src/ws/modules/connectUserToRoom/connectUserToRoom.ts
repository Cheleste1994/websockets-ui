import { GamesRoomType } from "../../db/GameRooms";
import { SessionDBType } from "../../db/SessionDB";
import { responseMessage } from "../../helpers/responseMessage";
import { DataMessage } from "../messageHandlers";

type PropsCreateRoom = {
  dbSession: SessionDBType;
  dbRoom: GamesRoomType;
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

    const rooms = dbRoom.getAllRooms().map((room) => ({
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
      session.ws.send(responseUpdateRoom);

      if (
        session.id === roomDb?.user1.index ||
        session.id === roomDb?.user2.index
      ) {
        const responseCreateGame = responseMessage({
          type: "create_game",
          data: {
            idGame: roomDb.idGame,
            idPlayer: session.id,
          },
        });

        session.ws.send(responseCreateGame);
        console.log(`User ${session.name} started the game!`);
      }
    });
  } else {
    console.log("You can not join your room.");
  }
};
