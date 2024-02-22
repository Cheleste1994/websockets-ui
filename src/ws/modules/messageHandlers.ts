import { GamesRoomDBType } from "../db/GameRoomsDB";
import { SessionDBType } from "../db/SessionDB";
import { UserDBType } from "../db/UsersDB";
import { addShips, DataShips } from "./addShips/addShips";
import { attack, DataAttack } from "./attack/attack";
import { connectUserToRoom } from "./connectUserToRoom/connectUserToRoom";
import { createRoom } from "./createRoom/createRoom";
import { DataRandomAttack, randomAttack } from "./randomAttack/randomAttack";
import reg from "./reg/reg";
import { updateAllRooms } from "./update/updateAllRooms";
import { updateWinners } from "./update/updateWinners";

export type DataType = { name: string; password: string; indexRoom: number };

export type DataMessage<T> = {
  type: string;
  data: T;
  id: number;
};

type PropsUsers = {
  dbSession: SessionDBType;
  dbRoom: GamesRoomDBType;
  dbUser: UserDBType;
  sessionId: string;
};

export default function messageHandlers(message: string, props: PropsUsers) {
  const { dbSession, sessionId, dbRoom, dbUser } = props;

  const parsedMessage = JSON.parse(message);

  let { data, type, id } = parsedMessage as DataMessage<DataType>;

  if (typeof data === "string" && data !== "") {
    data = JSON.parse(data);
  }

  console.group(`Received message ↓`);
  console.log(`Type: ${type}, ID: ${id}`);
  console.log(data);
  console.groupEnd();

  switch (type) {
    case "reg":
      reg({
        dbUser,
        dbSession,
        parsedMessage: { data, type, id },
        sessionId,
      });
      const update = () => {
        updateAllRooms({ dbRoom, dbSession });
        updateWinners({
          dbSession,
          dbUser,
        });
      };

      setTimeout(update, 0);
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
      });
      break;
    case "attack":
      const { isWin, indexPlayerWin } = attack({
        dbRoom,
        dbSession,
        parsedMessage: { data: data as unknown as DataAttack, type, id },
      });

      if (indexPlayerWin !== -1 && isWin) {
        dbUser.addWinByUserIndex(indexPlayerWin);

        updateWinners({ dbSession, dbUser });
      }
      break;
    case "randomAttack":
      randomAttack({
        dbRoom,
        dbSession,
        parsedMessage: { data: data as unknown as DataRandomAttack, type, id },
      });
      break;
    default:
      console.log("Unknown message type:", type);
  }
}
