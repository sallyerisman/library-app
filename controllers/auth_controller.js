/*  Authorization controller */
const bcrypt = require("bcryptjs");
const { matchedData, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Issue an access token and a refresh token for a user
const login = async (req, res) => {
	const user = await User.login(req.body.username, req.body.password);
	if (!user) {
		res.status(401).send({
			status: 'fail',
			data: 'Authentication Required.',
		});
		return;
	}

	// Construct jwt payload
	const payload = {
		data: {
			id: user.get('id'),
			username: user.get('username'),
			is_admin: user.get('is_admin'),
		}
	};

	// Sign payload and get jwt access token
	const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFETIME || "1h" });
	// const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

	// Sign payload and get jwt refresh token
	const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_LIFETIME || "1w" });

	res.send({
		status: 'success',
		data: {
			accessToken,
			refreshToken,
		},
	});
}

const refresh = (req, res) => {
	const token = getTokenfromHeaders(req);
	if (!token) {
		res.status(401).send({
			status: 'fail',
			data: 'No token found in request headers.',
		});
		return;
	}

	try {
		// Verify token using the refresh token secret
		const { data } = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

		// Construct new payload
		const payload = {
			data,
		}

		// Issue a new token using the access token secret
		const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFETIME || "1h"});

		res.send({
			status: 'success',
			data: {
				access_token,
			},
		});

	} catch {
		res.status(403).send({
			status: 'fail',
			data: 'Invalid token.',
		});
		return;
	}
}


// Register account

const register = async (req, res) => {
	// Find any validation errors and wrap them in an object
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(422).send({
			status: 'fail',
			data: errors.array(),
		});
		return;
	}

	const validData = matchedData(req);

	// Generate a hash of `validData.password`
	try {
		validData.password = await bcrypt.hash(validData.password, User.hashSaltRounds); // hash.salt is returned from bcrypt.hash()

	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: 'Exception thrown when hashing the password.',
		});
		throw error;
	}

	try {
		const user = await new User(validData).save();
		console.log("Created new user successfully:", user);

		res.status(201).send({
			status: 'success',
			data: null,
		});

	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: 'Exception thrown in database when creating a new user.',
		});
		throw error;
	}
}


// Get token from HTTP headers
const getTokenfromHeaders = (req) => {
	// Check if authorization header exists
	if (!req.headers.authorization) {
		return false;
	}

	// Split authorization header into its components
	const [authType, token] = req.headers.authorization.split(' ');

	// Check that the authorization type is Bearer
	if (authType.toLowerCase() !== "bearer") {
		return false;
	}

	return token;
}

module.exports = {
	login,
	refresh,
	register,
	getTokenfromHeaders,
}

