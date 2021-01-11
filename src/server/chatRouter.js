const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./auth');
const games = require('./gamesRouter');

const chatManagement = express.Router();

chatManagement.use(bodyParser.text());

chatManagement.route('/:gameName')
	.get(auth.userAuthentication, (req, res) => {
		let game = games.findGame(req.params.gameName);
		res.json(game.chatContent);
	})
	.post(auth.userAuthentication, (req, res) => {
		let game = games.findGame(req.params.gameName);
		const body = req.body;
		const userInfo = auth.getUserInfo(req.session.id);
		game.chatContent.push({ user: userInfo, text: body });
		res.sendStatus(200);
	});


module.exports = chatManagement; 