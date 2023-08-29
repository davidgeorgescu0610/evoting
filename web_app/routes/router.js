const express = require("express")
var path = require("path")
const route = express.Router()
const verifyJwt = require('../utils/jwt');

//PAGES
route.get('/', (request, response) => {
    response.sendFile(path.resolve('./frontend/views/home.html'));
})

route.get('/login', (request, response) => {
    response.sendFile(path.resolve('./frontend/views/login.html'));
})

route.get('/register', (request, response) => {
    response.sendFile(path.resolve('./frontend/views/register.html'));
})

route.get('/verify_email', (request, response) => {
    response.sendFile(path.resolve('./frontend/views/verify_email.html'));
})

route.get('/invalid_token', (request, response) => {
    response.sendFile(path.resolve('./frontend/views/invalid_token.html'));
})

route.get('/link_expired', (request, response) => {
    response.sendFile(path.resolve('./frontend/views/link_expired.html'));
})

route.get('/login_warn', (request, response) => {
    response.sendFile(path.resolve('./frontend/views/login_warn.html'));
})

route.get('/voting', (request, response) => {
    response.sendFile(path.resolve('./frontend/views/voting.html'));
})

route.get('/admin', (request, response) => {
    response.sendFile(path.resolve('./frontend/views/admin.html'));
})

//API
const authController = require('../controller/authController');
const votingController = require('../controller/votingController');
const adminController = require('../controller/adminController');

route.post('/api/auth/login', authController.login);
route.post('/api/auth/register', authController.register);
route.get('/api/auth/refresh', authController.refresh);
route.post('/api/auth/logout', authController.logout);
route.get('/api/auth/email/:id/verify/:token', authController.email_verification)

route.get('/api/voting/getVotingSessions', verifyJwt, votingController.getVotingSessions);
route.post('/api/voting/getCandidates', verifyJwt, votingController.getCandidates);
route.post('/api/voting/sendVote', verifyJwt, votingController.sendVote);
route.post('/api/voting/getResults', verifyJwt, votingController.getResults);

route.post('/api/admin/addVotingSession', verifyJwt, adminController.addVotingSession);
route.post('/api/admin/startVote', verifyJwt, adminController.startVote);
route.post('/api/admin/stopVote', verifyJwt, adminController.stopVote);

module.exports = route