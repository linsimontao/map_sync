const webSocketServerPort = 8000;
const websocketServer = require('websocket').server;
const http = require('http');

const server = http.createServer();
server.listen(webSocketServerPort);
console.log('listen to http, port: ' + webSocketServerPort);

const wsServer = new websocketServer({
    httpServer: server
});

const clients = [];

wsServer.on('request', request => {
    console.log(request.origin);
    const connection = request.accept(null, request.origin);
    clients.push(connection);

    connection.on('message', (msg) => {
        if(msg.type === 'utf8') {
            clients.forEach((client) => {
                if(client != connection) {
                    client.sendUTF(msg.utf8Data);
                }
            })
        }
    });
});
