const webSocketServerPort = 8000;
const websocketServer = require('websocket').server;
const http = require('http');
const { connection } = require('websocket');

const server = http.createServer();
server.listen(webSocketServerPort);
console.log('listen to http, port: ' + webSocketServerPort);

const wsServer = new websocketServer({
    httpServer: server
});

const clients = [];

wsServer.on('request', request => {
    //console.log(request.origin);
    const connection = request.accept(null, request.origin);
    clients.push(connection);
    console.log(clients.length);
    
    connection.on('message', (msg) => {
        if(msg.type === 'utf8') {
            clients.forEach((client) => {
                if(client != connection && client != clients[0]) {
                    client.sendUTF(msg.utf8Data);
                }
            })
        }
    });

    connection.on('close', (con) => {
        for(let i = clients.length - 1; i >= 0; i--) {
            if(clients[i] === connection) {
                clients.splice(i, 1);
            }
        }
        console.log('connection closed, now ' + clients.length);
    })
});
