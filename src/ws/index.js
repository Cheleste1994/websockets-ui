import { WebSocketServer } from 'ws';

export default function WS (port) {

  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);

      wss.clients.forEach((client) => {
        client.send(JSON.stringify(JSON.parse(message)));
      });
    });
  });

  return wss;
}
