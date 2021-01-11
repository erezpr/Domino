const express = require('express');
const router = express.Router();
const chatManagement = require('./chatRouter');
const auth = require('./auth');

router.get('/', auth.userAuthentication, (req, res) => {
	const userName = auth.getUserInfo(req.session.id).name;
	res.json({name:userName});
});

router.get('/allUsers', auth.userAuthentication, (req, res) => {	
	res.json(auth.userList);
});

router.post('/addUser', auth.addUserToAuthList, (req, res) => {		
	res.sendStatus(200);	
});

router.get('/logout', [
	(req, res, next) => {	
		next(); 
	}, 
	auth.removeUserFromAuthList, 
	(req, res) => {
		res.sendStatus(200);		
	}] 
);

module.exports = router; 