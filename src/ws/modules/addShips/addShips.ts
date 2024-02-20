import { GamesRoomType } from "../../db/GameRooms";
import { SessionDBType } from "../../db/SessionDB";
import { DataMessage } from "../messageHandlers";

export type DataShips = {
  gameId: number;
  ships: [
    {
      position: {
        x: number;
        y: number;
      };
      direction: boolean;
      length: number;
      type: "small" | "medium" | "large" | "huge";
    }
  ];
  indexPlayer: number;
};

type PropsAddShips = {
  dbSession: SessionDBType;
  dbRoom: GamesRoomType;
  parsedMessage: DataMessage<DataShips>;
  sessionId: string;
};

export const addShips = (props: PropsAddShips) => {
  const { dbSession, sessionId, dbRoom, parsedMessage } = props;

  const currentUser = dbSession.getUserSession(sessionId);

  const { data, id } = parsedMessage;

  console.log(data.ships);
};
