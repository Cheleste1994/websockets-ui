import GamesRoom from "../db/GameRooms";
import SessionDB from "../db/SessionDB";
import UsersDB from "../db/UsersDB";

type DataMessage = {
  type: string;
  data: { name: string; password: string };
  id: number;
};

type PropsUsers = {
  dbSession: SessionDB;
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
      const result = dbUser.authUser({
        name: data.name,
        password: data.password,
      });

      const responseReg = JSON.stringify({
        type,
        data: JSON.stringify(result),
        id,
      });

      currentUser.ws.send(responseReg, (error) => {
        if (error || result.error) {
          dbSession.setAuthUser(sessionId, { name: "", isLogin: false, id: 0 });
          return;
        }

        const user = dbUser.getPlayerByLogin(result.name);

        if (user) {
          dbSession.setAuthUser(sessionId, {
            name: result.name,
            isLogin: true,
            id: user.id,
          });

          console.log(`User ${result.name} login!`);
        }
      });
      break;
    case "create_room":
      const newRoomId = dbRoom.createRoom();

      const user = dbUser.getPlayerByLogin(currentUser.name);

      if (user) {
        dbRoom.addUserToRoom(newRoomId, {
          index: user.index,
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
          session.ws.send(responseUpdateRoom)
        })

        console.log(`Rooms update!`);
      }
      break;
    case "add_user_to_room":
      console.log(type);
      console.log(data);
      break;
    case "add_ships":
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
