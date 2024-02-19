import { httpServer } from "./src/http_server/index.js";
import WS from "./src/ws/index.js";

const HTTP_PORT = 8181;
const WS_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = WS(WS_PORT);

wss.on('listening', () => {
  console.log(`Start WebSocket server on the ${WS_PORT} port!`)
})



