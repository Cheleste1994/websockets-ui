import { WebSocketServer } from "ws";
import SessionDB from "./db/SessionDB";
import messageHandlers from "./modules/messageHandlers";

export default function WS(port: number) {
  const wss = new WebSocketServer({ port });
  const dbSession = new SessionDB();

  wss.on("connection", (ws, req) => {
    const sessionId = req.headers["sec-websocket-key"] || "anonymous";

    console.log("New client connected. Session ID:", sessionId);

    const currentUser = dbSession.setUserSession(ws, sessionId);

    currentUser?.ws.on("message", (message) => {
      console.log(`Received message: ${message}`);

      messageHandlers(message.toString(), {
        dbSession,
        sessionId,
      });
    });
    currentUser?.ws.on('close', () => {
      const result = dbSession.deleteUserSession(sessionId)
      console.log(`Client ID ${sessionId} ${result}!`)
    })
  });

  return wss;
}
