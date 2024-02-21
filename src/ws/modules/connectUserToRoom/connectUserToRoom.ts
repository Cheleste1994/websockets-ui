import { GamesRoomType } from "../../db/GameRooms";
import { SessionDBType } from "../../db/SessionDB";
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

  const { data, id } = parsedMessage;

  const roomDb = dbRoom.getRoomByIndex(data.indexRoom);

  if (roomDb?.user1.name !== currentUser.name) {
    if (roomDb?.isFull) {
      console.log('The room is occupied!')
      return;
    }

    const result = dbRoom.connectUserToRoom(data.indexRoom, {
      index: currentUser.id,
      name: currentUser.name,
      sessionId: currentUser.sessionId,
    });

    console.log('Result:', result);

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

    const dataUpdateRoom = JSON.stringify(rooms);

    const responseUpdateRoom = JSON.stringify({
      type: "update_room",
      data: dataUpdateRoom,
    });

    Object.values(dbSession.getAllSessions()).forEach((session) => {
      session.ws.send(responseUpdateRoom);

      if (
        session.id === roomDb?.user1.index ||
        session.id === roomDb?.user2.index
      ) {
        const dataGame = JSON.stringify({
          idGame: roomDb.idGame,
          idPlayer: session.id,
        });

        const responseCreateGame = JSON.stringify({
          type: "create_game",
          data: dataGame,
          id,
        });

        session.ws.send(responseCreateGame);
        console.log(`User ${session.name} started the game!`);
      }
    });
  } else {
    console.log("You can not join your room.");
  }
};
