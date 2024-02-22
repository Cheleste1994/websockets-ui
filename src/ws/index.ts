import { WebSocketServer } from "ws";
import GamesRoom from "./db/GameRooms";
import SessionDB from "./db/SessionDB";
import UsersDB from "./db/UsersDB";
import messageHandlers from "./modules/messageHandlers";
import { updateAllRooms } from "./modules/update/updateAllRooms";

export default function WS(port: number) {
  const wss = new WebSocketServer({ port });
  const dbSession = new SessionDB();
  const dbUser = new UsersDB();
  const dbRoom = new GamesRoom();

  wss.on("connection", (ws, req) => {
    const sessionId = req.headers["sec-websocket-key"] || "anonymous";

    console.log("New client connected. Session ID:", sessionId);

    const currentUser = dbSession.setUserSession(ws, sessionId);

    currentUser?.ws.on("message", (message) => {
      console.log(`Received message: ${message}`);

      messageHandlers(message.toString(), {
        dbSession,
        sessionId,
        dbRoom,
        dbUser,
      });
    });
    currentUser?.ws.on("close", () => {
      const resultSession = dbSession.deleteUserSession(sessionId);
      console.log(`Client ID ${sessionId} ${resultSession}!`);

      const idUser = dbSession.getUserSession(sessionId)?.id;
      if (idUser) {
        const resultRoom = dbRoom.deleteRoomIfUserDisconect(idUser);

        console.log(resultRoom);
      }

      updateAllRooms({ dbRoom, dbSession });
    });
  });

  return wss;
}
