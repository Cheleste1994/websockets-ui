import { GamesRoomType, Ship } from "../../db/GameRooms";
import { SessionDBType } from "../../db/SessionDB";
import { DataMessage } from "../messageHandlers";

export type DataShips = {
  gameId: number;
  ships: Ship[];
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

  const room = dbRoom.addShips(data);

  const dataUserGame = JSON.stringify({
    ships: room?.user1.ships,
    currentPlayerIndex: room?.user1.index
  });

  const responseStartGame = JSON.stringify({
    type: "start_game",
    data: dataUserGame,
    id,
  });

  currentUser.ws.send(responseStartGame, () => {
    console.log("Start game!")
  });
};
