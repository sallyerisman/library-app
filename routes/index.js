const express = require('express');
const router = express.Router();

const auth = require("../controllers/middlewares/auth")
const authController = require("../controllers/auth_controller")

const { createRules, updateRules } = require('../validation_rules/user');

/* GET / */
router.get('/', (req, res) => {
	res.send({ status: 'you had me at EHLO' });
});

router.use('/authors', require('./authors_router'));
router.use('/books', require('./books_router'));

// Add ability to log in and get JWT access toke and refresh token
router.post("/login", authController.login);

// Add ability to refresh token
router.post("/refresh", authController.refresh);

// Add ability to register
router.post("/register", createRules, authController.register);

// Add ability to validate JWTs
router.use('/profile', [auth.validateJWT], require('./profile_router'));

// /* With HTTP Basic */
// router.use('/profile', [auth.basic], require('./profile_router'));

// router.use('/users', require('./users_router'));

module.exports = router;
