import GamesRoom from "../db/GameRooms";
import { SessionDBType } from "../db/SessionDB";
import UsersDB from "../db/UsersDB";
import { addShips, DataShips } from "./addShips/addShips";
import { connectUserToRoom } from "./connectUserToRoom/connectUserToRoom";
import { createRoom } from "./createRoom/createRoom";
import reg from "./reg/reg";

export type DataType = { name: string; password: string; indexRoom: number };

export type DataMessage<T> = {
  type: string;
  data: T;
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

  const parsedMessage = JSON.parse(message);

  let { data, type, id } = parsedMessage as DataMessage<DataType>;

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
      createRoom({
        dbRoom,
        dbSession,
        dbUser,
        sessionId,
      });
      break;
    case "add_user_to_room":
      connectUserToRoom({
        dbRoom,
        dbSession,
        parsedMessage: { data, type, id },
        sessionId,
      });
      break;
    case "add_ships":
      addShips({
        dbRoom,
        dbSession,
        parsedMessage: { data: data as unknown as DataShips, type, id },
        sessionId,
      });
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
