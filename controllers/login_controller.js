/*  Login controller */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res) => {
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
		sub: user.get('id'),
		username: user.get('username'),
		// is_admin: user.get('is_admin'),
	};

	// Sign payload and get jwt access token
	const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFETIME || "1h" });
	// const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

	// Sign payload and get jwt refresh token
	const refresh_token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_LIFETIME || "1w" });

	res.send({
		status: 'success',
		data: {
			access_token,
			refresh_token,
		},
	});
}





