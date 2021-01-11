const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const userRouter = require('./server/usersRouter');
const chatRouter = require('./server/chatRouter');
const gamesRouter = require('./server/gamesRouter');
const gameRouter = require('./server/gameRouter');
const app = express();

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 269999999999 } }));
app.use('/users', bodyParser.text());
app.use('/games', bodyParser.text());
app.use('/games/enterGame', bodyParser.json());
app.use('/game', bodyParser.text());
app.use('/game/updateGameDetails', bodyParser.json());
app.use('/game/updatePlayerDetails', bodyParser.json());
app.use('/game/addTileToBoard', bodyParser.json());
app.use('/game/quiteGame', bodyParser.json());
app.use('/game/updateSurroundingsActivity', bodyParser.json());
app.use('/game/updatePlayerStatistics', bodyParser.json());

app.use(express.static(path.resolve(__dirname, "..", "public")));

app.use('/users', userRouter);
app.use('/chat', chatRouter);
app.use('/game', gameRouter);
app.use('/games', gamesRouter);

app.listen(process.env.PORT || 3000, console.log('Example app listening on port 3000!'));