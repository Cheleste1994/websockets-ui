import GamesRoom from "../db/GameRooms";
import SessionDB, { SessionDBType } from "../db/SessionDB";
import UsersDB, { UserDBType } from "../db/UsersDB";
import reg from "./reg/reg";

export type DataMessage = {
  type: string;
  data: { name: string; password: string; indexRoom: number };
  id: number;
};

type PropsUsers = {
  dbSession: SessionDBType;
  sessionId: string;
};

const dbUser = new UsersDB();
const dbRoom = new GamesRoom();

export default function messageHandlers(message: string, props: PropsUsers) {
  const { dbSession, sessionId } = props;

  const currentUser = dbSession.getUserSession(sessionId);

  const parsedMessage = JSON.parse(message);

  let { data, type, id } = parsedMessage as DataMessage;

  if (typeof data === "string" && data !== "") {
    data = JSON.parse(data);
  }

  switch (type) {
    case "reg":
      reg({
        dbUser,
        dbSession,
        parsedMessage: { data, type, id },
        sessionId,
      });
      break;
    case "create_room":
      const newRoomId = dbRoom.createRoom();

      const user = dbUser.getPlayerByLogin(currentUser.name);

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
      break;
    case "add_user_to_room":
      const room = dbRoom.getRoomByIndex(data.indexRoom);

      if (room?.user1.name !== currentUser.name) {
        const result = dbRoom.connectUserToRoom(data.indexRoom, {
          index: currentUser.id,
          name: currentUser.name,
          sessionId: currentUser.sessionId,
        });

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
            session.id === room?.user1.index ||
            session.id === room?.user2.index
          ) {
            const dataGame = JSON.stringify({
              idGame: room.idGame,
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
        console.log(result);
      } else {
        console.log("You can not join your room.");
      }
      break;
    case "add_ships":
      console.log(type);
      console.log(type);
      break;
    case "attack":
      console.log(type);
      break;
    case "randomAttack":
      console.log(type);
      break;
    default:
      console.log("Unknown message type:", type);
  }
}
