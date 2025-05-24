const WebSocket = require('ws');
const { createGameState, updateGameState } = require('./gameState');

const wss = new WebSocket.Server({ port: 8080 });
const clients = [];

let gameState = createGameState();

console.log('Robot foci szerver elindult a 8080-as porton.');

wss.on('connection', (ws) => {
    if (clients.length >= 2) {
        ws.send(JSON.stringify({ type: 'error', message: 'A játék tele van.' }));
        ws.close();
        return;
    }

    const playerId = clients.length;
    clients.push(ws);
    ws.send(JSON.stringify({ type: 'init', playerId }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'input') {
                gameState.players[playerId].direction = data.direction;
            }

            if (data.type === 'restart') {
                gameState = createGameState();
                const update = JSON.stringify({ type: 'update', state: gameState });
                clients.forEach((client) => client.send(update));
            }

        } catch (err) {
            console.error('Érvénytelen üzenet:', message);
        }
    });

    ws.on('close', () => {
        clients.splice(clients.indexOf(ws), 1);
        gameState = createGameState();
    });
});

setInterval(() => {
    if (clients.length === 2 && !gameState.gameOver) {
        updateGameState(gameState);

        clients.forEach((client, index) => {
            const update = JSON.stringify({
                type: 'update',
                state: gameState,
                playerId: index
            });
            client.send(update);
        });
    }
}, 50);
