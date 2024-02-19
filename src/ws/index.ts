import { WebSocketServer } from 'ws';

export default function WS (port: number) {

  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message: any) => {
      console.log(`Received message: ${message}`);

      wss.clients.forEach((client: any) => {
        client.send(JSON.stringify(JSON.parse(message)));
      });
    });
  });

  return wss;
}
